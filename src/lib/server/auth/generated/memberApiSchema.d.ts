/** Generated from openapi/sgf-member-v1.openapi.json. Run npm run api:member:generate. */
export interface paths {
    "/api/v1/member/forgot-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["Member_ForgotPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/member/reset-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["Member_ResetPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/member/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["Member_Profile"];
        put?: never;
        post: operations["Member_ProfileUpdate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
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
        MemberForgotPasswordRequest: {
            email?: string;
        };
        MemberLoginRequest: {
            username: null | string;
            password: null | string;
            /** @default true */
            rememberMe: boolean;
        };
        MemberLoginResult: {
            succeeded: boolean;
        };
        MemberPasswordResetResult: {
            succeeded: boolean;
            errors: {
                [key: string]: string[];
            };
        };
        MemberProfileChoice: {
            key: string;
            name: string;
        };
        MemberProfileEditDto: {
            values: components["schemas"]["MemberProfileEditRequest"];
            profileImageUrl: null | string;
            skills: components["schemas"]["MemberProfileChoice"][];
            groups: components["schemas"]["MemberProfileChoice"][];
        };
        MemberProfileEditRequest: {
            email?: null | string;
            firstName?: null | string;
            lastName?: null | string;
            jobTitle?: null | string;
            aboutText?: null | string;
            city?: null | string;
            state?: null | string;
            availableForHire?: null | boolean;
            availableForContractWork?: null | boolean;
            twitterUrl?: null | string;
            twitchUrl?: null | string;
            facebookUrl?: null | string;
            instagramUrl?: null | string;
            linkedInUrl?: null | string;
            meetupUrl?: null | string;
            websiteUrl?: null | string;
            youTubeUrl?: null | string;
            skills?: null | string[];
            groups?: null | string[];
        };
        MemberProfileEditResult: {
            succeeded: boolean;
            errors: {
                [key: string]: string[];
            };
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
        MemberResetPasswordRequest: {
            memberId?: string;
            token?: string;
            password?: string;
            confirmPassword?: string;
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
    Member_ForgotPassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MemberForgotPasswordRequest"];
                "text/json": components["schemas"]["MemberForgotPasswordRequest"];
                "application/*+json": components["schemas"]["MemberForgotPasswordRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemberPasswordResetResult"];
                    "text/json": components["schemas"]["MemberPasswordResetResult"];
                    "text/plain": components["schemas"]["MemberPasswordResetResult"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemberPasswordResetResult"];
                    "text/json": components["schemas"]["MemberPasswordResetResult"];
                    "text/plain": components["schemas"]["MemberPasswordResetResult"];
                };
            };
        };
    };
    Member_ResetPassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MemberResetPasswordRequest"];
                "text/json": components["schemas"]["MemberResetPasswordRequest"];
                "application/*+json": components["schemas"]["MemberResetPasswordRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemberPasswordResetResult"];
                    "text/json": components["schemas"]["MemberPasswordResetResult"];
                    "text/plain": components["schemas"]["MemberPasswordResetResult"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemberPasswordResetResult"];
                    "text/json": components["schemas"]["MemberPasswordResetResult"];
                    "text/plain": components["schemas"]["MemberPasswordResetResult"];
                };
            };
        };
    };
    Member_Profile: {
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
                    "application/json": components["schemas"]["MemberProfileEditDto"];
                    "text/json": components["schemas"]["MemberProfileEditDto"];
                    "text/plain": components["schemas"]["MemberProfileEditDto"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    Member_ProfileUpdate: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MemberProfileEditRequest"];
                "text/json": components["schemas"]["MemberProfileEditRequest"];
                "application/*+json": components["schemas"]["MemberProfileEditRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemberProfileEditResult"];
                    "text/json": components["schemas"]["MemberProfileEditResult"];
                    "text/plain": components["schemas"]["MemberProfileEditResult"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemberProfileEditResult"];
                    "text/json": components["schemas"]["MemberProfileEditResult"];
                    "text/plain": components["schemas"]["MemberProfileEditResult"];
                };
            };
        };
    };
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
