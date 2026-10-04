import type { components } from '../api/generated/sgfPublicApiSchema';
import { isPublicMemberUsername } from '../api/factory';
import type { MediaSourceConfig } from '../media/config';
import { mapMediaUrlToSameOrigin } from '../media/mapper';
import { sanitizePageHtml } from '../pages/html';

export type PublicLeadershipDto = components['schemas']['PublicLeadershipDto'];
export class LeadershipDataError extends Error {}
function record(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new LeadershipDataError();
    return value as Record<string, unknown>;
}
function text(value: unknown): string {
    if (typeof value !== 'string') throw new LeadershipDataError();
    return value;
}
function optional(value: unknown): string | null {
    return value == null ? null : text(value);
}

export function mapLeadership(value: PublicLeadershipDto, media: MediaSourceConfig) {
    const source = record(value);
    function members(value: unknown, includeTitle: boolean, includeBio: boolean) {
        if (!Array.isArray(value)) throw new LeadershipDataError();
        return value.map(value => {
            const member = record(value);
            if (!isPublicMemberUsername(member.username)) throw new LeadershipDataError();
            return {
                name: text(member.name), path: `/member/${member.username}`,
                image: mapMediaUrlToSameOrigin(text(member.imageUrl), media) ?? '/images/pipey.jpg',
                officerTitle: includeTitle ? optional(member.officerTitle) : null,
                officerBio: includeBio ? sanitizePageHtml(optional(member.officerBio) ?? '', media) : ''
            };
        });
    }
    return {
        path: '/about/leadership/', title: 'Springfield Devs - Leadership', ogImage: null,
        description: 'Springfield Devs is a community of software developers in Springfield, Missouri.',
        officers: members(source.officers, true, true),
        boardOfDirectors: members(source.boardOfDirectors, false, false),
        history: members(source.history, true, false)
    };
}
