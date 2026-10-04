# SGF public OpenAPI snapshot

`sgf-public-v1.openapi.json` is a committed snapshot from the SGF CMS backend. Frontend build and check commands generate types from this file only. They do not fetch `cms.sgf.dev` or any other CMS host.

Snapshot provenance:

- Backend repository: `cms.sgf.dev`
- Backend commit: `ba6d15b69d0e2a0c1151a5b4689b9790da19570c`, draft https://github.com/sgfdevs/cms.sgf.dev/pull/18
- Runtime export URL: `/umbraco/openapi/sgf-public-v1.json`
- Exported file: `/home/levi/.cache/sgf-migration-validation-3KOCBS/group-pages-1-C44GXVUY/public-export-final/evidence/sgf-public-v1.openapi.json`
- Runtime provenance: `export-provenance.json` alongside that artifact
- Raw runtime export SHA-256: `c99de23daaf51441e5b4cc33aba073736482fa3833b7088c42c9738a4d528cba`
- Committed canonical SHA-256: `c99de23daaf51441e5b4cc33aba073736482fa3833b7088c42c9738a4d528cba`

Raw and canonical hashes happen to match for this export. Only the existing LF/terminal-newline policy was applied, with no JSON edits or reordering. The runtime export adds `PublicGroups_List` and `PublicGroups_Get` with explicit public group DTOs and 404 ProblemDetails. Existing operations and components are unchanged. Generated error media without a schema remain `unknown`.

The server-only GET fence accepts the member template only with a snapshotted ASCII alphanumeric username of 1 to 1000 characters. The final Request allows only the anchored concrete member path, never the unresolved template. The group template requires a snapshotted ASCII alphanumeric slug with hyphens or underscores, 1 to 200 characters, and the final request checks the anchored group path. The earlier paths and network/auth guards remain. This export used the existing owned install-only SQLite procedure, fake Docker shim and AF S3 assembly exclusion. No schema import or content seed ran.

Byte policy:

- The committed file is valid UTF-8 JSON with LF line endings and no terminal newline.
- `api:schema:fetch` validates JSON, converts CRLF or CR line endings to LF, and removes terminal newline characters.
- The command preserves JSON text otherwise. It does not reformat the export or sort keys.
- Schema and generated type writes use same-directory temp files plus atomic rename, so malformed JSON, network failures, and write failures keep the previous committed artifact.

To refresh from a local backend, start the CMS on a loopback origin and run:

```sh
SGF_CMS_SCHEMA_ORIGIN=http://127.0.0.1:5099 npm run api:schema:fetch
npm run api:generate
npm run api:check
```

The fetch command only accepts `localhost`, `127.0.0.1`, or `::1`, with no credentials, path, query, or hash. It always reads `/umbraco/openapi/sgf-public-v1.json`, uses `redirect: "error"`, and sends no credentials.
