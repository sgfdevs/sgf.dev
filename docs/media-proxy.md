# Media proxy foundation

The SvelteKit frontend serves CMS media through same-origin `/media/{key}` URLs. The proxy is anonymous and read-only. It supports `GET` and explicit `HEAD` only.

DTO media URLs are mapped on the server from two fixed forms:

- `https://media.sgf.dev/{folder}/{file}`
- `/media/{folder}/{file}`

`/images/pipey.jpg` is the only static fallback passthrough. Public fixture captures under `/tmp/sgf-public-parity-fixtures` are validation inputs only, not runtime fallback media.

The route uses server-only configuration:

- `MEDIA_UPSTREAM_ORIGIN`, required before the route fetches media
- `MEDIA_UPSTREAM_PATH_PREFIX`, required for non-production origins
- `MEDIA_SOURCE_PUBLIC_ORIGIN`, optional source DTO validation origin, defaulting to `https://media.sgf.dev`
- `CMS_INTERNAL_ORIGIN`, optional accepted CMS source prefix for `/media/...` DTO values

Root upstream paths are allowed only for `https://media.sgf.dev`. Local CMS or local S3/SeaweedFS testing needs a specific prefix such as `/media/` or a bootstrap bucket path. Ordinary local development has no production fetch default.

The proxy builds a fresh upstream `Request` with `credentials: 'omit'`, disabled redirects, no caller headers, no cookies, no auth, no range, and no forwarded/referrer/origin headers. It checks the final origin, path fence, method, redirect policy, credential policy, and headers immediately before fetch.

Path and query handling is intentionally narrow. Media keys must have exactly two safe path segments. Encoded slashes, backslashes, dot escapes, double escapes, NUL, userinfo-looking values, protocols, duplicate slashes, bad percent escapes, and dot segments are rejected. Query parameters are limited to `width` and `v`, with bounds and duplicate checks. Current public fixtures use only JPEG/PNG media, `width`, and `v`; SVG/PDF proxying needs a separate reviewed change.

Upstream responses are accepted only for JPEG/PNG image content types and successful, non-redirect responses. The route enforces an 8 MiB body cap while reading the stream, rejects spoofed or oversized `Content-Length`, rejects encoded upstream representations, strips upstream private headers, sets `nosniff`, and emits only safe response headers.
