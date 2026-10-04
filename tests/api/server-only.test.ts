import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('../..', import.meta.url).pathname;

describe('server-only API modules', () => {
	it('keeps the generated client under src/lib/server', async () => {
		const client = await readFile(join(root, 'src/lib/server/api/client.ts'), 'utf8');
		assert.match(client, /\$app\/env\/private/);

		const generated = relative(root, join(root, 'src/lib/server/api/generated/sgfPublicApiSchema.d.ts'));
		assert.equal(generated, 'src/lib/server/api/generated/sgfPublicApiSchema.d.ts');
	});

	it('does not import server API modules from browser-reachable source files', async () => {
		const offenders: string[] = [];
		for (const file of await listSourceFiles(join(root, 'src'))) {
			const rel = relative(root, file);
			if (rel.startsWith('src/lib/server/') || rel.endsWith('.server.ts')) continue;

			const text = await readFile(file, 'utf8');
			if (/from ['"](?:\$lib\/server\/api|\.\.\/.*lib\/server\/api|.*\/lib\/server\/api)/.test(text)) {
				offenders.push(rel);
			}
		}

		assert.deepEqual(offenders, []);
	});
});

async function listSourceFiles(dir: string): Promise<string[]> {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async (entry) => {
			const path = join(dir, entry.name);
			if (entry.isDirectory()) return listSourceFiles(path);
			if (/\.(?:ts|svelte)$/.test(entry.name)) return [path];
			return [];
		})
	);

	return files.flat();
}
