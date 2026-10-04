import type { MediaSourceConfig } from '../media/config';
import { createSgfApiClientForOrigin } from '../api/factory';
import { mapPublicHomeDto, PublicHomeDataError } from './mapper';
import type { PublicHomeDto, PublicHomeView } from './mapper';

export type PublicHomeLoadOptions = {
	fetch: (request: Request) => Promise<Response>;
	cmsInternalOrigin: string | undefined;
	mediaConfig: MediaSourceConfig;
	requestSignal?: AbortSignal;
	timeoutMs?: number;
};

export class PublicHomeLoadError extends Error {
	readonly status: 404 | 502 | 503;
	readonly publicMessage: string;

	constructor(status: 404 | 502 | 503, publicMessage: string) {
		super(publicMessage);
		this.name = 'PublicHomeLoadError';
		this.status = status;
		this.publicMessage = publicMessage;
	}
}

const defaultHomeTimeoutMs = 4_000;

export async function loadPublicHome(options: PublicHomeLoadOptions): Promise<{ home: PublicHomeView }> {
	const { controller, signal, timedOut, cleanup } = createBoundedSignal(options.requestSignal, options.timeoutMs ?? defaultHomeTimeoutMs);
	let api;
	try {
		api = createSgfApiClientForOrigin(options.fetch, options.cmsInternalOrigin);
	} catch {
		cleanup();
		throw new PublicHomeLoadError(503, 'Home data is unavailable because the CMS API is not configured.');
	}

	let result: { data?: PublicHomeDto; error?: unknown; response: Response };
	try {
		result = await api.GET('/api/v1/public/home', { signal });
	} catch {
		cleanup();
		if (timedOut()) {
			throw new PublicHomeLoadError(503, 'Home data timed out.');
		}
		if (controller.signal.aborted) {
			throw new PublicHomeLoadError(503, 'Home data request was cancelled.');
		}
		throw new PublicHomeLoadError(502, 'Home data could not be reached.');
	} finally {
		cleanup();
	}

	if (result.response.status === 404) {
		throw new PublicHomeLoadError(404, 'Home content was not found.');
	}
	if (!result.response.ok || result.error || result.data === undefined) {
		throw new PublicHomeLoadError(502, 'Home data returned an upstream error.');
	}

	try {
		return { home: mapPublicHomeDto(result.data, options.mediaConfig) };
	} catch (error) {
		if (error instanceof PublicHomeDataError) {
			throw new PublicHomeLoadError(502, 'Home data did not match the public contract.');
		}
		throw error;
	}
}

function createBoundedSignal(requestSignal: AbortSignal | undefined, timeoutMs: number) {
	const controller = new AbortController();
	let timedOut = false;
	const timeout = setTimeout(() => {
		timedOut = true;
		controller.abort(timeoutReason());
	}, timeoutMs);
	const abortFromRequest = () => controller.abort(requestSignal?.reason);

	if (requestSignal?.aborted) {
		abortFromRequest();
	} else {
		requestSignal?.addEventListener('abort', abortFromRequest, { once: true });
	}

	return {
		controller,
		signal: controller.signal,
		timedOut: () => timedOut,
		cleanup: () => {
			clearTimeout(timeout);
			requestSignal?.removeEventListener('abort', abortFromRequest);
		}
	};
}

function timeoutReason(): DOMException | Error {
	if (typeof DOMException === 'function') {
		return new DOMException('Home API request timed out.', 'TimeoutError');
	}
	return new Error('Home API request timed out.');
}
