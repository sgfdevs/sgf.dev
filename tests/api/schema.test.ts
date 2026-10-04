import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SGF_PUBLIC_GET_PATHS } from '../../src/lib/server/api/factory';
import { fetchSgfApiSchema, parseLocalSchemaOrigin } from '../../scripts/fetch-sgf-api-schema';
import { renderSgfApiTypes } from '../../scripts/generate-sgf-api';
import {
	SGF_PUBLIC_SCHEMA_CANONICAL_SHA256,
	SGF_PUBLIC_SCHEMA_RAW_EXPORT_SHA256,
	canonicalOpenApiSnapshotText,
	normalizeOpenApiSnapshotText,
	sha256Text
} from '../../scripts/lib/schema-bytes';

const schemaPath = new URL('../../openapi/sgf-public-v1.openapi.json', import.meta.url);
const generatedPath = new URL('../../src/lib/server/api/generated/sgfPublicApiSchema.d.ts', import.meta.url);

async function withTempDir<T>(fn: (dir: string) => Promise<T>): Promise<T> {
	const dir = await mkdtemp(join(tmpdir(), 'sgf-schema-'));
	try {
		return await fn(dir);
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
}

describe('committed SGF OpenAPI snapshot', () => {
	it('matches the reviewed backend export and contains only the public directory, Home, member, group and leadership routes', async () => {
		const text = await readFile(schemaPath, 'utf8');
		const document = JSON.parse(text);

		assert.equal(sha256Text(text), SGF_PUBLIC_SCHEMA_CANONICAL_SHA256);
		assert.equal(SGF_PUBLIC_SCHEMA_CANONICAL_SHA256, SGF_PUBLIC_SCHEMA_RAW_EXPORT_SHA256);
		assert.deepEqual(Object.keys(document.paths).sort(), [
			'/api/directory/filters/skills',
			'/api/directory/search',
			'/api/tags/skills',
			'/api/v1/public/groups',
			'/api/v1/public/groups/{slug}',
			'/api/v1/public/home',
			'/api/v1/public/leadership',
			'/api/v1/public/members/{username}'
		]);
		assert.deepEqual([...SGF_PUBLIC_GET_PATHS].sort(), Object.keys(document.paths).sort());
	});

	it('keeps directory errors as ProblemDetails and adds the real Home operation', async () => {
		const document = JSON.parse(await readFile(schemaPath, 'utf8'));
		const searchResponses = document.paths['/api/directory/search'].get.responses;
		const homeResponses = document.paths['/api/v1/public/home'].get.responses;

		assert.deepEqual(Object.keys(searchResponses['200'].content), ['application/json']);
		assert.deepEqual(Object.keys(searchResponses['400'].content), ['application/problem+json']);
		assert.deepEqual(searchResponses['400'].content['application/problem+json'].schema, {
			$ref: '#/components/schemas/ProblemDetails'
		});

		assert.equal(document.paths['/api/v1/public/home'].get.operationId, 'PublicHome_Get');
		assert.deepEqual(Object.keys(homeResponses['200'].content), ['application/json']);
		assert.deepEqual(homeResponses['200'].content['application/json'].schema, {
			$ref: '#/components/schemas/PublicHomeDto'
		});
		assert.deepEqual(homeResponses['404'].content['application/problem+json'].schema, {
			$ref: '#/components/schemas/ProblemDetails'
		});
	});

	it('adds the real required member path and explicit profile response', async () => {
		const document = JSON.parse(await readFile(schemaPath, 'utf8'));
		const get = document.paths['/api/v1/public/members/{username}'].get;
		assert.equal(get.operationId, 'PublicMember_Get');
		assert.deepEqual(get.parameters, [{ name: 'username', in: 'path', required: true, schema: { type: 'string' } }]);
		assert.deepEqual(get.responses['200'].content['application/json'].schema, { $ref: '#/components/schemas/PublicMemberProfileDto' });
		assert.deepEqual(get.responses['404'].content['application/problem+json'].schema, { $ref: '#/components/schemas/ProblemDetails' });
	});

	it('keeps the generated public API as legacy directory arrays plus backend Home DTOs', async () => {
		const generated = await readFile(generatedPath, 'utf8');

		assert.match(generated, /"application\/json": string\[\];/);
		assert.match(generated, /"application\/json": components\["schemas"\]\["PublicSkillFilterDto"\]\[\];/);
		assert.match(generated, /"application\/json": components\["schemas"\]\["PublicDirectoryMemberDto"\]\[\];/);
		assert.match(generated, /PublicHome_Get/);
		assert.match(generated, /"application\/json": components\["schemas"\]\["PublicHomeDto"\];/);
		assert.match(generated, /"application\/problem\+json": components\["schemas"\]\["ProblemDetails"\];/);
		assert.doesNotMatch(generated, /PagedResult|items:/);
	});

	it('detects stale generated types from the committed schema', async () => {
		const generated = await readFile(generatedPath, 'utf8');

		assert.equal(generated, await renderSgfApiTypes());
	});
});

describe('OpenAPI snapshot byte policy', () => {
	it('accepts only loopback schema origins with no path, query, hash, or credentials', () => {
		const invalid = [
			'//127.0.0.1:5099',
			'ftp://127.0.0.1:5099',
			'http://user:pass@127.0.0.1:5099',
			'http://127.0.0.1:5099/umbraco/openapi/sgf-public-v1.json',
			'http://127.0.0.1:5099?schema=1',
			'http://127.0.0.1:5099#schema',
			'https://cms.sgf.dev',
			'https://example.com'
		];

		for (const value of invalid) {
			assert.throws(() => parseLocalSchemaOrigin(value), value);
		}
		assert.equal(parseLocalSchemaOrigin('http://localhost:5099'), 'http://localhost:5099');
		assert.equal(parseLocalSchemaOrigin('http://127.0.0.1:5099/'), 'http://127.0.0.1:5099');
		assert.equal(parseLocalSchemaOrigin('http://[::1]:5099'), 'http://[::1]:5099');
	});

	it('normalizes only line endings and terminal newlines, with no final newline in the committed artifact', async () => {
		const canonical = await readFile(schemaPath, 'utf8');
		const crlf = canonical.replace(/\n/g, '\r\n');

		assert.equal(canonical.endsWith('\n'), false);
		assert.equal(normalizeOpenApiSnapshotText(canonical), canonical);
		assert.equal(normalizeOpenApiSnapshotText(`${canonical}\n`), canonical);
		assert.equal(normalizeOpenApiSnapshotText(`${canonical}\n\n`), canonical);
		assert.equal(normalizeOpenApiSnapshotText(crlf), canonical);
		assert.equal(normalizeOpenApiSnapshotText(`${crlf}\r\n\r\n`), canonical);
		assert.equal(normalizeOpenApiSnapshotText(normalizeOpenApiSnapshotText(`${crlf}\r\n`)), canonical);
		assert.equal(canonicalOpenApiSnapshotText(`${crlf}\r\n`), canonical);
	});

	it('fetches from a synthetic loopback server and writes exact canonical committed bytes', async () => {
		await withTempDir(async (dir) => {
			const canonical = await readFile(schemaPath, 'utf8');
			const served = `${canonical.replace(/\n/g, '\r\n')}\r\n\r\n`;
			const outputPath = join(dir, 'sgf-public-v1.openapi.json');
			let requestedPath = '';
			let sawCredentiallessFetch = false;
			const server = createServer((request, response) => {
				requestedPath = request.url ?? '';
				sawCredentiallessFetch = !request.headers.cookie && !request.headers.authorization;
				response.writeHead(200, { 'content-type': 'application/json' });
				response.end(served);
			});

			await new Promise<void>((resolve, reject) => {
				server.once('error', reject);
				server.listen(0, '127.0.0.1', () => resolve());
			});
			try {
				const address = server.address();
				assert.equal(typeof address, 'object');
				const port = (address as AddressInfo).port;
				await fetchSgfApiSchema({ schemaOrigin: `http://127.0.0.1:${port}`, outputPath });
			} finally {
				await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
			}

			assert.equal(requestedPath, '/umbraco/openapi/sgf-public-v1.json');
			assert.equal(sawCredentiallessFetch, true);
			assert.equal(await readFile(outputPath, 'utf8'), canonical);
			assert.equal(sha256Text(await readFile(outputPath, 'utf8')), SGF_PUBLIC_SCHEMA_CANONICAL_SHA256);
		});
	});

	it('uses redirect error and omitted credentials for schema fetches', async () => {
		await withTempDir(async (dir) => {
			const canonical = await readFile(schemaPath, 'utf8');
			const outputPath = join(dir, 'sgf-public-v1.openapi.json');
			let requestedUrl = '';
			let requestedInit: RequestInit | undefined;

			await fetchSgfApiSchema({
				schemaOrigin: 'http://127.0.0.1:5099',
				outputPath,
				fetchImpl: async (url, init) => {
					requestedUrl = String(url);
					requestedInit = init;
					return new Response(canonical, { status: 200 });
				}
			});

			assert.equal(requestedUrl, 'http://127.0.0.1:5099/umbraco/openapi/sgf-public-v1.json');
			assert.equal(requestedInit?.credentials, 'omit');
			assert.equal(requestedInit?.redirect, 'error');
			assert.equal(await readFile(outputPath, 'utf8'), canonical);
		});
	});

	it('keeps the previous schema file on malformed JSON or network errors', async () => {
		await withTempDir(async (dir) => {
			const outputPath = join(dir, 'sgf-public-v1.openapi.json');
			await writeFile(outputPath, 'old schema');

			await assert.rejects(
				fetchSgfApiSchema({
					schemaOrigin: 'http://127.0.0.1:5099',
					outputPath,
					fetchImpl: async () => new Response('{bad json', { status: 200 })
				}),
				SyntaxError
			);
			assert.equal(await readFile(outputPath, 'utf8'), 'old schema');

			await assert.rejects(
				fetchSgfApiSchema({
					schemaOrigin: 'http://127.0.0.1:5099',
					outputPath,
					fetchImpl: async () => {
						throw new TypeError('network broke');
					}
				}),
				/network broke/
			);
			assert.equal(await readFile(outputPath, 'utf8'), 'old schema');
		});
	});
});
