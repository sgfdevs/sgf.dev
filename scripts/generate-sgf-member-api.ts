import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import openapiTS, { astToString } from 'openapi-typescript';
import { writeFileAtomically } from './lib/atomic-write';
import { parseOpenApiSnapshotText } from './lib/schema-bytes';

const input = resolve('openapi/sgf-member-v1.openapi.json');
const output = resolve('src/lib/server/auth/generated/memberApiSchema.d.ts');
const document = parseOpenApiSnapshotText(await readFile(input, 'utf8'));
const types = astToString(await openapiTS(document as Parameters<typeof openapiTS>[0]));
const text = '/** Generated from openapi/sgf-member-v1.openapi.json. Run npm run api:member:generate. */\n' + types;
if (process.argv.includes('--check')) {
	if (await readFile(output, 'utf8') !== text) throw new Error('Member API types are stale.');
} else {
	await writeFileAtomically(output, text);
}
