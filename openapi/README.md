# SGF public OpenAPI snapshot

`sgf-public-v1.openapi.json` is a committed snapshot from the SGF CMS backend. Frontend build and check commands generate types from this file only. They do not fetch `cms.sgf.dev` or any other CMS host.

Snapshot provenance:

- Backend repository: `cms.sgf.dev`
- Backend commit: `996553e8cb046e82751468debbc04455a7bc5aac`
- Runtime export URL: `/umbraco/openapi/sgf-public-v1.json`
- Exported file: `/tmp/sgf-public-v1-home-errors.openapi.json`
- Raw runtime export SHA-256: `881f0b2d8e9e78b1290f831386f2e5d9b10de716f4748b66760382f04c2e41dc`
- Committed canonical SHA-256: `881f0b2d8e9e78b1290f831386f2e5d9b10de716f4748b66760382f04c2e41dc`

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
