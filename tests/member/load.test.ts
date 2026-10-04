import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadMember, MemberLoadError } from '../../src/lib/server/member/load';
import { profile, mediaConfig } from './fixture';

const options = { username: 'Ada123', cmsInternalOrigin: 'http://cms.test', mediaConfig };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
	status, headers: { 'content-type': status === 404 ? 'application/problem+json' : 'application/json' }
});
const statusIs = (status: number) => (error: unknown) => {
	assert.ok(error instanceof MemberLoadError);
	assert.equal(error.status, status);
	assert.doesNotMatch(error.publicMessage, /private-detail|reset-token/);
	return true;
};

function abortableFetch(request: Request): Promise<Response> {
	return new Promise((_resolve, reject) => {
		if (request.signal.aborted) reject(request.signal.reason);
		else request.signal.addEventListener('abort', () => reject(request.signal.reason), { once: true });
	});
}

test('member loader uses the request-scoped GET client and only returns mapped public data', async () => {
	const requests: Request[] = [];
	const result = await loadMember({ ...options, fetch: async (request) => {
		requests.push(request);
		return json({ ...profile, email: 'private-detail', resetToken: 'reset-token' });
	} });
	assert.equal(requests.length, 1);
	const request = requests[0];
	assert.equal(request.url, 'http://cms.test/api/v1/public/members/Ada123');
	assert.equal(request.method, 'GET');
	assert.equal(request.credentials, 'omit');
	assert.equal(request.redirect, 'error');
	assert.equal(request.headers.has('cookie'), false);
	assert.equal(request.headers.has('authorization'), false);
	assert.deepEqual(Object.keys(result), ['member']);
	assert.equal(result.member.name, profile.name);
	assert.equal(result.member.biographyHtml, profile.aboutHtml);
	assert.doesNotMatch(JSON.stringify(result), /private-detail|reset-token|aboutHtml/);
});

test('invalid usernames are controlled 404s with zero fetch, even without CMS config', async () => {
	let calls = 0;
	for (const username of ['', '../home', 'Ada%2fOther', 'Ada.Other', 'Ada Other', '{username}', 'é', 'a'.repeat(1001)]) {
		await assert.rejects(loadMember({ ...options, username, cmsInternalOrigin: undefined,
			fetch: async () => { calls++; return json(profile); }
		}), statusIs(404));
	}
	assert.equal(calls, 0);
});

test('missing or invalid private CMS configuration is a 503 with zero fetch', async () => {
	let calls = 0;
	for (const cmsInternalOrigin of [undefined, '', 'not-an-origin', 'https://user:pass@cms.test']) {
		await assert.rejects(loadMember({ ...options, cmsInternalOrigin,
			fetch: async () => { calls++; return json(profile); }
		}), statusIs(503));
	}
	assert.equal(calls, 0);
});

test('CMS missing or protected member/anchor 404s remain public 404s', async () => {
	await assert.rejects(loadMember({ ...options,
		fetch: async () => json({ detail: 'private-detail' }, 404)
	}), statusIs(404));
});

test('upstream failures, malformed JSON and malformed DTOs are controlled 502s', async () => {
	for (const fetch of [
		async () => json({ detail: 'private-detail' }, 500),
		async () => new Response('{broken', { headers: { 'content-type': 'application/json' } }),
		async () => new Response(null, { status: 204 }),
		async () => json({ ...profile, skills: [{ name: 'JavaScript' }] }),
		async () => { throw new Error('private-detail'); }
	]) await assert.rejects(loadMember({ ...options, fetch }), statusIs(502));
});

test('timeout aborts the upstream request and returns 503', async () => {
	let signal: AbortSignal | undefined;
	await assert.rejects(loadMember({ ...options, timeoutMs: 5,
		fetch: (request) => { signal = request.signal; return abortableFetch(request); }
	}), statusIs(503));
	assert.ok(signal?.aborted);
});

test('request cancellation returns 503 before fetch or while upstream is pending', async () => {
	const cancelled = new AbortController();
	cancelled.abort(new Error('private-detail'));
	let calls = 0;
	await assert.rejects(loadMember({ ...options, requestSignal: cancelled.signal,
		fetch: async () => { calls++; return json(profile); }
	}), statusIs(503));
	assert.equal(calls, 0);

	const controller = new AbortController();
	await assert.rejects(loadMember({ ...options, requestSignal: controller.signal,
		fetch: (request) => {
			const response = abortableFetch(request);
			controller.abort(new Error('private-detail'));
			return response;
		}
	}), statusIs(503));
});

test('success removes cancellation listeners and timeout work', async () => {
	const controller = new AbortController();
	let upstreamSignal: AbortSignal | undefined;
	await loadMember({ ...options, requestSignal: controller.signal, timeoutMs: 10,
		fetch: async (request) => { upstreamSignal = request.signal; return json(profile); }
	});
	controller.abort();
	await new Promise((resolve) => setTimeout(resolve, 20));
	assert.equal(upstreamSignal?.aborted, false);
});
