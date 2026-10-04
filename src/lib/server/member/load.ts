import { createSgfApiClientForOrigin, isPublicMemberUsername, MEMBER_GET_TEMPLATE } from '../api/factory';
import type { MediaSourceConfig } from '../media/config';
import { mapPublicMemberProfile, MemberDataError } from './mapper';

export class MemberLoadError extends Error {
	constructor(readonly status: 404 | 502 | 503, readonly publicMessage: string) {
		super(publicMessage);
	}
}

export async function loadMember(options: {
	username: string;
	fetch: (request: Request) => Promise<Response>;
	cmsInternalOrigin: string | undefined;
	mediaConfig: MediaSourceConfig;
	requestSignal?: AbortSignal;
	timeoutMs?: number;
}) {
	if (!isPublicMemberUsername(options.username)) throw new MemberLoadError(404, 'Member not found.');
	let api;
	try {
		api = createSgfApiClientForOrigin(options.fetch, options.cmsInternalOrigin);
	} catch {
		throw new MemberLoadError(503, 'Member data is unavailable because the CMS API is not configured.');
	}
	const controller = new AbortController();
	let timedOut = false;
	const abortFromRequest = () => controller.abort(options.requestSignal?.reason);
	if (options.requestSignal?.aborted) abortFromRequest();
	else options.requestSignal?.addEventListener('abort', abortFromRequest, { once: true });
	const timeout = setTimeout(() => {
		timedOut = true;
		controller.abort(new Error('Member API request timed out.'));
	}, options.timeoutMs ?? 4_000);
	try {
		controller.signal.throwIfAborted();
		const result = await api.GET(MEMBER_GET_TEMPLATE, {
			params: { path: { username: options.username } }, signal: controller.signal
		});
		controller.signal.throwIfAborted();
		if (result.response.status === 404) throw new MemberLoadError(404, 'Member not found.');
		if (!result.response.ok || result.error || result.data === undefined) throw new MemberLoadError(502, 'Member data returned an upstream error.');
		return { member: mapPublicMemberProfile(result.data, options.mediaConfig) };
	} catch (error) {
		if (timedOut) throw new MemberLoadError(503, 'Member data timed out.');
		if (controller.signal.aborted) throw new MemberLoadError(503, 'Member data request was cancelled.');
		if (error instanceof MemberLoadError) throw error;
		if (error instanceof MemberDataError) throw new MemberLoadError(502, 'Member data did not match the public contract.');
		throw new MemberLoadError(502, 'Member data could not be reached.');
	} finally {
		clearTimeout(timeout);
		options.requestSignal?.removeEventListener('abort', abortFromRequest);
	}
}
