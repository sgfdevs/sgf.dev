# SGF rewrite status

## Where work stopped

The original frontend stack ends at [sgf.dev #160](https://github.com/sgfdevs/sgf.dev/pull/160), packaging the Node server. The original CMS stack ends at [cms.sgf.dev #24](https://github.com/sgfdevs/cms.sgf.dev/pull/24), documenting the split runtime. All 26 frontend and 22 CMS rewrite PRs were open drafts when this review began. There were no review comments or unresolved review threads on those PRs.

Most legacy functionality is already implemented. The remaining work is mostly getting the split application into staging with the correct CMS schema and configuration.

## Existing PR coverage

Numbers below refer to the two repositories named in each bullet.

- Foundation, API clients, theme and shell: frontend #134, #135, #137 through #140; CMS #2 and #3.
- Home and media: frontend #141 through #143; CMS #5. The frontend proxy in #141 is superseded by the public-media follow-up.
- Directory: frontend #144; CMS #3.
- Public member profiles: frontend #145 and #146; CMS #10.
- Login, registration, password reset, profile editing and avatars: frontend #147 through #151; CMS #11 through #15.
- Newsletter: frontend #152; CMS #16.
- About, conduct, sponsorship and Discord content: frontend #153; CMS #17.
- Groups: frontend #154; CMS #18.
- Companies: frontend #155; CMS #19.
- Leadership: frontend #156; CMS #20.
- Jobs: frontend #157; CMS #21.
- Older content routes and profile styling: frontend #158 and #159.
- Runtime and local setup: frontend #160; CMS #6 through #9 and #22 through #24.

Registration, profile editing and avatar uploads are not missing features. The previous local runtime had only built-in Umbraco member fields, so it could not exercise them properly. Use a staging installation with the SGF schema rather than expanding the disposable bootstrap into another migration project.

## What came over from MethodConf

MethodConf's image, cache and test changes shipped in [#101](https://github.com/sgfdevs/methodconf.com/pull/101), [#102](https://github.com/sgfdevs/methodconf.com/pull/102) and [#103](https://github.com/sgfdevs/methodconf.com/pull/103). [#105](https://github.com/sgfdevs/methodconf.com/pull/105) preserves CMS-provided public media URLs; [#107](https://github.com/sgfdevs/methodconf.com/pull/107) adds an independent health endpoint.

The SGF follow-ups are frontend [#162 through #166](https://github.com/sgfdevs/sgf.dev/pull/162) and CMS [#25](https://github.com/sgfdevs/cms.sgf.dev/pull/25) and [#26](https://github.com/sgfdevs/cms.sgf.dev/pull/26).

- Delete source-text, cosmetic and placeholder tests and obsolete schema hash assertions. Use one unit-test command, also run by CI. Keep auth, mapping and sanitization checks.
- Delete the frontend image proxy, its streaming and header machinery, and its large test suite. Browsers load media directly. `MEDIA_PUBLIC_URL` replaces the old proxy settings and supports both the production CDN root and a local CMS `/media/` base.
- Do not copy MethodConf's data cache. SGF has no shared frontend data cache to fix. Keep member requests and personalized responses uncached. The public media host owns image caching.
- Restore `robots.txt` and optional Plausible analytics with default-off runtime flags. Add a CMS-independent `/healthz`.
- Restore frontend release and image publication without enabling deployment promotion.
- Correct Linux Docker exclusions in the CMS and remove the old mutation paths outside the private member bridge.

## Remaining staging handoff

1. Select an owned staging CMS with the SGF document and member schema. The sealed disposable bootstrap remains install-only and does not import schema or content. No imports were run during this work.
2. Configure matching Delivery API keys and member bridge secrets privately. `CMS_INTERNAL_ORIGIN` must be reachable from Node. The current member client requires HTTPS outside loopback. An ordinary HTTP Kubernetes service URL will not work without a deliberate transport/configuration decision.
3. Set the CMS frontend origin for reset emails, SMTP, media storage and public media base. Keep the existing database and data-protection keys persistent.
4. Set the frontend build origin and canonical origin to the intended staging hostname. Keep search indexing and analytics disabled there. Rebuild for another request origin because adapter-node 6 fixes it at build time.
5. Rebuild the CMS Delivery API index after enabling its configuration. Deploy the two images through the existing infrastructure process. Automatic promotions stay off.
6. Manually check the main pages and images, then registration, login, profile/avatar changes, emailed reset and newsletter signup. Visual parity and complete member journeys belong in staging, not a new browser-test framework.

No production deployment, database import or secret changes are included in these PRs.

## Not launch requirements

The legacy Hire Me and group event Details links were placeholders too. Site-wide search was hidden and had no working search implementation. Events and Archives navigation points to Meetup and YouTube. These are not missing migration features.

The CMS still contains legacy Razor rendering code and inactive future schema-bootstrap policy code. Removing those is a later deletion-only cleanup, not a reason to build schema-bootstrap v2. Directory result limits and consistent protected-tag filtering also deserve separate focused work if required. None should become an excuse for an exhaustive regression project.
