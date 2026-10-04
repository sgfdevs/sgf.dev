import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { canonicalUrlForPathname } from '../../src/lib/shell/canonical-url';

const configuredOrigin = 'http://localhost:4185';

function canonicalFromRequestPath(requestPath: string) {
	const requestUrl = new URL(`http://127.0.0.1:4185${requestPath}`);
	return canonicalUrlForPathname(configuredOrigin, requestUrl.pathname);
}

describe('canonical URL helper', () => {
	it('keeps hostile pathnames on the configured origin', () => {
		const cases = [
			['//evilpath?reset-token=sensitive#hash', 'http://localhost:4185//evilpath'],
			['/\\host?reset-token=sensitive#hash', 'http://localhost:4185//host'],
			['/%2f%2fevil?reset-token=sensitive#hash', 'http://localhost:4185/%2f%2fevil'],
			['/%5c%5chost?reset-token=sensitive#hash', 'http://localhost:4185/%5c%5chost']
		] as const;

		for (const [requestPath, expected] of cases) {
			const canonical = canonicalFromRequestPath(requestPath);
			assert.equal(canonical, expected);
			assert.equal(new URL(canonical).origin, configuredOrigin);
			assert.doesNotMatch(canonical, /reset-token|sensitive|[?#]/);
		}
	});

	it('handles ordinary, unicode, empty, and dot-segment paths without changing origin', () => {
		const cases = [
			['/groups/', 'http://localhost:4185/groups/'],
			['/', 'http://localhost:4185/'],
			['', 'http://localhost:4185/'],
			['/café/✓', 'http://localhost:4185/caf%C3%A9/%E2%9C%93'],
			['/events/../about/', 'http://localhost:4185/about/']
		] as const;

		for (const [pathname, expected] of cases) {
			const canonical = canonicalUrlForPathname(configuredOrigin, pathname);
			assert.equal(canonical, expected);
			assert.equal(new URL(canonical).origin, configuredOrigin);
		}
	});
});
