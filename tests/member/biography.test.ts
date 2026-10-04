import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sanitizeMemberBiography } from '../../src/lib/server/member/biography';

test('biography preserves paragraphs, lists, emphasis and safe links', () => {
	const result = sanitizeMemberBiography('<p>Hello <strong>world</strong> <em>today</em>.</p><ul><li>One</li></ul><ol><li>Two</li></ol><a href="https://example.test/path?q=one&amp;v=two" title="Example">Read</a>');
	assert.match(result, /<p>Hello <strong>world<\/strong> <em>today<\/em>.<\/p>/);
	assert.match(result, /<ul><li>One<\/li><\/ul><ol><li>Two<\/li><\/ol>/);
	assert.match(result, /href="https:\/\/example.test\/path\?q=one&amp;v=two"/);
	assert.match(result, /target="_blank" rel="noopener noreferrer"/);
	assert.equal(sanitizeMemberBiography(null), '');
});

test('biography strips executable tags, dangerous attributes and all images', () => {
	const result = sanitizeMemberBiography('<script>alert(1)</script><style>body{display:none}</style><iframe src="https://evil.test"></iframe><form action="/login"><input name="password"></form><embed src="x"><object data="x"></object><svg onload="alert(1)"><script>evil()</script></svg><math><mi>x</mi></math><img src="https://evil.test/tracker" onerror="evil()"><p class="x" id="x" style="color:red" onclick="evil()">Keep me</p><a href="https://example.test" onclick="evil()" target="_self" rel="opener">Link</a>');
	assert.doesNotMatch(result, /<(script|style|iframe|form|input|embed|object|svg|math|img)\b|onload|onerror|onclick|style=|class=|id=|alert\(|evil\(/i);
	assert.match(result, /<p>Keep me<\/p>/);
	assert.match(result, /target="_blank" rel="noopener noreferrer"/);
});

test('biography rejects encoded schemes, credentials, controls and protocol-relative links', () => {
	for (const href of ['javascript:alert(1)', 'jav&#x61;script:alert(1)', 'java&#10;script:alert(1)', 'javascript&colon;alert(1)', '&#106;&#97;vascript:alert(1)', 'data:text/html,test', '//evil.test', 'https://user:pass@example.test', 'https://example.test/%0aevil', 'https://example.test/&#9;evil', 'https:\\evil.test', '%6aavascript%3aalert(1)', '/umbraco/private']) {
		const result = sanitizeMemberBiography('<a href="' + href + '" onmouseover="evil()">Text</a>');
		assert.equal(result, '<a>Text</a>', href);
	}
});
