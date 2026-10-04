import assert from 'node:assert/strict';
import test from 'node:test';
import type { Cookies } from '@sveltejs/kit';
import { createMemberClient } from '../../src/lib/server/auth/client';
import { DEFAULT_MEMBER_COOKIE as cookie } from '../../src/lib/server/auth/cookies';

test('generated registration uses only the private bridge and relays persistent member sign-in', async () => {
	const stored: { name: string; options: Record<string, unknown> }[] = [];
	const cookies = {
		getAll: () => [],
		set: (name: string, _value: string, options: Record<string, unknown>) => stored.push({ name, options }),
		delete: () => {}
	} as unknown as Cookies;
	const client = createMemberClient({
		origin: 'http://127.0.0.1:9999', secret: 'synthetic-only', cookies, secure: true,
		fetchImpl: async input => {
			const request = input as Request;
			assert.equal(request.url, 'http://127.0.0.1:9999/api/v1/member/register');
			assert.equal(request.method, 'POST');
			assert.equal(request.headers.get('origin'), null);
			assert.equal(request.headers.get('x-sgf-member-bridge'), 'synthetic-only');
			assert.equal(request.cache, 'no-store');
			const body = await request.json();
			assert.equal(body.firstName, 'Synthetic');
			assert.equal(body.lastName, 'Member');
			assert.equal(body.username, 'Synthetic');
			assert.equal(body.challengeQuestion, 'sgf');
			return new Response(JSON.stringify({ succeeded: true, errors: {} }), { headers: {
				'Content-Type': 'application/json',
				'Set-Cookie': cookie + '=synthetic-ticket; Domain=cms.invalid; Expires=Tue, 01 Jan 2030 00:00:00 GMT; Path=/; HttpOnly'
			} });
		}
	});
	assert.equal((await client.register({
		firstName: 'Synthetic', lastName: 'Member', email: 'synthetic@example.test',
		username: 'Synthetic', password: 'Fictional9!', challengeQuestion: 'sgf'
	})).data?.succeeded, true);
	assert.equal(stored.length, 1);
	assert.equal(stored[0].name, cookie);
	assert.equal(stored[0].options.httpOnly, true);
	assert.equal(stored[0].options.secure, true);
	assert.equal(stored[0].options.domain, undefined);
	assert.ok(stored[0].options.expires instanceof Date);
});
