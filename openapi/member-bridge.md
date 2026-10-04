# Private member bridge

`sgf-member-v1.openapi.json` is the unedited response from the backend's named `sgf-member-v1` document, exported at `/umbraco/openapi/sgf-member-v1.json` from commit `9e724783d83afd346a36ac85a65edaf0b8615758`.

Raw SHA-256: `946ee90a1cda7008e8d41647621461e19024e294a5920237f7544aa8166b6399`.

The export used a fresh source archive, private empty SQLite install, Development mode and the process-only `AF.Umbraco.S3.Media.Storage,` assembly exclusion. It did not import content or members. Empty installation does not prove existing-member login or registration with the real member schema/group.

Run `npm run api:member:generate` to generate the separate server-only types. The public document and client are unchanged.

Set private `CMS_INTERNAL_ORIGIN` to the fixed CMS origin. HTTPS is required outside loopback. Set `CMS_MEMBER_BRIDGE_SECRET` privately to match backend `SGFDevs__MemberBridge__Secret`. Missing configuration disables member actions, not public pages. No browser receives this header.

`CMS_MEMBER_COOKIE_NAME` defaults to Umbraco 18.2's ASP.NET Identity application cookie, `.AspNetCore.Identity.Application`. Set it only if the CMS's existing member cookie has been customized. The bridge forwards that cookie and its `C1`, `C2`, etc. chunks only, preserving remembered expiry and sliding renewal. Frontend cookies are host-only, HTTPOnly, SameSite=Lax and Path=/, with Secure enabled in production. Configure the trusted reverse proxy's protocol handling correctly for Kit Origin/CSRF checks. Do not trust browser-supplied forwarded headers.

Registration posts through the same private bridge and signs in persistently to `/account`. It reuses legacy validation and requires the CMS's existing `Member` type, `firstName`, `lastName`, `username` properties and `SGF Devs` member group. Missing prerequisites return unavailable without creating schema or groups. Forgot/reset use the same generated private client and same-origin Kit actions. Reset tokens stay in the incoming query and private server request, not Kit page data, hidden inputs, public DTOs, metadata or redirects. Passwords are never returned to the form. Reset responses are no-store and no-referrer; success redirects to `/login?passwordReset=success` without signing in.

Set backend `SGFDevs__MemberBridge__FrontendOrigin` to the canonical frontend origin with no path, credentials, query or fragment. HTTPS is required outside Development loopback. The backend appends `/reset-password` and encodes opaque member ID/token query values. Missing/invalid origin or unavailable Umbraco mail/from configuration returns a generic unavailable message before member lookup. Existing and nonexistent accounts otherwise receive the same confirmation, including account-specific mail send failure. Umbraco remains responsible for token validity, expiry and use; actual SMTP delivery and real member-store reset have not been established by the empty-install export.

Login defaults to remember-me, matching the legacy persistent login. Account editing is not available yet. Logout is a same-origin POST; GET only displays confirmation. Logout removes frontend member cookies even during a CMS outage; it cannot revoke a copied ticket during that outage.
