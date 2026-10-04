import type { PublicJobDto } from '../../src/lib/server/jobs/mapper';
export const media = { publicSourceOrigin: 'https://media.example.test', cmsInternalOrigin: 'http://127.0.0.1:5099' };
export function jobFixture(): PublicJobDto {
	return { name: 'Z synthetic engineer', companyName: 'Synthetic company', path: '/companies/element-11/mid-level-engineer/',
		location: 'Springfield, MO', employmentType: 'Full time', compensation: '$90,000', posted: 'January 2, 2001',
		descriptionHtml: '<p>Build <strong>useful software</strong>.</p><ul><li>Work with the team</li></ul>',
		applyUrl: 'https://example.test/apply', skills: ['C#', 'TypeScript', 'C#'] };
}
export function jobsFixture(): PublicJobDto[] {
	return [jobFixture(), { ...jobFixture(), name: 'A synthetic designer', path: '/companies/wwt/ux-designer/', companyName: 'Second company', posted: 'September 3, 2026' }];
}
