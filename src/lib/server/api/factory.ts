import createClient from 'openapi-fetch';
import type { Client } from 'openapi-fetch';
import type { paths } from './generated/sgfPublicApiSchema';
import { parseCmsInternalOrigin } from './origin';

export type SgfApiClient = Pick<Client<paths>, 'GET'>;
export type SgfApiFetch = (request: Request) => Promise<Response>;

type RequestInitGuard = Record<string, unknown> | undefined;

export function createSgfApiClientForOrigin(fetchImpl: SgfApiFetch, internalOrigin: string | undefined): SgfApiClient {
	const baseUrl = parseCmsInternalOrigin(internalOrigin);
	const client = createClient<paths>({
		baseUrl,
		fetch: (request) => {
			assertCmsRequestOrigin(request, baseUrl);
			return fetchImpl(request);
		},
		redirect: 'error'
	});

	return {
		GET(url, ...init) {
			assertNoRequestOriginOverride(init[0] as RequestInitGuard);
			return client.GET(url, ...init);
		}
	};
}

function assertNoRequestOriginOverride(init: RequestInitGuard): void {
	if (!init) return;

	if ('baseUrl' in init || 'fetch' in init) {
		throw new Error('SGF API requests must use the fixed CMS_INTERNAL_ORIGIN and request-scoped fetch.');
	}
}

function assertCmsRequestOrigin(request: Request, baseUrl: string): void {
	if (new URL(request.url).origin !== baseUrl) {
		throw new Error('SGF API request escaped the fixed CMS_INTERNAL_ORIGIN.');
	}
}
