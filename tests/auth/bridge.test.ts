import assert from 'node:assert/strict';
import test from 'node:test';
import type { Cookies } from '@sveltejs/kit';
import { createMemberClient } from '../../src/lib/server/auth/client';
import { clearMemberCookies, DEFAULT_MEMBER_COOKIE as base, memberCookieHeader, relayMemberCookies } from '../../src/lib/server/auth/cookies';
import { safeReturnTo } from '../../src/lib/server/auth/return-to';

function cookieJar(entries: Record<string, string> = {}) {
	const changes: { name: string; value?: string; options: Record<string, unknown> }[] = [];
	const jar = { ...entries };
	const cookies = {
		getAll: () => Object.entries(jar).map(([name, value]) => ({ name, value })),
		set: (name: string, value: string, options: Record<string, unknown>) => { jar[name] = value; changes.push({ name, value, options }); },
		delete: (name: string, options: Record<string, unknown>) => { delete jar[name]; changes.push({ name, options }); }
	} as unknown as Cookies;
	return { cookies, changes, jar };
}

test('generated transport sends only member cookie family and bridge header to fixed origin', async () => {
	const { cookies } = cookieJar({
		[base]: 'chunks-2', [base + 'C1']: 'member_chunk1', [base + 'C2']: 'member_chunk2',
		UMB_UCONTEXT: 'backoffice', analytics: 'tracking', '.AspNetCore.Identity.External': 'external',
		[base + 'C0']: 'not_a_chunk', [base + 'Evil']: 'wrong_prefix'
	});
	const requests: Request[] = [];
	const client = createMemberClient({
		origin: 'https://cms.example.test', secret: 'private-test-bridge', cookies, secure: true,
		fetchImpl: async input => {
			const request = input as Request;
			requests.push(request);
			return new Response(JSON.stringify({ succeeded: true }), { headers: { 'Content-Type': 'application/json' } });
		}
	});
	await client.login({ username: '  Alice  ', password: 'untouched password ', rememberMe: false });
	const request = requests[0];
	assert.equal(request.url, 'https://cms.example.test/api/v1/member/login');
	assert.equal(request.redirect, 'error');
	assert.equal(request.credentials, 'omit');
	assert.equal(request.cache, 'no-store');
	assert.deepEqual([...request.headers.keys()].sort(), ['content-type', 'cookie', 'x-sgf-member-bridge']);
	assert.equal(request.headers.get('cookie'), `${base}=chunks-2; ${base}C1=member_chunk1; ${base}C2=member_chunk2`);
	assert.equal(request.headers.get('x-sgf-member-bridge'), 'private-test-bridge');
	assert.deepEqual(await request.json(), { username: '  Alice  ', password: 'untouched password ', rememberMe: false });
});

test('member Set-Cookie preserves chunks and remember-me expiry, strips CMS domain, and hardens attributes', () => {
	const { cookies, changes, jar } = cookieJar({ [base + 'C3']: 'old', analytics: 'keep' });
	const headers = new Headers();
	for (const pair of [`${base}=chunks-2`, `${base}C1=first`, `${base}C2=second`]) {
		headers.append('Set-Cookie', pair + '; Domain=cms.example.test; Path=/cms; Expires=Tue, 01 Jan 2030 00:00:00 GMT; SameSite=None');
	}
	headers.append('Set-Cookie', 'UMB_UCONTEXT=do_not_relay');
	relayMemberCookies(headers, cookies, base, true);
	assert.equal(jar[base + 'C3'], undefined);
	assert.equal(jar.analytics, 'keep');
	assert.equal(jar.UMB_UCONTEXT, undefined);
	for (const change of changes.filter(c => c.value !== undefined)) {
		assert.equal(change.options.path, '/');
		assert.equal(change.options.httpOnly, true);
		assert.equal(change.options.secure, true);
		assert.equal(change.options.sameSite, 'lax');
		assert.equal(change.options.domain, undefined);
		assert.equal((change.options.expires as Date).toISOString(), '2030-01-01T00:00:00.000Z');
		assert.equal(change.options.maxAge, undefined);
	}
});

test('session cookies remain session cookies; renewal removes stale chunks; logout clears only member cookies', () => {
	const { cookies, changes, jar } = cookieJar({ [base]: 'chunks-1', [base + 'C1']: 'old', unrelated: 'keep' });
	relayMemberCookies(new Headers({ 'Set-Cookie': `${base}=new_ticket; Path=/; HttpOnly` }), cookies, base, false);
	const setting = changes.find(c => c.name === base && c.value === 'new_ticket')!;
	assert.equal(setting.options.expires, undefined);
	assert.equal(setting.options.maxAge, undefined);
	assert.equal(jar[base + 'C1'], undefined);
	assert.equal(memberCookieHeader(cookies, base), `${base}=new_ticket`);
	clearMemberCookies(cookies, base, true);
	assert.equal(memberCookieHeader(cookies, base), '');
	assert.equal(jar.unrelated, 'keep');
});

test('bridge fails closed without secret or with unsafe nonlocal origin', () => {
	const { cookies } = cookieJar();
	for (const origin of ['http://cms.example.test', 'https://cms.example.test/path', 'https://user:pass@cms.example.test']) {
		assert.throws(() => createMemberClient({ origin, secret: 'test', cookies, secure: true }));
	}
	assert.throws(() => createMemberClient({ origin: 'https://cms.example.test', secret: undefined, cookies, secure: true }));
});

test('returnTo accepts only local paths, defaulting to account', () => {
	for (const input of [null, '', 'https://evil.test', '//evil.test', '/\\evil.test', '/%5cevil.test', '/%2f%2fevil.test', '/account\n', '/%0d%0aevil', '/login', '/logout', '/%zz']) {
		assert.equal(safeReturnTo(input), '/account', String(input));
	}
	assert.equal(safeReturnTo('/member/Alice?tab=about#skills'), '/member/Alice?tab=about#skills');
});
