/**
 * Generated from openapi/sgf-public-v1.openapi.json.
 * Do not edit by hand. Run npm run api:generate.
 */

export interface paths {
    "/api/tags/skills": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["Directory_GetSkillNames"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/directory/filters/skills": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["Directory_GetSkillFilters"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/directory/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["Directory_Search"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/public/home": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["PublicHome_Get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/public/members/{username}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["PublicMember_Get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        ProblemDetails: {
            type?: null | string;
            title?: null | string;
            /** Format: int32 */
            status?: null | number | string;
            detail?: null | string;
            instance?: null | string;
        };
        PublicDirectoryMemberDto: {
            name: string;
            location: string;
            image: string;
            url: string;
            tags: string[];
        };
        PublicHomeDevNightDto: {
            name: string;
            startsAtLocal: string;
            timeZone: string;
            dateLabel: string;
            dateTimeAttribute: string;
            presentations: components["schemas"]["PublicHomePresentationDto"][];
        };
        PublicHomeDirectoryPreviewDto: {
            /** Format: int32 */
            totalMembers: number | string;
            dailyMembers: components["schemas"]["PublicDirectoryMemberDto"][];
        };
        PublicHomeDto: {
            nextDevNight?: null | components["schemas"]["PublicHomeDevNightDto"];
            directory: components["schemas"]["PublicHomeDirectoryPreviewDto"];
            sponsors: components["schemas"]["PublicHomeSponsorDto"][];
        };
        PublicHomeGroupDto: {
            name: string;
            path: string;
            showAttribution: boolean;
        };
        PublicHomePresentationDto: {
            title: string;
            meetupUrl?: null | string;
            presenters: components["schemas"]["PublicHomePresenterDto"][];
            group?: null | components["schemas"]["PublicHomeGroupDto"];
        };
        PublicHomePresenterDto: {
            name: string;
            imageUrl: string;
            profilePath?: null | string;
            tags: string[];
        };
        PublicHomeSponsorDto: {
            name: string;
            path: string;
            logoUrl?: null | string;
            websiteUrl?: null | string;
            websiteLabel?: null | string;
            isFoundingSponsor: boolean;
        };
        PublicMemberProfileDto: {
            username: string;
            name: string;
            firstName?: null | string;
            lastName?: null | string;
            jobTitle?: null | string;
            profileImageUrl: string;
            tags?: string[];
            city?: null | string;
            state?: null | string;
            joinMonthLabel?: null | string;
            aboutHtml?: null | string;
            skills?: components["schemas"]["PublicMemberSkillDto"][];
            websiteUrl?: null | string;
            websiteLabel?: null | string;
            twitterUrl?: null | string;
            linkedInUrl?: null | string;
            facebookUrl?: null | string;
            instagramUrl?: null | string;
            youTubeUrl?: null | string;
            availableForHire?: boolean;
            availableForContractWork?: boolean;
        };
        PublicMemberSkillDto: {
            name: string;
            directoryFilterValue: string;
        };
        PublicSkillFilterDto: {
            name: string;
            /** Format: int32 */
            id?: number | string;
            /** Format: uuid */
            key?: string;
            isActive?: boolean;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    Directory_GetSkillNames: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
        };
    };
    Directory_GetSkillFilters: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicSkillFilterDto"][];
                };
            };
        };
    };
    Directory_Search: {
        parameters: {
            query?: {
                skills?: string;
                skip?: number | string;
                take?: number | string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicDirectoryMemberDto"][];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    PublicHome_Get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicHomeDto"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetails"];
                    "application/json": unknown;
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetails"];
                    "application/json": unknown;
                };
            };
        };
    };
    PublicMember_Get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                username: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicMemberProfileDto"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
}
