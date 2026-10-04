# Company Delivery values

Company details use the existing native item operation and server-only generated Delivery client types. The native OpenAPI document remains unchanged, with content-type schema generation disabled. No company endpoint or invented OpenAPI schema was added. The existing snapshot hash is `7f630c8bc7a21658b0b9619b6311998fce749909c67ca4ff159c9fd22a2edec0`. Its actual runtime export provenance remains in `umbraco-delivery.md`.

Properties come from the tracked Umbraco 18.2 `company.config`, `Company.generated.cs` and native converters. `aboutText` is Markdown text in Delivery. Native media picker values are arrays of media objects. Umbraco resolves `umbracoUrlName` through the published route. There is no company listing route or job-page support here.

The company-only backend picker converter preserves regular Razor values, suppresses unused `companyTags`, and returns `skillTags` as objects containing only `name` and `directoryFilterValue`. The latter is the published tag GUID indexed in `skillKeys`, as in public member and corrected group links. Protected tag ancestors and non-document pickers are omitted. Projection does not expand raw tag properties and does not retain a cached protection result.

The frontend requests one validated company slug from the fixed CMS origin with approved fields, no expansion, no browser cookies or request identity. A server-side Delivery key is required by the existing client policy, but backend preview authorization remains disabled. PageData includes explicit public fields only. Markdown uses the existing sanitizer. Media uses approved same-origin mapping. Embed markup never reaches the page. Only HTTPS YouTube embed IDs and numeric Vimeo player IDs produce rebuilt video URLs, with no incoming query or attributes.

Published company, tag and media integration has not been exercised. Local fixtures are synthetic and do not prove current production editor values or media availability.
