# Springfield Devs website

The public [sgf.dev](https://sgf.dev) frontend uses SvelteKit 3, Svelte 5 and
Tailwind CSS 4. The [Umbraco backend](https://github.com/sgfdevs/cms.sgf.dev)
runs separately. Page SSR, generated API clients, the same-origin media proxy
and member forms already call the CMS from frontend server code. Browsers do
not call the CMS member bridge directly.

## Requirements and configuration

Use Node.js 22.17 or newer. The container and CI use Node 24, matching the current
local runtime. npm 11 is recommended for the existing lockfile. Run `npm ci` once.
The tracked `vite.config.ts` contains the SvelteKit configuration and
`adapter-node`, including the existing runes policy and Tailwind plugin.
SvelteKit 3 does not need a separate `svelte.config.js` here. `tsconfig.json`,
`src/env.ts` and `.npmrc` are also tracked build inputs.

Copy `.env.example` to an ignored `.env` for Vite development. Supply real keys
privately, never in Git, client code or Docker build arguments:

- `CMS_INTERNAL_ORIGIN` is the server-only CMS origin, without a path.
- `CMS_DELIVERY_API_KEY` must match backend `Umbraco__CMS__DeliveryApi__ApiKey`.
  Content-page loads require it even with native Delivery `PublicAccess=true`.
  The native key can authorize preview content. Keep it private.
- `CMS_MEMBER_BRIDGE_SECRET` must match backend `SGFDevs__MemberBridge__Secret`.
  Member calls fail closed without it. Match `CMS_MEMBER_COOKIE_NAME` only if
  the CMS cookie name has been customized.
- Media proxy origins and path fences are private server settings. Point local
  media upstreams only at fictional local media, not production storage.
- Backend `SGFDevs__MemberBridge__FrontendOrigin` must be the frontend origin,
  for example `http://127.0.0.1:3000`, so reset emails link to Kit.

Native login, session, logout and emailed password reset passed a bounded local
native-CMS journey. That builtin-member-only runtime lacked legacy SGF properties.
It cannot exercise SGF registration, profile editing or avatar uploads correctly.
Those paths still need the reviewed SGF schema. Imports remain paused; this
packaging does not install, import or activate CMS schema or content.

## Split local development

In the CMS shell, use an existing ordinary Development installation and privately
supply the matching bridge secret and native Delivery key. Set the reset link
origin and start the CMS without its historical launch profile:

```sh
cd ../cms.sgf.dev
export ASPNETCORE_ENVIRONMENT=Development DOTNET_ENVIRONMENT=Development
export SGFDevs__MemberBridge__FrontendOrigin=http://127.0.0.1:3000
dotnet run --project SgfDevs --no-launch-profile --urls http://127.0.0.1:5099
```

This assumes that shell already has the private database, media and other CMS
settings for the owned installation. It is not a fresh-install recipe. See the
backend README for native SMTP/Mailpit settings. Do not mix those ordinary runtime
settings with sealed install-only bootstrap profiles.

In a separate frontend shell, with the ignored `.env` configured:

```sh
npm run dev -- --host 127.0.0.1 --port 3000 --strictPort
```

Vite loads `.env` during development. `npm run preview` is a Vite preview, not the
adapter-node production server. `SGF_CMS_SCHEMA_ORIGIN` is only for explicit local
schema refreshes. CI freshness checks use committed snapshots, not a live CMS.

## Built Node server

```sh
npm run check
ORIGIN=http://127.0.0.1:3000 npm run build
HOST=127.0.0.1 PORT=3000 BODY_SIZE_LIMIT=9M npm run serve
```

Before `serve`, inject private CMS/media variables into the process environment
through your private environment loader or secret store. The built server does
not load `.env` automatically. With Node 24, an ignored private dotenv file can
also be loaded explicitly with `node --env-file=.env build` instead of `npm run serve`.
No CMS secret is needed to build the source.

This pinned adapter-node 6 uses SvelteKit `paths.origin`, not runtime `ORIGIN`.
Set the public `ORIGIN` at build time; `vite.config.ts` fixes the supplied origin
in the output. The Dockerfile refuses to build without it. A build without it
falls back to request-host inference and is not suitable for this setup. Rebuild for a different frontend origin. Setting `ORIGIN` only at
startup has no effect. For a reverse proxy, build with the external HTTPS origin,
not the internal Node listener address. Keep `PROTOCOL_HEADER`, `HOST_HEADER`,
`PORT_HEADER` and `ADDRESS_HEADER` unset. Do not trust arbitrary forwarded headers.
Restrict access to the listener behind the proxy and retain Kit's origin/CSRF
checks. `PUBLIC_SITE_ORIGIN` controls canonical metadata, not request trust.

Set `BODY_SIZE_LIMIT=9M` for the built server to allow the existing 8 MiB avatar
limit plus multipart overhead. Application validation still limits accepted files.

## Container and CI

`Dockerfile` builds Node output with the existing lockfile, then installs only
production dependencies in a non-root Node 24 runtime. Supply the public origin
with `--build-arg ORIGIN=https://www.sgf.dev`. Inject private settings at container
startup, not during image creation. Inside a container, `CMS_INTERNAL_ORIGIN`
must name a CMS address reachable from that container, not its own loopback.
The image defaults to port 3000 and `BODY_SIZE_LIMIT=9M`; it does not include a CMS.

`.dockerignore` permits only build inputs and excludes local secrets and output.
The CI workflow runs `npm ci`, check, committed public/member API freshness checks
and build. It does not deploy, use action secrets or build/push an image.
