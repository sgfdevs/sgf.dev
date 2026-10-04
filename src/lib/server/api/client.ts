import { CMS_INTERNAL_ORIGIN } from '$app/env/private';
import { createSgfApiClientForOrigin } from './factory';
import type { SgfApiClient, SgfApiFetch } from './factory';

export function createSgfApiClient(fetchImpl: SgfApiFetch): SgfApiClient {
	return createSgfApiClientForOrigin(fetchImpl, CMS_INTERNAL_ORIGIN);
}
