import type { PublicGroupDto } from '../../src/lib/server/groups/mapper';

export const media = { publicSourceOrigin: 'https://media.example.test', cmsInternalOrigin: 'http://cms.example.test' };
export function groupFixture(name = 'Z synthetic group', path = '/groups/Rust-SGF/'): PublicGroupDto {
	return {
		name, path, aboutHtml: '<p>Existing group about text <strong>unchanged</strong>.</p>',
		imageUrl: '/media/synthetic/group.jpg', location: 'Springfield, MO', establishedText: 'Established October 2020',
		websiteUrl: 'https://example.test/group', twitterUrl: 'javascript:bad()', linkedInUrl: null, facebookUrl: null, instagramUrl: null, youTubeUrl: null,
		skills: [{ name: 'Rust', slug: 'Rust' }],
		leaders: [{ name: 'Jane Example', listLabel: 'Jane E.', location: 'Springfield, MO', imageUrl: '/images/pipey.jpg', profilePath: '/member/Jane', tags: ['Supporting Member'] }],
		upcomingPresentations: [{ title: 'Synthetic presentation', eventName: 'Synthetic event', startsAtLocal: '2026-10-07T18:30:00',
			presenters: [{ name: 'Jane Example', imageUrl: '/images/pipey.jpg', profilePath: '/member/Jane', tags: ['Supporting Member'] }] }]
	};
}
