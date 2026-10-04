import { CMS_INTERNAL_ORIGIN, CMS_DELIVERY_API_KEY } from '$app/env/private';
import { error } from '@sveltejs/kit';
import { loadCompany, CompanyLoadError } from '../../../lib/server/companies/load';
import { isCompanySlug } from '../../../lib/server/companies/paths';
import { readMediaSourceConfig } from '../../../lib/server/media/runtime';
import { PrivateMediaConfigError } from '../../../lib/server/media/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!isCompanySlug(event.params.slug)) error(404, 'Company not found.');
	try {
		return await loadCompany({
			path: '/companies/' + event.params.slug + '/', origin: CMS_INTERNAL_ORIGIN, apiKey: CMS_DELIVERY_API_KEY,
			media: readMediaSourceConfig(), requestSignal: event.request.signal
		});
	} catch (cause) {
		if (cause instanceof CompanyLoadError) error(cause.status, cause.publicMessage);
		if (cause instanceof PrivateMediaConfigError) error(503, 'Company media configuration is unavailable.');
		throw cause;
	}
};
