# Home server loading

The root page now loads `GET /api/v1/public/home` only from `+page.server.ts`. The browser receives mapped page data through SvelteKit data responses and never receives `CMS_INTERNAL_ORIGIN` or media upstream settings.

Development behavior is intentionally plain:

- If `CMS_INTERNAL_ORIGIN` is missing, `/` returns a 503 Home data error. There is no fixture fallback.
- If the local CMS is running but has no Home root, `/` returns 404.
- If the CMS returns a malformed Home payload, `/` returns a 502 gateway error.
- If the CMS request times out, `/` returns 503.

Media fields from Home presenters, directory members, and sponsors are rewritten server-side with the approved media mapper. Unsupported presenter and directory images use `/images/pipey.jpg`; unsupported sponsor logos become `null`.
