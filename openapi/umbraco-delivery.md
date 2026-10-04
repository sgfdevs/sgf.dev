# Native Delivery snapshot

`umbraco-delivery.openapi.json` is the unedited built-in `delivery` document, titled `Umbraco Delivery API`, from Umbraco 18.2.0. It is separate from the SGF public and member contracts. Those snapshots and generated clients are unchanged.

- Source commit `4e82f60a7a67eee44ef81a4cd2eef793a8d0b68c`, backend content-pages layer.
- GET `http://127.0.0.1:55709/umbraco/openapi/delivery.json` on a fresh owned source archive and empty install-only SQLite installation.
- Raw SHA-256 `7f630c8bc7a21658b0b9619b6311998fce749909c67ca4ff159c9fd22a2edec0`, 45,180 bytes.
- Process-only assembly exclusion `Umbraco:CMS:TypeFinder:AdditionalAssemblyExclusionEntries:0=AF.Umbraco.S3.Media.Storage,` avoids the inherited S3 startup issue. No tracked runtime change, real Docker, content/schema import, seed, production connection or published content query.
- Export evidence `/home/levi/.cache/sgf-migration-validation-3KOCBS/static-pages-1-G7nXU4MH/delivery-export/evidence/export-provenance.json`.

The native document includes media paths even when configured media access is disabled. It has a generic content properties object because native content-type schema generation remains disabled. Page properties come from the tracked `page` and `meta` uSync definitions, not a fabricated OpenAPI schema. `npm run api:delivery:generate` generates the separate server-only transport types.
