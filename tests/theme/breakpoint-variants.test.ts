import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { compile } from 'tailwindcss';

type Rule = {
	marker: 'max' | 'split';
	variant: string;
	condition: string;
	value: number;
	position: number;
};

const root = new URL('../..', import.meta.url);
const appCssUrl = new URL('src/app.css', root);

const maxProbeClasses = [
	'sgf-max-1400:[--sgf-max-probe:1400]',
	'sgf-max-1060:[--sgf-max-probe:1060]',
	'sgf-max-1024:[--sgf-max-probe:1024]',
	'sgf-max-950:[--sgf-max-probe:950]',
	'sgf-max-768:[--sgf-max-probe:768]',
	'sgf-max-700:[--sgf-max-probe:700]',
	'sgf-max-480:[--sgf-max-probe:480]'
];

const splitProbeClasses = [
	'sgf-max-1024:[--sgf-split-probe:1024]',
	'sgf-min-951:[--sgf-split-probe:951]',
	'sgf-max-950:[--sgf-split-probe:950]'
];

const expectedMaxValues = new Map([
	[400, 480],
	[480, 480],
	[700, 700],
	[950, 950],
	[951, 1024],
	[1024, 1024],
	[1400, 1400]
]);

const expectedSplitValues = new Map([
	[400, 950],
	[480, 950],
	[700, 950],
	[950, 950],
	[951, 951],
	[1024, 951],
	[1400, 951]
]);

test('SGF breakpoint variants compile in legacy cascade order', async () => {
	const compiledCss = await compileProbeCss([...maxProbeClasses, ...splitProbeClasses]);
	const rules = extractProbeRules(compiledCss);

	assertRuleOrder(
		rules.filter((rule) => rule.marker === 'max'),
		['sgf-max-1400', 'sgf-max-1060', 'sgf-max-1024', 'sgf-max-950', 'sgf-max-768', 'sgf-max-700', 'sgf-max-480']
	);
	assertRuleOrder(
		rules.filter((rule) => rule.marker === 'split'),
		['sgf-max-1024', 'sgf-min-951', 'sgf-max-950']
	);

	for (const [width, value] of expectedMaxValues) {
		assert.equal(cascadeValue(rules, 'max', width), value, `max-only cascade at ${width}px`);
	}

	for (const [width, value] of expectedSplitValues) {
		assert.equal(cascadeValue(rules, 'split', width), value, `950/951 split cascade at ${width}px`);
	}
});

async function compileProbeCss(classes: string[]) {
	const appCss = await readFile(appCssUrl, 'utf8');
	const probeCss = appCss.replace("@import 'tailwindcss';", '@tailwind utilities;');
	const compiler = await compile(probeCss, {
		base: root.pathname,
		from: appCssUrl.pathname
	});

	return compiler.build(classes);
}

function extractProbeRules(compiledCss: string): Rule[] {
	const rules: Rule[] = [];
	const mediaRule = /@media \((width [<>]= (\d+)px)\) \{([\s\S]*?)\n\}/g;
	let match: RegExpExecArray | null;

	while ((match = mediaRule.exec(compiledCss)) !== null) {
		const [, condition, , block] = match;
		for (const marker of ['max', 'split'] as const) {
			const valueMatch = block.match(new RegExp(`--sgf-${marker}-probe: (\\d+);`));
			if (!valueMatch) continue;

			rules.push({
				marker,
				variant: variantFromBlock(block),
				condition,
				value: Number(valueMatch[1]),
				position: match.index
			});
		}
	}

	return rules.sort((left, right) => left.position - right.position);
}

function variantFromBlock(block: string) {
	const classMatch = block.match(/\.(sgf-(?:max|min)-\d+)\\:/);
	assert.ok(classMatch, `Expected SGF variant class in block: ${block}`);
	return classMatch[1];
}

function assertRuleOrder(rules: Rule[], expectedOrder: string[]) {
	assert.deepEqual(
		rules.map((rule) => rule.variant),
		expectedOrder
	);
}

function cascadeValue(rules: Rule[], marker: Rule['marker'], width: number) {
	let value: number | undefined;

	for (const rule of rules) {
		if (rule.marker !== marker || !mediaMatches(rule.condition, width)) continue;
		value = rule.value;
	}

	return value;
}

function mediaMatches(condition: string, width: number) {
	const [, operator, value] = condition.match(/width ([<>]=) (\d+)px/) ?? [];
	assert.ok(operator && value, `Unsupported media condition: ${condition}`);
	return operator === '<=' ? width <= Number(value) : width >= Number(value);
}
