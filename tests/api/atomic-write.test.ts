import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeFileAtomically } from '../../scripts/lib/atomic-write';

async function withTempDir<T>(fn: (dir: string) => Promise<T>): Promise<T> {
	const dir = await mkdtemp(join(tmpdir(), 'sgf-atomic-write-'));
	try {
		return await fn(dir);
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
}

describe('atomic API artifact writes', () => {
	it('renames a complete temp file over the target in the same directory', async () => {
		await withTempDir(async (dir) => {
			const target = join(dir, 'artifact.txt');
			const temp = join(dir, '.artifact.txt.tmp');
			await writeFile(target, 'old\n');

			await writeFileAtomically(target, 'new\n', { tempName: () => temp });

			assert.equal(await readFile(target, 'utf8'), 'new\n');
			assert.deepEqual(await readdir(dir), ['artifact.txt']);
		});
	});

	it('keeps the old artifact and removes the temp file when writing fails', async () => {
		await withTempDir(async (dir) => {
			const target = join(dir, 'artifact.txt');
			const temp = join(dir, '.artifact.txt.tmp');
			await writeFile(target, 'old\n');

			await assert.rejects(
				writeFileAtomically(target, 'new\n', {
					tempName: () => temp,
					writeTempFile: async (tempPath) => {
						await writeFile(tempPath, 'partial\n');
						throw new Error('simulated write failure');
					}
				}),
				/simulated write failure/
			);

			assert.equal(await readFile(target, 'utf8'), 'old\n');
			assert.deepEqual(await readdir(dir), ['artifact.txt']);
		});
	});

	it('keeps the old artifact and removes the temp file when rename fails', async () => {
		await withTempDir(async (dir) => {
			const target = join(dir, 'artifact.txt');
			const temp = join(dir, '.artifact.txt.tmp');
			await writeFile(target, 'old\n');

			await assert.rejects(
				writeFileAtomically(target, 'new\n', {
					tempName: () => temp,
					renameTempFile: async () => {
						throw new Error('simulated rename failure');
					}
				}),
				/simulated rename failure/
			);

			assert.equal(await readFile(target, 'utf8'), 'old\n');
			assert.deepEqual(await readdir(dir), ['artifact.txt']);
		});
	});
});
