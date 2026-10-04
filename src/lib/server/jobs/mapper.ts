import type { components } from '../api/generated/sgfPublicApiSchema';
import type { MediaSourceConfig } from '../media/config';
import { sanitizePageHtml, safePageHref } from '../pages/html';
import { isJobPath } from './paths';

export type PublicJobDto = components['schemas']['PublicJobDto'];
export class JobDataError extends Error {}
function record(value: unknown): Record<string, unknown> {
	if (!value || typeof value !== 'object' || Array.isArray(value)) throw new JobDataError();
	return value as Record<string, unknown>;
}
function text(value: unknown): string {
	if (typeof value !== 'string') throw new JobDataError();
	return value;
}
function optional(value: unknown): string { return value == null ? '' : text(value); }

export function mapJobRow(value: PublicJobDto) {
	const source = record(value), rawPath = text(source.path);
	const path = rawPath.endsWith('/') ? rawPath : rawPath + '/';
	if (!isJobPath(path)) throw new JobDataError();
	return {
		path, name: text(source.name), companyName: text(source.companyName), location: optional(source.location),
		employmentType: optional(source.employmentType), compensation: optional(source.compensation), posted: text(source.posted)
	};
}
export function mapJobs(value: PublicJobDto[]) {
	if (!Array.isArray(value)) throw new JobDataError();
	return {
		path: '/jobs/', title: 'Springfield Devs - Jobs', ogImage: null,
		description: 'Jobs from Springfield Devs companies.', rows: value.map(mapJobRow)
	};
}
export function mapJob(value: PublicJobDto, requestedPath: string, media: MediaSourceConfig) {
	const source = record(value), row = mapJobRow(value);
	if (row.path.toLowerCase() !== requestedPath.toLowerCase() || !Array.isArray(source.skills) ||
		source.skills.some(skill => typeof skill !== 'string')) throw new JobDataError();
	let applyUrl = safePageHref(optional(source.applyUrl), media);
	if (applyUrl && new URL(applyUrl, 'https://sgf.dev').origin === media.cmsInternalOrigin) applyUrl = null;
	return {
		...row, title: `Springfield Devs - ${row.name} at ${row.companyName}`, ogImage: null,
		description: `${row.name} at ${row.companyName}`,
		descriptionHtml: sanitizePageHtml(optional(source.descriptionHtml), media),
		applyUrl, skills: source.skills.map(text)
	};
}
export type JobsView = ReturnType<typeof mapJobs>;
export type JobView = ReturnType<typeof mapJob>;
