# Private member bridge

`sgf-member-v1.openapi.json` is the unedited response from the backend's named `sgf-member-v1` document, exported at `/umbraco/openapi/sgf-member-v1.json` from commit `9ad88406bb8bb604343922d44268d6979556e2bf`.

Raw SHA-256: `7cb034e19fee49f377c9ac4a3a03a986498070fa1aeba52d3f02b3b022ebf227`.

The export used a fresh source archive, private empty SQLite install, Development mode and the process-only `AF.Umbraco.S3.Media.Storage,` assembly exclusion. It did not import content or members. Empty installation does not prove existing-member login.

Run `npm run api:member:generate` to generate the separate server-only types. The public document and client are unchanged.

Set private `CMS_INTERNAL_ORIGIN` to the fixed CMS origin. HTTPS is required outside loopback. Set `CMS_MEMBER_BRIDGE_SECRET` privately to match backend `SGFDevs__MemberBridge__Secret`. Missing configuration disables login, not public pages. No browser receives this header.

`CMS_MEMBER_COOKIE_NAME` defaults to Umbraco 18.2's ASP.NET Identity application cookie, `.AspNetCore.Identity.Application`. Set it only if the CMS's existing member cookie has been customized. The bridge forwards that cookie and its `C1`, `C2`, etc. chunks only, preserving remembered expiry and sliding renewal. Frontend cookies are host-only, HTTPOnly, SameSite=Lax and Path=/, with Secure enabled in production. Configure the trusted reverse proxy's protocol handling correctly for Kit Origin/CSRF checks. Do not trust browser-supplied forwarded headers.

Login defaults to remember-me, matching the legacy persistent login. Account editing is not available yet. Logout is a same-origin POST; GET only displays confirmation. Logout removes frontend member cookies even during a CMS outage; it cannot revoke a copied ticket during that outage.
