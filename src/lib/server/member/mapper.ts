import type { components } from '../api/generated/sgfPublicApiSchema';
import { isPublicMemberUsername } from '../api/factory';
import type { MediaSourceConfig } from '../media/config';
import { mapMediaUrlToSameOrigin } from '../media/mapper';
import { sanitizeMemberBiography } from './biography';
import { safeMemberHttpUrl } from './links';

export type PublicMemberProfileDto = components['schemas']['PublicMemberProfileDto'];
export type MemberView = {
	name: string;
	url: string;
	jobTitle: string | null;
	image: string;
	tags: string[];
	location: string;
	joinMonthLabel: string | null;
	biographyHtml: string;
	skills: { name: string; url: string }[];
	websiteUrl: string | null;
	socials: { label: string; url: string }[];
	available: boolean;
};

export class MemberDataError extends Error {}

export function mapPublicMemberProfile(value: PublicMemberProfileDto, mediaConfig: MediaSourceConfig): MemberView {
	const source = record(value);
	const username = string(source.username);
	if (!isPublicMemberUsername(username)) throw new MemberDataError();
	const availableForHire = boolean(source.availableForHire);
	const availableForContractWork = boolean(source.availableForContractWork);
	const websiteUrl = safeMemberHttpUrl(optionalString(source.websiteUrl));
	const websiteLabel = optionalString(source.websiteLabel);
	const socials: MemberView['socials'] = websiteUrl ? [{ label: websiteLabel ?? new URL(websiteUrl).hostname, url: websiteUrl }] : [];
	for (const [field, label] of [
		['twitterUrl', 'Twitter'], ['linkedInUrl', 'LinkedIn'], ['facebookUrl', 'Facebook'],
		['instagramUrl', 'Instagram'], ['youTubeUrl', 'Youtube']
	] as const) {
		const url = safeMemberHttpUrl(optionalString(source[field]));
		if (url) socials.push({ label, url });
	}

	// Explicit nested whitelist, never return a DTO/property spread.
	return {
		name: string(source.name),
		url: '/member/' + username,
		jobTitle: optionalString(source.jobTitle),
		image: mapMediaUrlToSameOrigin(string(source.profileImageUrl), mediaConfig) ?? '/images/pipey.jpg',
		tags: array(source.tags).map(string),
		location: [optionalString(source.city), optionalString(source.state)].filter(Boolean).join(', '),
		joinMonthLabel: optionalString(source.joinMonthLabel),
		biographyHtml: sanitizeMemberBiography(optionalString(source.aboutHtml)),
		skills: array(source.skills).map((value) => {
			const skill = record(value);
			const term = string(skill.directoryFilterValue);
			if (!term.length || term.length > 128 || /[,\u0000-\u001f\u007f]/.test(term)) throw new MemberDataError();
			return { name: string(skill.name), url: '/directory/?skills=' + encodeURIComponent(term) };
		}),
		websiteUrl,
		socials,
		available: availableForHire || availableForContractWork
	};
}

function record(value: unknown): Record<string, unknown> {
	if (!value || typeof value !== 'object' || Array.isArray(value)) throw new MemberDataError();
	return value as Record<string, unknown>;
}
function string(value: unknown): string {
	if (typeof value !== 'string') throw new MemberDataError();
	return value;
}
function optionalString(value: unknown): string | null {
	return value === null || value === undefined ? null : string(value);
}
function array(value: unknown): unknown[] {
	if (!Array.isArray(value)) throw new MemberDataError();
	return value;
}
function boolean(value: unknown): boolean {
	if (typeof value !== 'boolean') throw new MemberDataError();
	return value;
}
