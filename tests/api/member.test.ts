import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSgfApiClientForOrigin, MEMBER_GET_TEMPLATE } from '../../src/lib/server/api/factory';

const origin = 'http://127.0.0.1:5099';
test('member template substitutes bounded usernames without changing case', async () => {
	const requests: Request[] = [];
	const api = createSgfApiClientForOrigin(async (request) => {
		requests.push(request);
		return Response.json({ username: 'Ada123' });
	}, origin);
	for (const username of ['A', 'Ada123', 'z'.repeat(1000)]) {
		await api.GET(MEMBER_GET_TEMPLATE, { params: { path: { username } } });
		const request = requests.at(-1)!;
		assert.equal(request.url, `${origin}/api/v1/public/members/${username}`);
		assert.equal(request.credentials, 'omit');
		assert.equal(request.redirect, 'error');
		assert.equal(request.method, 'GET');
	}
});

test('invalid member input fails before substitution even when normalization could reach an approved path', async () => {
	let calls = 0;
	const api = createSgfApiClientForOrigin(async () => { calls++; return Response.json({}); }, origin);
	for (const username of [undefined, null, 123, {}, '', 'a'.repeat(1001), 'a\n', 'a\r', 'a\0', 'é', 'a b', 'a-b', 'a_b', '.', '..', '../home', '../../public/home', '../../../../api/tags/skills', '%2e%2e/home', '%2F', 'a/b', 'a\\b', '%41', '{username}', 'a?x', 'a#x']) {
		await assert.rejects(async () => api.GET(MEMBER_GET_TEMPLATE, { params: { path: { username } } } as never), /username/);
	}
	await assert.rejects(async () => api.GET(MEMBER_GET_TEMPLATE, {} as never), /username/);
	assert.equal(calls, 0);
});

test('getter and inherited params are read once into a validated path snapshot', async () => {
	let paramsReads = 0, pathReads = 0, usernameReads = 0;
	let url = '';
	const path = Object.create({ get username() { return ++usernameReads === 1 ? 'Ada123' : '../../../../api/tags/skills'; } });
	const params = Object.create({ get path() { pathReads++; return path; } });
	const init = Object.create({ get params() { paramsReads++; return params; } });
	const api = createSgfApiClientForOrigin(async (request) => { url = request.url; return Response.json({}); }, origin);
	await api.GET(MEMBER_GET_TEMPLATE, init);
	assert.deepEqual([paramsReads, pathReads, usernameReads], [1, 1, 1]);
	assert.equal(url, `${origin}/api/v1/public/members/Ada123`);
});

test('member options retain inherited auth and network override guards', async () => {
	let calls = 0;
	const api = createSgfApiClientForOrigin(async () => { calls++; return Response.json({}); }, origin);
	for (const extra of [{ baseUrl: origin }, { fetch: async () => Response.json({}) }, { headers: { Cookie: 'secret' } }]) {
		const init = Object.assign(Object.create(extra), { params: { path: { username: 'Ada' } } });
		await assert.rejects(async () => api.GET(MEMBER_GET_TEMPLATE, init));
	}
	assert.equal(calls, 0);
});

test('final request accepts concrete members only, not unresolved or encoded paths', async () => {
	let calls = 0;
	const api = createSgfApiClientForOrigin(async () => { calls++; return Response.json({}); }, origin);
	for (const path of [MEMBER_GET_TEMPLATE, '/api/v1/public/members/%41da', '/api/v1/public/members/Ada%2Fsecret', '/api/v1/public/members/Ada/', '/api/v1/public/members/' + 'a'.repeat(1001)]) {
		await assert.rejects(api.GET(MEMBER_GET_TEMPLATE, {
			params: { path: { username: 'Ada' } },
			middleware: [{ onRequest: () => new Request(origin + path, { credentials: 'omit', redirect: 'error' }) }]
		} as never), /approved public API paths/);
	}
	assert.equal(calls, 0);
});
