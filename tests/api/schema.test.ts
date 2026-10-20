import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SGF_PUBLIC_GET_PATHS } from '../../src/lib/server/api/factory';
import { fetchSgfApiSchema, parseLocalSchemaOrigin } from '../../scripts/fetch-sgf-api-schema';
import { canonicalOpenApiSnapshotText } from '../../scripts/lib/schema-bytes';

const schemaPath = new URL('../../openapi/sgf-public-v1.openapi.json', import.meta.url);

async function withTempFile(fn: (path: string) => Promise<void>) {
	const dir = await mkdtemp(join(tmpdir(), 'sgf-schema-'));
	try {
		await fn(join(dir, 'schema.json'));
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
}

describe('public OpenAPI schema', () => {
	it('matches the anonymous client path allowlist', async () => {
		const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
		assert.deepEqual([...SGF_PUBLIC_GET_PATHS].sort(), Object.keys(schema.paths).sort());
	});

	it('accepts only loopback schema origins without credentials, paths or query strings', () => {
		for (const origin of ['//127.0.0.1', 'ftp://127.0.0.1', 'http://user:pass@127.0.0.1',
			'http://127.0.0.1/api', 'http://127.0.0.1?q=1', 'http://127.0.0.1#x', 'https://cms.sgf.dev']) {
			assert.throws(() => parseLocalSchemaOrigin(origin), origin);
		}
		for (const host of ['localhost', '127.0.0.1', '[::1]']) {
			assert.equal(parseLocalSchemaOrigin(`http://${host}:5099/`), `http://${host}:5099`);
		}
	});

	it('normalizes line endings and terminal newlines, rejecting malformed JSON', () => {
		assert.equal(canonicalOpenApiSnapshotText('{\r\n  "openapi": "3.0.0"\r\n}\r\n\r\n'), '{\n  "openapi": "3.0.0"\n}');
		assert.throws(() => canonicalOpenApiSnapshotText('{bad json'), SyntaxError);
	});

	it('fetches anonymously without redirects and writes normalized JSON', async () => {
		await withTempFile(async outputPath => {
			await fetchSgfApiSchema({
				schemaOrigin: 'http://127.0.0.1:5099', outputPath,
				fetchImpl: async (url, init) => {
					assert.equal(String(url), 'http://127.0.0.1:5099/umbraco/openapi/sgf-public-v1.json');
					assert.equal(init?.credentials, 'omit');
					assert.equal(init?.redirect, 'error');
					return new Response('{"openapi":"3.0.0"}\r\n');
				}
			});
			assert.equal(await readFile(outputPath, 'utf8'), '{"openapi":"3.0.0"}');
		});
	});

	it('keeps the previous file after HTTP, JSON or network failures', async () => {
		await withTempFile(async outputPath => {
			await writeFile(outputPath, 'previous schema');
			for (const fetchImpl of [
				async () => new Response('unavailable', { status: 503 }),
				async () => new Response('{bad json'),
				async () => { throw new TypeError('network failure'); }
			]) {
				await assert.rejects(fetchSgfApiSchema({ schemaOrigin: 'http://127.0.0.1:5099', outputPath, fetchImpl }));
				assert.equal(await readFile(outputPath, 'utf8'), 'previous schema');
			}
		});
	});
});
