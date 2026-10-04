/** Generated from openapi/sgf-member-v1.openapi.json. Run npm run api:member:generate. */
export interface paths {
    "/api/v1/member/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["Member_Register"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/member/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["Member_Login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/member/session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["Member_Session"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/member/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["Member_Logout"];
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
        MemberLoginRequest: {
            username: null | string;
            password: null | string;
            /** @default true */
            rememberMe: boolean;
        };
        MemberLoginResult: {
            succeeded: boolean;
        };
        MemberRegistrationRequest: {
            firstName?: null | string;
            lastName?: null | string;
            email?: null | string;
            username?: null | string;
            password?: null | string;
            challengeQuestion?: null | string;
        };
        MemberRegistrationResult: {
            succeeded: boolean;
            errors: {
                [key: string]: string[];
            };
        };
        MemberSessionDto: {
            username: string;
            name: string;
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
    Member_Register: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MemberRegistrationRequest"];
                "text/json": components["schemas"]["MemberRegistrationRequest"];
                "application/*+json": components["schemas"]["MemberRegistrationRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemberRegistrationResult"];
                    "text/json": components["schemas"]["MemberRegistrationResult"];
                    "text/plain": components["schemas"]["MemberRegistrationResult"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemberRegistrationResult"];
                    "text/json": components["schemas"]["MemberRegistrationResult"];
                    "text/plain": components["schemas"]["MemberRegistrationResult"];
                };
            };
        };
    };
    Member_Login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MemberLoginRequest"];
                "text/json": components["schemas"]["MemberLoginRequest"];
                "application/*+json": components["schemas"]["MemberLoginRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemberLoginResult"];
                    "text/json": components["schemas"]["MemberLoginResult"];
                    "text/plain": components["schemas"]["MemberLoginResult"];
                };
            };
        };
    };
    Member_Session: {
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
                    "application/json": components["schemas"]["MemberSessionDto"];
                    "text/json": components["schemas"]["MemberSessionDto"];
                    "text/plain": components["schemas"]["MemberSessionDto"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    Member_Logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}
