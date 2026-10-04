import { CMS_INTERNAL_ORIGIN } from '$app/env/private';
import { error } from '@sveltejs/kit';
import { isPublicMemberUsername } from '../../../lib/server/api/factory';
import { MemberLoadError, loadMember } from '../../../lib/server/member/load';
import { readMediaSourceConfig } from '../../../lib/server/media/runtime';
import { PrivateMediaConfigError } from '../../../lib/server/media/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!isPublicMemberUsername(event.params.username)) error(404, 'Member not found.');
	try {
		return await loadMember({
			username: event.params.username,
			fetch: event.fetch,
			cmsInternalOrigin: CMS_INTERNAL_ORIGIN,
			mediaConfig: readMediaSourceConfig(),
			requestSignal: event.request.signal
		});
	} catch (loadError) {
		if (loadError instanceof MemberLoadError) error(loadError.status, loadError.publicMessage);
		if (loadError instanceof PrivateMediaConfigError) error(503, 'Member media configuration is unavailable.');
		throw loadError;
	}
};
