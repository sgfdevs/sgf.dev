# Private member bridge

`sgf-member-v1.openapi.json` is the unedited response from the backend's named `sgf-member-v1` document, exported at `/umbraco/openapi/sgf-member-v1.json` from commit `e7d72781629edc8bc1070f69b4e33ba476590f11`.

Raw SHA-256: `5b22b136d9682da2bd26ff36b1c83ee4004330ab7f168ec300daeca0c2cd537d`.

The export used a fresh source archive, private empty SQLite install, Development mode and the process-only `AF.Umbraco.S3.Media.Storage,` assembly exclusion. It did not import content or members. Empty installation does not prove existing-member login or registration with the real member schema/group.

Run `npm run api:member:generate` to generate the separate server-only types. The public document and client are unchanged.

Set private `CMS_INTERNAL_ORIGIN` to the fixed CMS origin. HTTPS is required outside loopback. Set `CMS_MEMBER_BRIDGE_SECRET` privately to match backend `SGFDevs__MemberBridge__Secret`. Missing configuration disables member actions, not public pages. No browser receives this header.

`CMS_MEMBER_COOKIE_NAME` defaults to Umbraco 18.2's ASP.NET Identity application cookie, `.AspNetCore.Identity.Application`. Set it only if the CMS's existing member cookie has been customized. The bridge forwards that cookie and its `C1`, `C2`, etc. chunks only, preserving remembered expiry and sliding renewal. Frontend cookies are host-only, HTTPOnly, SameSite=Lax and Path=/, with Secure enabled in production. Configure the trusted reverse proxy's protocol handling correctly for Kit Origin/CSRF checks. Do not trust browser-supplied forwarded headers.

Registration posts through the same private bridge and signs in persistently to `/account`. It reuses legacy validation and requires the CMS's existing `Member` type, `firstName`, `lastName`, `username` properties and `SGF Devs` member group. Missing prerequisites return unavailable without creating schema or groups. Forgot/reset remain separate work.

Login defaults to remember-me, matching the legacy persistent login. Account editing is not available yet. Logout is a same-origin POST; GET only displays confirmation. Logout removes frontend member cookies even during a CMS outage; it cannot revoke a copied ticket during that outage.
