import type { components } from '../api/generated/sgfPublicApiSchema';
import type { MediaSourceConfig } from '../media/config';
import { STATIC_MEDIA_PASSTHROUGH } from '../media/validation';
import { mapMediaUrlToSameOrigin } from '../media/mapper';

export type PublicDirectoryMemberDto = components['schemas']['PublicDirectoryMemberDto'];
export type PublicHomeDevNightDto = components['schemas']['PublicHomeDevNightDto'];
export type PublicHomeDirectoryPreviewDto = components['schemas']['PublicHomeDirectoryPreviewDto'];
export type PublicHomeDto = components['schemas']['PublicHomeDto'];
export type PublicHomeGroupDto = components['schemas']['PublicHomeGroupDto'];
export type PublicHomePresentationDto = components['schemas']['PublicHomePresentationDto'];
export type PublicHomePresenterDto = components['schemas']['PublicHomePresenterDto'];
export type PublicHomeSponsorDto = components['schemas']['PublicHomeSponsorDto'];

export type PublicDirectoryMemberView = {
	name: string;
	location: string;
	image: string;
	url: string;
	tags: string[];
};

export type PublicHomePresenterView = {
	name: string;
	imageUrl: string;
	profilePath: string | null;
	tags: string[];
};

export type PublicHomeGroupView = {
	name: string;
	path: string;
	showAttribution: boolean;
};

export type PublicHomePresentationView = {
	title: string;
	meetupUrl: string | null;
	presenters: PublicHomePresenterView[];
	group: PublicHomeGroupView | null;
};

export type PublicHomeDevNightView = {
	name: string;
	startsAtLocal: string;
	timeZone: string;
	dateLabel: string;
	dateTimeAttribute: string;
	presentations: PublicHomePresentationView[];
};

export type PublicHomeDirectoryPreviewView = {
	totalMembers: number;
	dailyMembers: PublicDirectoryMemberView[];
};

export type PublicHomeSponsorView = {
	name: string;
	path: string;
	logoUrl: string | null;
	websiteUrl: string | null;
	websiteLabel: string | null;
	isFoundingSponsor: boolean;
};

export type PublicHomeView = {
	nextDevNight: PublicHomeDevNightView | null;
	directory: PublicHomeDirectoryPreviewView;
	sponsors: PublicHomeSponsorView[];
};

export class PublicHomeDataError extends Error {
	constructor(message = 'Public home payload did not match the generated contract.') {
		super(message);
		this.name = 'PublicHomeDataError';
	}
}

type JsonRecord = Record<string, unknown>;

const internalBase = 'https://sgf.dev';
const controlCharacterPattern = /[\u0000-\u001F\u007F]/;
const schemePattern = /^[A-Za-z][A-Za-z0-9+.-]*:/;

export function mapPublicHomeDto(dto: PublicHomeDto, mediaConfig: MediaSourceConfig): PublicHomeView {
	const source = requireRecord(dto, 'home');
	return {
		nextDevNight: source.nextDevNight === null || source.nextDevNight === undefined ? null : mapDevNight(source.nextDevNight, mediaConfig),
		directory: mapDirectory(source.directory, mediaConfig),
		sponsors: requireArray(source.sponsors, 'home.sponsors').map((sponsor, index) =>
			mapSponsor(sponsor, mediaConfig, `home.sponsors[${index}]`)
		)
	};
}

function mapDevNight(value: unknown, mediaConfig: MediaSourceConfig): PublicHomeDevNightView {
	const source = requireRecord(value, 'home.nextDevNight');
	return {
		name: requireString(source.name, 'home.nextDevNight.name'),
		startsAtLocal: requireString(source.startsAtLocal, 'home.nextDevNight.startsAtLocal'),
		timeZone: requireString(source.timeZone, 'home.nextDevNight.timeZone'),
		dateLabel: requireString(source.dateLabel, 'home.nextDevNight.dateLabel'),
		dateTimeAttribute: requireString(source.dateTimeAttribute, 'home.nextDevNight.dateTimeAttribute'),
		presentations: requireArray(source.presentations, 'home.nextDevNight.presentations').map((presentation, index) =>
			mapPresentation(presentation, mediaConfig, `home.nextDevNight.presentations[${index}]`)
		)
	};
}

function mapPresentation(value: unknown, mediaConfig: MediaSourceConfig, path: string): PublicHomePresentationView {
	const source = requireRecord(value, path);
	return {
		title: requireString(source.title, `${path}.title`),
		meetupUrl: mapOptionalExternalUrl(source.meetupUrl, `${path}.meetupUrl`),
		presenters: requireArray(source.presenters, `${path}.presenters`).map((presenter, index) =>
			mapPresenter(presenter, mediaConfig, `${path}.presenters[${index}]`)
		),
		group: source.group === null || source.group === undefined ? null : mapGroup(source.group, `${path}.group`)
	};
}

function mapPresenter(value: unknown, mediaConfig: MediaSourceConfig, path: string): PublicHomePresenterView {
	const source = requireRecord(value, path);
	return {
		name: requireString(source.name, `${path}.name`),
		imageUrl: mapMediaUrlToSameOrigin(requireString(source.imageUrl, `${path}.imageUrl`), mediaConfig) ?? STATIC_MEDIA_PASSTHROUGH,
		profilePath: mapOptionalInternalPath(source.profilePath, `${path}.profilePath`),
		tags: mapStringArray(source.tags, `${path}.tags`)
	};
}

function mapGroup(value: unknown, path: string): PublicHomeGroupView {
	const source = requireRecord(value, path);
	return {
		name: requireString(source.name, `${path}.name`),
		path: requireInternalPath(source.path, `${path}.path`),
		showAttribution: requireBoolean(source.showAttribution, `${path}.showAttribution`)
	};
}

function mapDirectory(value: unknown, mediaConfig: MediaSourceConfig): PublicHomeDirectoryPreviewView {
	const source = requireRecord(value, 'home.directory');
	return {
		totalMembers: normalizeCount(source.totalMembers, 'home.directory.totalMembers'),
		dailyMembers: requireArray(source.dailyMembers, 'home.directory.dailyMembers').map((member, index) =>
			mapDirectoryMember(member, mediaConfig, `home.directory.dailyMembers[${index}]`)
		)
	};
}

function mapDirectoryMember(value: unknown, mediaConfig: MediaSourceConfig, path: string): PublicDirectoryMemberView {
	const source = requireRecord(value, path);
	return {
		name: requireString(source.name, `${path}.name`),
		location: requireString(source.location, `${path}.location`),
		image: mapMediaUrlToSameOrigin(requireString(source.image, `${path}.image`), mediaConfig) ?? STATIC_MEDIA_PASSTHROUGH,
		url: requireInternalPath(source.url, `${path}.url`),
		tags: mapStringArray(source.tags, `${path}.tags`)
	};
}

function mapSponsor(value: unknown, mediaConfig: MediaSourceConfig, path: string): PublicHomeSponsorView {
	const source = requireRecord(value, path);
	const websiteUrl = mapOptionalExternalUrl(source.websiteUrl, `${path}.websiteUrl`);
	return {
		name: requireString(source.name, `${path}.name`),
		path: requireInternalPath(source.path, `${path}.path`),
		logoUrl: mapMediaUrlToSameOrigin(optionalString(source.logoUrl, `${path}.logoUrl`), mediaConfig),
		websiteUrl,
		websiteLabel: websiteUrl ? optionalString(source.websiteLabel, `${path}.websiteLabel`) : null,
		isFoundingSponsor: requireBoolean(source.isFoundingSponsor, `${path}.isFoundingSponsor`)
	};
}

function requireRecord(value: unknown, path: string): JsonRecord {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw new PublicHomeDataError(`${path} must be an object.`);
	}
	return value as JsonRecord;
}

function requireArray(value: unknown, path: string): unknown[] {
	if (!Array.isArray(value)) {
		throw new PublicHomeDataError(`${path} must be an array.`);
	}
	return value;
}

function requireString(value: unknown, path: string): string {
	if (typeof value !== 'string') {
		throw new PublicHomeDataError(`${path} must be a string.`);
	}
	return value;
}

function optionalString(value: unknown, path: string): string | null {
	if (value === null || value === undefined) return null;
	return requireString(value, path);
}

function requireBoolean(value: unknown, path: string): boolean {
	if (typeof value !== 'boolean') {
		throw new PublicHomeDataError(`${path} must be a boolean.`);
	}
	return value;
}

function mapStringArray(value: unknown, path: string): string[] {
	return requireArray(value, path).map((item, index) => requireString(item, `${path}[${index}]`));
}

function normalizeCount(value: unknown, path: string): number {
	if (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0) return value;
	if (typeof value === 'string' && /^(0|[1-9][0-9]*)$/.test(value)) {
		const parsed = Number(value);
		if (Number.isSafeInteger(parsed)) return parsed;
	}
	throw new PublicHomeDataError(`${path} must be a non-negative integer.`);
}

function mapOptionalInternalPath(value: unknown, path: string): string | null {
	if (value === null || value === undefined) return null;
	return requireInternalPath(value, path);
}

function requireInternalPath(value: unknown, path: string): string {
	const raw = requireString(value, path);
	if (
		!raw.startsWith('/') ||
		raw.startsWith('//') ||
		raw.includes('\\') ||
		raw.includes('?') ||
		raw.includes('#') ||
		controlCharacterPattern.test(raw) ||
		schemePattern.test(raw)
	) {
		throw new PublicHomeDataError(`${path} must be a same-origin relative path.`);
	}

	let url: URL;
	try {
		url = new URL(raw, internalBase);
	} catch {
		throw new PublicHomeDataError(`${path} must be a valid relative path.`);
	}
	if (url.origin !== internalBase || url.username || url.password || url.search || url.hash || !url.pathname.startsWith('/')) {
		throw new PublicHomeDataError(`${path} must stay on the site origin.`);
	}
	if (url.pathname.startsWith('//') || url.pathname.includes('\\') || controlCharacterPattern.test(url.pathname)) {
		throw new PublicHomeDataError(`${path} must stay on a normal site path.`);
	}
	return url.pathname;
}

function mapOptionalExternalUrl(value: unknown, path: string): string | null {
	const raw = optionalString(value, path);
	if (!raw) return null;
	if (raw.startsWith('//') || raw.includes('\\') || controlCharacterPattern.test(raw)) return null;
	let url: URL;
	try {
		url = new URL(raw);
	} catch {
		return null;
	}
	if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
	return url.href;
}
