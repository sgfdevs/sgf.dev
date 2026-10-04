export const contentPagePaths = ['/about/', '/about/code-of-conduct/', '/about/sponsorship/', '/discord'] as const;
export type ContentPagePath = typeof contentPagePaths[number];

export function isContentPagePath(value: unknown): value is ContentPagePath {
	return typeof value === 'string' && (contentPagePaths as readonly string[]).includes(value);
}
