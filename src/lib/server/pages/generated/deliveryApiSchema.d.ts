/** Generated from openapi/umbraco-delivery.openapi.json. Run npm run api:delivery:generate. */
export interface paths {
    "/umbraco/delivery/api/v2/content": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GetContent2.0"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/umbraco/delivery/api/v2/content/item/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GetContentItemById2.0"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/umbraco/delivery/api/v2/content/item/{path}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GetContentItemByPath2.0"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/umbraco/delivery/api/v2/content/items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GetContentItems2.0"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/umbraco/delivery/api/v2/media": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GetMedia2.0"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/umbraco/delivery/api/v2/media/item/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GetMediaItemById2.0"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/umbraco/delivery/api/v2/media/item/{path}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GetMediaItemByPath2.0"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/umbraco/delivery/api/v2/media/items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["GetMediaItems2.0"];
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
        IApiContentResponseModel: {
            contentType: null | string;
            name?: null | string;
            /** Format: date-time */
            createDate: string;
            /** Format: date-time */
            updateDate: string;
            route: components["schemas"]["IApiContentRouteModel"];
            /** Format: uuid */
            id: string;
            properties: null | Record<string, never>;
            cultures: null | {
                [key: string]: components["schemas"]["IApiContentRouteModel"];
            };
        };
        IApiContentRouteModel: {
            path: null | string;
            queryString?: null | string;
            startItem: components["schemas"]["IApiContentStartItemModel"];
        };
        IApiContentStartItemModel: {
            /** Format: uuid */
            id: string;
            path: null | string;
        };
        IApiMediaWithCropsResponseModel: {
            path: null | string;
            /** Format: date-time */
            createDate: string;
            /** Format: date-time */
            updateDate: string;
            focalPoint?: components["schemas"]["ImageFocalPointModel"];
            crops?: null | components["schemas"]["ImageCropModel"][];
            /** Format: uuid */
            id: string;
            name: null | string;
            mediaType: null | string;
            url: null | string;
            extension?: null | string;
            /** Format: int32 */
            width?: null | number;
            /** Format: int32 */
            height?: null | number;
            /** Format: int32 */
            bytes?: null | number;
            properties: null | Record<string, never>;
        };
        ImageCropCoordinatesModel: {
            /** Format: double */
            x1: number;
            /** Format: double */
            y1: number;
            /** Format: double */
            x2: number;
            /** Format: double */
            y2: number;
        };
        ImageCropModel: {
            alias: null | string;
            /** Format: int32 */
            width: number;
            /** Format: int32 */
            height: number;
            coordinates: components["schemas"]["ImageCropCoordinatesModel"];
        };
        ImageFocalPointModel: {
            /** Format: double */
            left: number;
            /** Format: double */
            top: number;
        };
        PagedIApiContentResponseModel: {
            /** Format: int64 */
            total: number;
            items: components["schemas"]["IApiContentResponseModel"][];
        };
        PagedIApiMediaWithCropsResponseModel: {
            /** Format: int64 */
            total: number;
            items: components["schemas"]["IApiMediaWithCropsResponseModel"][];
        };
        ProblemDetails: {
            type?: null | string;
            title?: null | string;
            /** Format: int32 */
            status?: null | number;
            detail?: null | string;
            instance?: null | string;
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
    "GetContent2.0": {
        parameters: {
            query?: {
                /** @description Specifies the content items to fetch. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this. */
                fetch?: string;
                /** @description Defines how to filter the fetched content items. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this. */
                filter?: string[];
                /** @description Defines how to sort the found content items. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this. */
                sort?: string[];
                /** @description Specifies the number of found content items to skip. Use this to control pagination of the response. */
                skip?: number;
                /** @description Specifies the number of found content items to take. Use this to control pagination of the response. */
                take?: number;
                /** @description Defines the properties that should be expanded in the response. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this. */
                expand?: string;
                /** @description Explicitly defines which properties should be included in the response (by default all properties are included). Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this. */
                fields?: string;
            };
            header?: {
                /** @description Defines the language to return. Use this when querying language variant content items. */
                "Accept-Language"?: string;
                /** @description Defines the segment to return. Use this when querying segment variant content items. */
                "Accept-Segment"?: string;
                /** @description Whether to request draft content. */
                Preview?: boolean;
                /** @description URL segment or GUID of a root content item. */
                "Start-Item"?: string;
            };
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
                    "application/json": components["schemas"]["PagedIApiContentResponseModel"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    "GetContentItemById2.0": {
        parameters: {
            query?: {
                /** @description Defines the properties that should be expanded in the response. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this. */
                expand?: string;
                /** @description Explicitly defines which properties should be included in the response (by default all properties are included). Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this. */
                fields?: string;
            };
            header?: {
                /** @description Defines the language to return. Use this when querying language variant content items. */
                "Accept-Language"?: string;
                /** @description Defines the segment to return. Use this when querying segment variant content items. */
                "Accept-Segment"?: string;
                /** @description Whether to request draft content. */
                Preview?: boolean;
                /** @description URL segment or GUID of a root content item. */
                "Start-Item"?: string;
            };
            path: {
                id: string;
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
                    "application/json": components["schemas"]["IApiContentResponseModel"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    "GetContentItemByPath2.0": {
        parameters: {
            query?: {
                /** @description Defines the properties that should be expanded in the response. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this. */
                expand?: string;
                /** @description Explicitly defines which properties should be included in the response (by default all properties are included). Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this. */
                fields?: string;
            };
            header?: {
                /** @description Defines the language to return. Use this when querying language variant content items. */
                "Accept-Language"?: string;
                /** @description Defines the segment to return. Use this when querying segment variant content items. */
                "Accept-Segment"?: string;
                /** @description Whether to request draft content. */
                Preview?: boolean;
                /** @description URL segment or GUID of a root content item. */
                "Start-Item"?: string;
            };
            path: {
                path: string;
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
                    "application/json": components["schemas"]["IApiContentResponseModel"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    "GetContentItems2.0": {
        parameters: {
            query?: {
                id?: string[];
                /** @description Defines the properties that should be expanded in the response. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this. */
                expand?: string;
                /** @description Explicitly defines which properties should be included in the response (by default all properties are included). Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api#query-parameters) for more details on this. */
                fields?: string;
            };
            header?: {
                /** @description Defines the language to return. Use this when querying language variant content items. */
                "Accept-Language"?: string;
                /** @description Defines the segment to return. Use this when querying segment variant content items. */
                "Accept-Segment"?: string;
                /** @description Whether to request draft content. */
                Preview?: boolean;
                /** @description URL segment or GUID of a root content item. */
                "Start-Item"?: string;
            };
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
                    "application/json": components["schemas"]["IApiContentResponseModel"][];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    "GetMedia2.0": {
        parameters: {
            query?: {
                /** @description Specifies the media items to fetch. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/media-delivery-api#query-parameters) for more details on this. */
                fetch?: string;
                /** @description Defines how to filter the fetched media items. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/media-delivery-api#query-parameters) for more details on this. */
                filter?: string[];
                /** @description Defines how to sort the found media items. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/media-delivery-api#query-parameters) for more details on this. */
                sort?: string[];
                /** @description Specifies the number of found media items to skip. Use this to control pagination of the response. */
                skip?: number;
                /** @description Specifies the number of found media items to take. Use this to control pagination of the response. */
                take?: number;
                /** @description Defines the properties that should be expanded in the response. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/media-delivery-api#query-parameters) for more details on this. */
                expand?: string;
                /** @description Explicitly defines which properties should be included in the response (by default all properties are included). Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/media-delivery-api#query-parameters) for more details on this. */
                fields?: string;
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
                    "application/json": components["schemas"]["PagedIApiMediaWithCropsResponseModel"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
    "GetMediaItemById2.0": {
        parameters: {
            query?: {
                /** @description Defines the properties that should be expanded in the response. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/media-delivery-api#query-parameters) for more details on this. */
                expand?: string;
                /** @description Explicitly defines which properties should be included in the response (by default all properties are included). Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/media-delivery-api#query-parameters) for more details on this. */
                fields?: string;
            };
            header?: never;
            path: {
                id: string;
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
                    "application/json": components["schemas"]["IApiMediaWithCropsResponseModel"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    "GetMediaItemByPath2.0": {
        parameters: {
            query?: {
                /** @description Defines the properties that should be expanded in the response. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/media-delivery-api#query-parameters) for more details on this. */
                expand?: string;
                /** @description Explicitly defines which properties should be included in the response (by default all properties are included). Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/media-delivery-api#query-parameters) for more details on this. */
                fields?: string;
            };
            header?: never;
            path: {
                path: string;
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
                    "application/json": components["schemas"]["IApiMediaWithCropsResponseModel"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    "GetMediaItems2.0": {
        parameters: {
            query?: {
                id?: string[];
                /** @description Defines the properties that should be expanded in the response. Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/media-delivery-api#query-parameters) for more details on this. */
                expand?: string;
                /** @description Explicitly defines which properties should be included in the response (by default all properties are included). Refer to [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api/media-delivery-api#query-parameters) for more details on this. */
                fields?: string;
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
                    "application/json": components["schemas"]["IApiMediaWithCropsResponseModel"][];
                };
            };
        };
    };
}
