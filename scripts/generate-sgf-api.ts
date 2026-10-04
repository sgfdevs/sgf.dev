import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import openapiTS, { astToString } from 'openapi-typescript';
import { writeFileAtomically } from './lib/atomic-write';
import { parseOpenApiSnapshotText } from './lib/schema-bytes';

export const GENERATED_HEADER = `/**
 * Generated from openapi/sgf-public-v1.openapi.json.
 * Do not edit by hand. Run npm run api:generate.
 */

`;

export const sgfPublicApiSchema = {
	input: resolve('openapi/sgf-public-v1.openapi.json'),
	output: resolve('src/lib/server/api/generated/sgfPublicApiSchema.d.ts')
} as const;

const schemas = [sgfPublicApiSchema] as const;

export type GenerateSgfApiOptions = {
	check?: boolean;
};

export async function renderSgfApiTypes(inputPath = sgfPublicApiSchema.input): Promise<string> {
	const document = parseOpenApiSnapshotText(await readFile(inputPath, 'utf8'));
	const ast = await openapiTS(document as Parameters<typeof openapiTS>[0]);
	return `${GENERATED_HEADER}${astToString(ast)}`;
}

export async function generateSgfApi({ check = false }: GenerateSgfApiOptions = {}): Promise<void> {
	for (const schema of schemas) {
		const next = await renderSgfApiTypes(schema.input);

		if (check) {
			const current = await readFile(schema.output, 'utf8');
			if (current !== next) {
				throw new Error(`${schema.output} is stale. Run npm run api:generate.`);
			}
			continue;
		}

		await writeFileAtomically(schema.output, next);
	}
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
	await generateSgfApi({ check: process.argv.includes('--check') });
}
