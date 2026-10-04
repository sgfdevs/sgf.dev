import { readFile } from 'node:fs/promises';
import openapiTS, { astToString } from 'openapi-typescript';
import { writeFileAtomically } from './lib/atomic-write';

const input = 'openapi/umbraco-delivery.openapi.json';
const output = 'src/lib/server/pages/generated/deliveryApiSchema.d.ts';
const document = JSON.parse(await readFile(input, 'utf8'));
const generated = `/** Generated from ${input}. Run npm run api:delivery:generate. */\n${astToString(await openapiTS(document))}`;
if (process.argv.includes('--check')) {
	if (await readFile(output, 'utf8') !== generated) throw new Error('Delivery API types are stale.');
} else {
	await writeFileAtomically(output, generated);
}
