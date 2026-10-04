import type { components } from '../api/generated/sgfPublicApiSchema';
import { isPublicGroupSlug, isPublicMemberUsername } from '../api/factory';
import type { MediaSourceConfig } from '../media/config';
import { mapMediaUrlToSameOrigin } from '../media/mapper';
import { safeMemberHttpUrl } from '../member/links';
import { sanitizePageHtml } from '../pages/html';
import { mapPresenter } from '../home/mapper';

export type PublicGroupDto = components['schemas']['PublicGroupDto'];
export type GroupView = ReturnType<typeof mapGroup>;

export class GroupDataError extends Error {}
function record(value: unknown): Record<string, unknown> {
	if (!value || typeof value !== 'object' || Array.isArray(value)) throw new GroupDataError();
	return value as Record<string, unknown>;
}
function text(value: unknown): string {
	if (typeof value !== 'string') throw new GroupDataError();
	return value;
}
function optional(value: unknown): string | null {
	return value == null ? null : text(value);
}
function array(value: unknown): unknown[] {
	if (!Array.isArray(value)) throw new GroupDataError();
	return value;
}
function profilePath(value: unknown): string {
	const path = text(value);
	if (!path.startsWith('/member/') || !isPublicMemberUsername(path.slice(8))) throw new GroupDataError();
	return path;
}
export function groupPath(value: unknown): string {
	const path = text(value);
	const match = /^\/groups\/([^/]+)\/?$/.exec(path);
	if (!match || !isPublicGroupSlug(match[1])) throw new GroupDataError();
	return path;
}

export function mapGroup(value: PublicGroupDto, media: MediaSourceConfig) {
	const group = record(value);
	const websiteUrl = safeMemberHttpUrl(optional(group.websiteUrl));
	const socialSources: [string, string | null][] = [
		['Website', websiteUrl], ['Twitter', optional(group.twitterUrl)], ['LinkedIn', optional(group.linkedInUrl)],
		['Facebook', optional(group.facebookUrl)], ['Instagram', optional(group.instagramUrl)], ['Youtube', optional(group.youTubeUrl)]
	];
	const socials = socialSources.flatMap(([label, raw]) => {
		const url = safeMemberHttpUrl(raw);
		return url ? [{ label, url }] : [];
	});
	return {
		name: text(group.name), path: groupPath(group.path),
		aboutHtml: sanitizePageHtml(optional(group.aboutHtml) ?? '', media),
		image: mapMediaUrlToSameOrigin(optional(group.imageUrl), media),
		location: optional(group.location), establishedText: optional(group.establishedText), websiteUrl, socials,
		skills: array(group.skills).map(value => {
			const skill = record(value);
			const term = text(skill.directoryFilterValue);
			if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(term)) throw new GroupDataError();
			return { name: text(skill.name), url: `/directory/?skills=${encodeURIComponent(term)}` };
		}),
		leaders: array(group.leaders).map(value => {
			const leader = record(value);
			return {
				name: text(leader.name), listLabel: text(leader.listLabel), location: text(leader.location),
				image: mapMediaUrlToSameOrigin(text(leader.imageUrl), media), path: profilePath(leader.profilePath),
				tags: array(leader.tags).map(text)
			};
		}),
		upcomingPresentations: array(group.upcomingPresentations).map(value => {
			const presentation = record(value);
			const startsAtLocal = text(presentation.startsAtLocal);
			if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(startsAtLocal)) throw new GroupDataError();
			return {
				title: text(presentation.title), eventName: text(presentation.eventName), startsAtLocal,
				presenters: array(presentation.presenters).map(value => {
					const presenter = record(value);
					if (presenter.profilePath != null) profilePath(presenter.profilePath);
					return mapPresenter(presenter, media);
				})
			};
		})
	};
}
