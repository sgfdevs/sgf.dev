import type { PublicMemberProfileDto } from '../../src/lib/server/member/mapper';

export const mediaConfig = { publicSourceOrigin: 'https://media.sgf.dev', cmsInternalOrigin: 'http://127.0.0.1:5099' };
export const profile: PublicMemberProfileDto = {
	username: 'Ada123', name: 'Ada Lovelace', firstName: 'Ada', lastName: 'Lovelace',
	jobTitle: 'Software Developer', profileImageUrl: '/media/synthetic/profile.png?width=800',
	tags: ['Founding Member', '2024, 2026 Supporting Member'],
	city: 'Springfield', state: 'MO', joinMonthLabel: 'December 2020',
	aboutHtml: '<p>I build <strong>software</strong>.</p>',
	skills: [{ name: 'JavaScript', directoryFilterValue: '17d3e25e-bd1f-4a4c-98ef-89ad894d4f7d' }],
	websiteUrl: 'https://example.test/', websiteLabel: 'example.test',
	twitterUrl: 'https://example.test/twitter', linkedInUrl: 'https://example.test/linkedin',
	facebookUrl: 'https://example.test/facebook', instagramUrl: 'https://example.test/instagram', youTubeUrl: 'https://example.test/youtube',
	availableForHire: true, availableForContractWork: false
};
