import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const schemaPath = new URL('../../openapi/sgf-public-v1.openapi.json', import.meta.url);
const generatedPath = new URL('../../src/lib/server/api/generated/sgfPublicApiSchema.d.ts', import.meta.url);

describe('committed SGF OpenAPI snapshot', () => {
	it('matches the reviewed backend export and contains only the public directory routes', async () => {
		const text = await readFile(schemaPath, 'utf8');
		const hash = createHash('sha256').update(text).digest('hex');
		const document = JSON.parse(text);

		assert.equal(hash, '10f5cde32b8132ccb5b89cf94d7ce3974f36a3c2f61df15d40fea18c7bbdc89b');
		assert.deepEqual(Object.keys(document.paths).sort(), [
			'/api/directory/filters/skills',
			'/api/directory/search',
			'/api/tags/skills'
		]);
	});

	it('keeps the generated public API as legacy arrays, not a fake paged shape', async () => {
		const generated = await readFile(generatedPath, 'utf8');

		assert.match(generated, /"application\/json": string\[\];/);
		assert.match(generated, /"application\/json": components\["schemas"\]\["PublicSkillFilterDto"\]\[\];/);
		assert.match(generated, /"application\/json": components\["schemas"\]\["PublicDirectoryMemberDto"\]\[\];/);
		assert.doesNotMatch(generated, /PagedResult|items:/);
	});
});
