import { createSgfApiClientForOrigin } from '../api/factory';
import type { MediaSourceConfig } from '../media/config';
import { DirectoryDataError, mapDirectoryMembers, mapDirectorySkillFilters } from './mapper';
import type { DirectoryMemberView, DirectorySkillFilterView, PublicDirectoryMemberDto, PublicSkillFilterDto } from './mapper';

export type DirectoryView = {
	filters: DirectorySkillFilterView[];
	members: DirectoryMemberView[];
	totalMembers: number;
	visibleMembers: number;
};

export type DirectoryLoadOptions = {
	fetch: (request: Request) => Promise<Response>;
	cmsInternalOrigin: string | undefined;
	mediaConfig: MediaSourceConfig;
	url: URL;
	requestSignal?: AbortSignal;
	timeoutMs?: number;
};

export class DirectoryLoadError extends Error {
	readonly status: 400 | 404 | 502 | 503;
	readonly publicMessage: string;

	constructor(status: 400 | 404 | 502 | 503, publicMessage: string) {
		super(publicMessage);
		this.name = 'DirectoryLoadError';
		this.status = status;
		this.publicMessage = publicMessage;
	}
}

const defaultDirectoryTimeoutMs = 4_000;
const maxSkillTerms = 50;
const maxSkillTermLength = 128;

export async function loadDirectory(options: DirectoryLoadOptions): Promise<{ directory: DirectoryView }> {
	const selectedSkills = parseDirectorySkillQuery(options.url.searchParams);
	const selectedSkillsParam = selectedSkills.length ? selectedSkills.join(',') : undefined;
	const { controller, signal, timedOut, cleanup } = createBoundedSignal(options.requestSignal, options.timeoutMs ?? defaultDirectoryTimeoutMs);

	let api;
	try {
		api = createSgfApiClientForOrigin(options.fetch, options.cmsInternalOrigin);
	} catch {
		cleanup();
		throw new DirectoryLoadError(503, 'Directory data is unavailable because the CMS API is not configured.');
	}

	try {
		const filterRequest = api.GET('/api/directory/filters/skills', { signal });
		const allMembersRequest = api.GET('/api/directory/search', { signal });
		const selectedMembersRequest = selectedSkillsParam
			? api.GET('/api/directory/search', { params: { query: { skills: selectedSkillsParam } }, signal })
			: allMembersRequest;

		const [filtersResult, allMembersResult, selectedMembersResult] = await Promise.all([
			filterRequest,
			allMembersRequest,
			selectedMembersRequest
		]);

		const filterDtos = requireDirectoryApiData<PublicSkillFilterDto[]>(filtersResult, 'filters');
		const allMemberDtos = requireDirectoryApiData<PublicDirectoryMemberDto[]>(allMembersResult, 'members');
		const selectedMemberDtos = selectedMembersParamMatchesAll(selectedSkillsParam)
			? allMemberDtos
			: requireDirectoryApiData<PublicDirectoryMemberDto[]>(selectedMembersResult, 'members');

		const filters = mapDirectorySkillFilters(filterDtos, selectedSkills);
		const members = mapDirectoryMembers(selectedMemberDtos, options.mediaConfig);

		return {
			directory: {
				filters,
				members,
				totalMembers: allMemberDtos.length,
				visibleMembers: members.length
			}
		};
	} catch (error) {
		if (error instanceof DirectoryLoadError) throw error;
		if (timedOut()) {
			throw new DirectoryLoadError(503, 'Directory data timed out.');
		}
		if (controller.signal.aborted) {
			throw new DirectoryLoadError(503, 'Directory data request was cancelled.');
		}
		if (error instanceof DirectoryDataError) {
			throw new DirectoryLoadError(502, 'Directory data did not match the public contract.');
		}
		throw new DirectoryLoadError(502, 'Directory data could not be reached.');
	} finally {
		cleanup();
	}
}

export function parseDirectorySkillQuery(searchParams: URLSearchParams): string[] {
	const skills = searchParams
		.getAll('skills')
		.flatMap((value) => value.split(','))
		.map((value) => value.trim())
		.filter(Boolean);

	const unique: string[] = [];
	const seen = new Set<string>();
	for (const skill of skills) {
		if (skill.length > maxSkillTermLength) {
			throw new DirectoryLoadError(400, 'Directory skill filters are invalid.');
		}
		const key = skill.toLocaleLowerCase();
		if (!seen.has(key)) {
			seen.add(key);
			unique.push(skill);
		}
	}

	if (unique.length > maxSkillTerms) {
		throw new DirectoryLoadError(400, 'Directory skill filters are invalid.');
	}

	return unique;
}

type ApiResult<T> = { data?: T; error?: unknown; response: Response };

function requireDirectoryApiData<T>(result: ApiResult<T>, kind: 'filters' | 'members'): T {
	if (result.response.status === 400) {
		throw new DirectoryLoadError(400, 'Directory filter query was invalid.');
	}
	if (result.response.status === 404) {
		throw new DirectoryLoadError(404, kind === 'filters' ? 'Directory filters were not found.' : 'Directory members were not found.');
	}
	if (!result.response.ok || result.error || result.data === undefined) {
		throw new DirectoryLoadError(502, 'Directory data returned an upstream error.');
	}
	return result.data;
}

function selectedMembersParamMatchesAll(selectedSkillsParam: string | undefined): boolean {
	return !selectedSkillsParam;
}

function createBoundedSignal(requestSignal: AbortSignal | undefined, timeoutMs: number) {
	const controller = new AbortController();
	let timedOut = false;
	const timeout = setTimeout(() => {
		timedOut = true;
		controller.abort(timeoutReason());
	}, timeoutMs);
	const abortFromRequest = () => controller.abort(requestSignal?.reason);

	if (requestSignal?.aborted) {
		abortFromRequest();
	} else {
		requestSignal?.addEventListener('abort', abortFromRequest, { once: true });
	}

	return {
		controller,
		signal: controller.signal,
		timedOut: () => timedOut,
		cleanup: () => {
			clearTimeout(timeout);
			requestSignal?.removeEventListener('abort', abortFromRequest);
		}
	};
}

function timeoutReason(): DOMException | Error {
	if (typeof DOMException === 'function') {
		return new DOMException('Directory API request timed out.', 'TimeoutError');
	}
	return new Error('Directory API request timed out.');
}
