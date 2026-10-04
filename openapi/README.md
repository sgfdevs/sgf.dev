# SGF public OpenAPI snapshot

`sgf-public-v1.openapi.json` is a committed snapshot from the SGF CMS backend. Frontend build and check commands generate types from this file only. They do not fetch a CMS host.

Snapshot provenance:

- Backend repository: `cms.sgf.dev`
- Backend commit: `374a74ff19ce8766c4687a3be048df45981731be`, draft https://github.com/sgfdevs/cms.sgf.dev/pull/20
- Runtime export URL: `/umbraco/openapi/sgf-public-v1.json`
- Exported file: `/home/levi/.cache/sgf-migration-validation-3KOCBS/leadership-1-4TC6iTZ1/leadership-export-final/evidence/sgf-public-v1.openapi.json`
- Runtime provenance: `export-provenance.json` alongside that artifact
- Raw runtime export SHA-256: `c1feb27b31f5b112c42498522c38d851253c3a6218761216a03ef8fb6afa6947`
- Committed canonical SHA-256: `c1feb27b31f5b112c42498522c38d851253c3a6218761216a03ef8fb6afa6947`

Only the existing LF/terminal-newline policy was applied, with no JSON edits or reordering. This export adds `PublicLeadership_Get` with two explicit public DTOs and 404 ProblemDetails. The existing directory, Home, member and group contracts remain unchanged. Leadership remains excluded from raw Delivery.

The server-only GET fence adds only the exact `/api/v1/public/leadership` path. Member and group templates still require validated, snapshotted usernames or slugs; the final Request checks anchored concrete paths. Fixed origin, request-scoped fetch, omitted credentials, disabled redirects and forbidden auth headers remain unchanged.

This export used the existing owned install-only SQLite procedure, fake Docker shim and AF S3 assembly exclusion. No schema import or content seed ran. The shared protection lookup registration now matches its singleton native service and singleton Delivery converter, allowing startup without disabling DI validation.

Byte policy:

- The committed file is valid UTF-8 JSON with LF line endings and no terminal newline.
- `api:schema:fetch` validates JSON, converts CRLF or CR line endings to LF, and removes terminal newline characters.
- The command preserves JSON text otherwise. It does not reformat the export or sort keys.
- Schema and generated type writes use same-directory temp files plus atomic rename, so malformed JSON, network failures, and write failures keep the previous artifact.

To refresh from a local backend, start the CMS on a loopback origin and run:

```sh
SGF_CMS_SCHEMA_ORIGIN=http://127.0.0.1:5099 npm run api:schema:fetch
npm run api:generate
npm run api:check
```

The fetch command only accepts `localhost`, `127.0.0.1`, or `::1`, with no credentials, path, query, or hash. It always reads `/umbraco/openapi/sgf-public-v1.json`, uses `redirect: "error"`, and sends no credentials.
