import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mapPublicMemberProfile, MemberDataError } from '../../src/lib/server/member/mapper';
import { profile, mediaConfig } from './fixture';

test('member mapping preserves public text/order/date labels and whitelists every nested object', () => {
	const member = mapPublicMemberProfile({
		...profile, email: 'private@example.test', resetToken: 'secret',
		skills: [{ ...profile.skills![0], memberId: 'secret', private: true }]
	} as never, mediaConfig);
	assert.deepEqual(Object.keys(member).sort(), ['name', 'url', 'jobTitle', 'image', 'tags', 'location', 'joinMonthLabel', 'biographyHtml', 'skills', 'websiteUrl', 'socials', 'available'].sort());
	assert.equal(member.url, '/member/Ada123');
	assert.equal(member.name, 'Ada Lovelace');
	assert.equal(member.jobTitle, profile.jobTitle);
	assert.equal(member.location, 'Springfield, MO');
	assert.equal(member.joinMonthLabel, 'December 2020');
	assert.deepEqual(member.tags, profile.tags);
	assert.equal(member.image, '/media/synthetic/profile.png?width=800');
	assert.deepEqual(member.skills, [{ name: 'JavaScript', url: '/directory/?skills=17d3e25e-bd1f-4a4c-98ef-89ad894d4f7d' }]);
	assert.deepEqual(member.socials.map((social) => social.label), ['example.test', 'Twitter', 'LinkedIn', 'Facebook', 'Instagram', 'Youtube']);
	assert.ok(member.available);
	assert.doesNotMatch(JSON.stringify(member), /private@example|secret|memberId|resetToken|aboutHtml|firstName/);
	for (const social of member.socials) assert.deepEqual(Object.keys(social), ['label', 'url']);
});

test('only approved proxy images and safe HTTP(S) links reach member PageData', () => {
	for (const url of ['javascript:evil()', 'data:x', '//evil.test', 'https://user:pass@evil.test', 'https://evil.test/%0d', 'https://evil.test/\u0001', 'https:\\evil.test']) {
		const result = mapPublicMemberProfile({ ...profile, websiteUrl: url, twitterUrl: url, profileImageUrl: url }, mediaConfig);
		assert.equal(result.websiteUrl, null);
		assert.ok(!result.socials.some((social) => social.label === 'Twitter'));
		assert.equal(result.image, '/images/pipey.jpg');
	}
	assert.equal(mapPublicMemberProfile({ ...profile, profileImageUrl: 'https://media.sgf.dev/synthetic/profile.png' }, mediaConfig).image, '/media/synthetic/profile.png');
});

test('member mapper rejects malformed fields instead of fictional success data', () => {
	for (const change of [{ username: '../home' }, { name: 42 }, { tags: 'tag' }, { tags: [1] }, { skills: [{}] }, { skills: [{ name: 'x', directoryFilterValue: 'a,b' }] }, { availableForContractWork: 'yes' }, { aboutHtml: {} }, { city: [] }, { twitterUrl: {} }]) {
		assert.throws(() => mapPublicMemberProfile({ ...profile, ...change } as never, mediaConfig), MemberDataError);
	}
});

test('optional public fields stay absent and biography HTML is sanitized before mapping', () => {
	const result = mapPublicMemberProfile({ ...profile, city: null, state: null, joinMonthLabel: null, websiteUrl: null, aboutHtml: '<p onclick="evil()">Bio</p><img src="x">', availableForHire: false }, mediaConfig);
	assert.equal(result.joinMonthLabel, null);
	assert.equal(result.location, '');
	assert.equal(result.websiteUrl, null);
	assert.equal(result.available, false);
	assert.equal(result.biographyHtml, '<p>Bio</p>');
});
