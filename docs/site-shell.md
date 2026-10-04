# Site shell layer

This layer ports the shared legacy `_Layout.cshtml` header, footer, navigation links, global metadata defaults, and newsletter form markup to SvelteKit. It does not add page bodies, auth mutations, media proxying, analytics, or newsletter submission.

The later newsletter layer enables the visible `email` field and empty-only `name` honeypot through the dedicated `/newsletter` server action and generated private bridge client. Native forms work without JavaScript; enhanced forms show confirmation or retry messages in the footer. The browser never posts to the CMS or newsletter provider.

Header chevrons are original inline SVG strokes. Font Awesome Pro light and duotone assets were not copied or loaded.
