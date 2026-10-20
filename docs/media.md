# Public media

Browsers load images and PDF links directly from the CMS public media host.
The frontend does not fetch, resize, stream or cache media.

Set `MEDIA_PUBLIC_URL` to the browser-accessible media base. Production uses
`https://media.sgf.dev/`, without a `/media/` prefix. Local development uses
`http://127.0.0.1:5099/media/`. API access still uses `CMS_INTERNAL_ORIGIN` privately.

The mapper preserves URLs already under the public base. Relative `/media/`
paths and internal CMS media URLs resolve against that base. It retains sizing,
cropping and version query parameters. Images support JPEG, PNG, GIF, SVG, WebP
and AVIF. Invalid or unapproved image URLs are omitted or use the existing
Pipey fallback. HTML sanitization remains in place.

The former `/media/[...key]` route and `MEDIA_UPSTREAM_*` settings are removed.
Replace `MEDIA_SOURCE_PUBLIC_ORIGIN` with `MEDIA_PUBLIC_URL` when deploying.
