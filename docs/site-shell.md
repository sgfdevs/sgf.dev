# Site shell layer

This layer ports the shared legacy `_Layout.cshtml` header, footer, navigation links, global metadata defaults, and newsletter form markup to SvelteKit. It does not add page bodies, auth mutations, media proxying, analytics, or newsletter submission.

The newsletter form keeps the visible `email` field plus the `name` honeypot field, but the submit button is disabled until a later layer adds a typed server action. The browser does not post directly to the legacy CMS endpoint.

Header chevrons are original inline SVG strokes. Font Awesome Pro light and duotone assets were not copied or loaded.
