import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import openapiTS, { astToString } from 'openapi-typescript';

const check = process.argv.includes('--check');
const GENERATED_HEADER = `/**
 * Generated from openapi/sgf-public-v1.openapi.json.
 * Do not edit by hand. Run npm run api:generate.
 */

`;

const schemas = [
	{
		input: resolve('openapi/sgf-public-v1.openapi.json'),
		output: resolve('src/lib/server/api/generated/sgfPublicApiSchema.d.ts')
	}
] as const;

for (const schema of schemas) {
	const document = JSON.parse(await readFile(schema.input, 'utf8'));
	const ast = await openapiTS(document);
	const next = `${GENERATED_HEADER}${astToString(ast)}`;

	if (check) {
		const current = await readFile(schema.output, 'utf8');
		if (current !== next) {
			throw new Error(`${schema.output} is stale. Run npm run api:generate.`);
		}
		continue;
	}

	await mkdir(dirname(schema.output), { recursive: true });
	await writeFile(schema.output, next);
}
