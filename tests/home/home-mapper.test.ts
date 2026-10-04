import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapPublicHomeDto, PublicHomeDataError, type PublicHomeDto } from '../../src/lib/server/home/mapper';
import type { MediaSourceConfig } from '../../src/lib/server/media/config';

const mediaConfig: MediaSourceConfig = {
	publicSourceOrigin: 'https://media.sgf.dev',
	cmsInternalOrigin: 'http://127.0.0.1:5099'
};

function homeDto(): PublicHomeDto {
	return {
		nextDevNight: {
			name: 'Fictional Dev Night',
			startsAtLocal: '2026-10-07T18:30:00',
			timeZone: 'America/Chicago',
			dateLabel: 'Oct 7, 2026',
			dateTimeAttribute: '10-07-2026 18:30:00',
			presentations: [
				{
					title: 'Tiny Robots',
					meetupUrl: 'https://www.meetup.com/sgfdevs/events/fictional/',
					presenters: [
						{
							name: 'Casey Ada',
							imageUrl: 'https://media.sgf.dev/people/casey.jpg?width=500&v=abc123',
							profilePath: '/member/CaseyAda',
							tags: ['C#', 'Svelte']
						},
						{
							name: 'Morgan Null',
							imageUrl: 'https://media.sgf.dev/people/morgan.svg',
							profilePath: null,
							tags: []
						}
					],
					group: {
						name: 'Frontend Design',
						path: '/groups/frontend-design/',
						showAttribution: true
					}
				}
			]
		},
		directory: {
			totalMembers: '2',
			dailyMembers: [
				{
					name: 'Riley Member',
					location: 'Springfield, MO',
					image: '/media/members/riley.png?width=500&v=v1',
					url: '/member/RileyMember',
					tags: ['JavaScript']
				}
			]
		},
		sponsors: [
			{
				name: 'Fictional Sponsor',
				path: '/companies/fictional-sponsor/',
				logoUrl: 'http://127.0.0.1:5099/media/sponsors/logo.png?v=logo1',
				websiteUrl: 'https://sponsor.example/path',
				websiteLabel: 'sponsor.example',
				isFoundingSponsor: false
			}
		]
	};
}

describe('home DTO mapper', () => {
	it('maps only public generated home fields and keeps public strings in source order', () => {
		const view = mapPublicHomeDto(homeDto(), mediaConfig);

		assert.equal(view.nextDevNight?.name, 'Fictional Dev Night');
		assert.equal(view.nextDevNight?.startsAtLocal, '2026-10-07T18:30:00');
		assert.equal(view.nextDevNight?.timeZone, 'America/Chicago');
		assert.equal(view.nextDevNight?.dateLabel, 'Oct 7, 2026');
		assert.equal(view.nextDevNight?.dateTimeAttribute, '10-07-2026 18:30:00');
		assert.equal(view.nextDevNight?.presentations[0]?.presenters[0]?.profilePath, '/member/CaseyAda');
		assert.deepEqual(view.nextDevNight?.presentations[0]?.presenters[0]?.tags, ['C#', 'Svelte']);
		assert.equal(view.nextDevNight?.presentations[0]?.group?.path, '/groups/frontend-design/');
		assert.equal(view.directory.totalMembers, 2);
		assert.equal(view.directory.dailyMembers[0]?.url, '/member/RileyMember');
		assert.equal(view.sponsors[0]?.path, '/companies/fictional-sponsor/');
	});

	it('rewrites approved media fields to same-origin media URLs and uses fallbacks for unsupported images', () => {
		const view = mapPublicHomeDto(homeDto(), mediaConfig);

		assert.equal(view.nextDevNight?.presentations[0]?.presenters[0]?.imageUrl, '/media/people/casey.jpg?width=500&v=abc123');
		assert.equal(view.nextDevNight?.presentations[0]?.presenters[1]?.imageUrl, '/images/pipey.jpg');
		assert.equal(view.directory.dailyMembers[0]?.image, '/media/members/riley.png?width=500&v=v1');
		assert.equal(view.sponsors[0]?.logoUrl, '/media/sponsors/logo.png?v=logo1');
	});

	it('drops invalid external links and does not leak paired labels', () => {
		const dto = homeDto();
		dto.nextDevNight!.presentations[0]!.meetupUrl = 'javascript:alert(1)';
		dto.sponsors[0]!.websiteUrl = 'https://user:pass@sponsor.example/private';
		dto.sponsors[0]!.websiteLabel = 'private.example/reset-token';

		const view = mapPublicHomeDto(dto, mediaConfig);

		assert.equal(view.nextDevNight?.presentations[0]?.meetupUrl, null);
		assert.equal(view.sponsors[0]?.websiteUrl, null);
		assert.equal(view.sponsors[0]?.websiteLabel, null);
	});

	it('rejects unsafe internal paths without host switching', () => {
		for (const badPath of ['//evil.example/member/x', 'https://evil.example/member/x', '/member/x?reset-token=secret', '/member/x#token', '/member/evil\\host']) {
			const dto = homeDto();
			dto.directory.dailyMembers[0]!.url = badPath;
			assert.throws(() => mapPublicHomeDto(dto, mediaConfig), PublicHomeDataError);
		}
	});

	it('keeps null and empty valid collections honest', () => {
		const dto: PublicHomeDto = {
			nextDevNight: null,
			directory: { totalMembers: 0, dailyMembers: [] },
			sponsors: []
		};

		assert.deepEqual(mapPublicHomeDto(dto, mediaConfig), {
			nextDevNight: null,
			directory: { totalMembers: 0, dailyMembers: [] },
			sponsors: []
		});
	});

	it('fails malformed required data instead of inventing empty values', () => {
		const invalidMembers = homeDto() as unknown as { directory: { dailyMembers: unknown; totalMembers: unknown } };
		invalidMembers.directory.dailyMembers = {};
		assert.throws(() => mapPublicHomeDto(invalidMembers as PublicHomeDto, mediaConfig), PublicHomeDataError);

		const invalidCount = homeDto();
		invalidCount.directory.totalMembers = 'two';
		assert.throws(() => mapPublicHomeDto(invalidCount, mediaConfig), PublicHomeDataError);
	});

	it('does not serialize unknown nested private fields from upstream JSON', () => {
		const raw = homeDto() as PublicHomeDto & {
			nextDevNight: NonNullable<PublicHomeDto['nextDevNight']> & { resetPasswordToken?: string };
			directory: PublicHomeDto['directory'] & { email?: string };
			sponsors: Array<PublicHomeDto['sponsors'][number] & { apiKey?: string }>;
		};
		raw.nextDevNight.resetPasswordToken = 'secret-reset-token';
		raw.directory.email = 'member@example.invalid';
		raw.sponsors[0]!.apiKey = 'x-api-key-secret';

		const serialized = JSON.stringify(mapPublicHomeDto(raw, mediaConfig));

		assert.equal(serialized.includes('secret-reset-token'), false);
		assert.equal(serialized.includes('member@example.invalid'), false);
		assert.equal(serialized.includes('x-api-key-secret'), false);
	});
});
