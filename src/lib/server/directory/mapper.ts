import type { components } from '../api/generated/sgfPublicApiSchema';
import type { MediaSourceConfig } from '../media/config';
import { mapMediaUrlToSameOrigin } from '../media/mapper';
import { STATIC_MEDIA_PASSTHROUGH } from '../media/validation';

export type PublicDirectoryMemberDto = components['schemas']['PublicDirectoryMemberDto'];
export type PublicSkillFilterDto = components['schemas']['PublicSkillFilterDto'];

export type DirectoryMemberView = {
	name: string;
	location: string;
	image: string;
	url: string;
	tags: string[];
};

export type DirectorySkillFilterView = {
	name: string;
	value: string;
	active: boolean;
};

export class DirectoryDataError extends Error {
	constructor(message = 'Directory payload did not match the generated contract.') {
		super(message);
		this.name = 'DirectoryDataError';
	}
}

type JsonRecord = Record<string, unknown>;

const internalBase = 'https://sgf.dev';
const controlCharacterPattern = /[\u0000-\u001F\u007F]/;
const schemePattern = /^[A-Za-z][A-Za-z0-9+.-]*:/;

export function mapDirectoryMembers(members: PublicDirectoryMemberDto[], mediaConfig: MediaSourceConfig): DirectoryMemberView[] {
	return requireArray(members, 'directory.members').map((member, index) =>
		mapDirectoryMember(member, mediaConfig, `directory.members[${index}]`)
	);
}

export function mapDirectorySkillFilters(filters: PublicSkillFilterDto[], selectedSkills: readonly string[]): DirectorySkillFilterView[] {
	const selected = new Set(selectedSkills.map((skill) => skill.toLocaleLowerCase()));
	return requireArray(filters, 'directory.filters').map((filter, index) =>
		mapSkillFilter(filter, selected, `directory.filters[${index}]`)
	);
}

function mapDirectoryMember(value: unknown, mediaConfig: MediaSourceConfig, path: string): DirectoryMemberView {
	const source = requireRecord(value, path);
	return {
		name: requireString(source.name, `${path}.name`),
		location: requireString(source.location, `${path}.location`),
		image: mapMediaUrlToSameOrigin(requireString(source.image, `${path}.image`), mediaConfig) ?? STATIC_MEDIA_PASSTHROUGH,
		url: requireInternalPath(source.url, `${path}.url`),
		tags: mapStringArray(source.tags, `${path}.tags`)
	};
}

function mapSkillFilter(value: unknown, selected: ReadonlySet<string>, path: string): DirectorySkillFilterView {
	const source = requireRecord(value, path);
	const name = requireString(source.name, `${path}.name`);
	const id = optionalIntegerToken(source.id, `${path}.id`);
	const key = optionalString(source.key, `${path}.key`);
	const valueToken = id ?? key ?? name;
	const aliases = [valueToken, id, key, name].filter((item): item is string => Boolean(item));

	return {
		name,
		value: valueToken,
		active: aliases.some((alias) => selected.has(alias.toLocaleLowerCase()))
	};
}

function requireRecord(value: unknown, path: string): JsonRecord {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw new DirectoryDataError(`${path} must be an object.`);
	}
	return value as JsonRecord;
}

function requireArray(value: unknown, path: string): unknown[] {
	if (!Array.isArray(value)) {
		throw new DirectoryDataError(`${path} must be an array.`);
	}
	return value;
}

function requireString(value: unknown, path: string): string {
	if (typeof value !== 'string') {
		throw new DirectoryDataError(`${path} must be a string.`);
	}
	return value;
}

function optionalString(value: unknown, path: string): string | null {
	if (value === null || value === undefined) return null;
	return requireString(value, path);
}

function optionalIntegerToken(value: unknown, path: string): string | null {
	if (value === null || value === undefined) return null;
	if (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0) return String(value);
	if (typeof value === 'string' && /^(0|[1-9][0-9]*)$/.test(value)) return value;
	throw new DirectoryDataError(`${path} must be a non-negative integer.`);
}

function mapStringArray(value: unknown, path: string): string[] {
	return requireArray(value, path).map((item, index) => requireString(item, `${path}[${index}]`));
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
		throw new DirectoryDataError(`${path} must be a same-origin relative path.`);
	}

	let url: URL;
	try {
		url = new URL(raw, internalBase);
	} catch {
		throw new DirectoryDataError(`${path} must be a valid relative path.`);
	}
	if (url.origin !== internalBase || url.username || url.password || url.search || url.hash || !url.pathname.startsWith('/')) {
		throw new DirectoryDataError(`${path} must stay on the site origin.`);
	}
	if (url.pathname.startsWith('//') || url.pathname.includes('\\') || controlCharacterPattern.test(url.pathname)) {
		throw new DirectoryDataError(`${path} must stay on a normal site path.`);
	}
	return url.pathname;
}
