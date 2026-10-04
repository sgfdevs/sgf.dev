import { error } from '@sveltejs/kit';

export type SgfApiResult<T> = {
	data?: T;
	error?: unknown;
	response: Response;
};

export function requireSgfApiData<T>(result: SgfApiResult<T>): T {
	if (result.error || result.data === undefined) {
		throwSgfApiError(result.response.status);
	}

	return result.data;
}

export function throwSgfApiError(status: number): never {
	if (status === 400) error(400, 'CMS request was invalid.');
	if (status === 404) error(404, 'CMS resource not found.');
	if (status === 401) error(401, 'CMS request was unauthorized.');
	if (status === 403) error(403, 'CMS request was forbidden.');
	error(502, 'CMS request failed.');
}
