export const contentPagePaths = [
	'/about/', '/about/code-of-conduct/', '/about/sponsorship/', '/discord',
	'/archives/', '/2022-holiday-party/', '/2022-tech-survey/', '/search-results/'
] as const;
export type ContentPagePath = typeof contentPagePaths[number];

export function isContentPagePath(value: unknown): value is ContentPagePath {
	return typeof value === 'string' && (contentPagePaths as readonly string[]).includes(value);
}
