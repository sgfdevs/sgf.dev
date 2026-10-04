import { PrivateMediaConfigError } from '../../../lib/server/media/config';
import { handleMediaProxyRequest, MediaProxyError } from '../../../lib/server/media/proxy';
import { readMediaProxyConfig } from '../../../lib/server/media/runtime';
import type { RequestHandler } from './$types';

export const prerender = false;

export const GET: RequestHandler = async (event) => mediaResponse(event, 'GET');
export const HEAD: RequestHandler = async (event) => mediaResponse(event, 'HEAD');

async function mediaResponse(event: Parameters<RequestHandler>[0], method: 'GET' | 'HEAD'): Promise<Response> {
	try {
		return await handleMediaProxyRequest(event, method, readMediaProxyConfig());
	} catch (error) {
		if (error instanceof PrivateMediaConfigError) {
			return new Response('Media unavailable', {
				status: 503,
				headers: {
					'cache-control': 'no-store',
					'content-type': 'text/plain; charset=utf-8',
					'x-content-type-options': 'nosniff'
				}
			});
		}
		if (error instanceof MediaProxyError) {
			return new Response(error.message, {
				status: error.status,
				headers: {
					'cache-control': 'no-store',
					'content-type': 'text/plain; charset=utf-8',
					'x-content-type-options': 'nosniff'
				}
			});
		}
		throw error;
	}
}
