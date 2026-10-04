# SGF public OpenAPI snapshot

`sgf-public-v1.openapi.json` is a committed snapshot from the SGF CMS backend. Frontend build and check commands generate types from this file only. They do not fetch `cms.sgf.dev` or any other CMS host.

Snapshot provenance:

- Backend repository: `cms.sgf.dev`
- Backend commit: `56c7188e79a3b746e2affcd5ec4f1923cc59b6b9`
- Runtime export URL: `/umbraco/openapi/sgf-public-v1.json`
- Exported file: `/tmp/sgf-public-v1.openapi.json`
- SHA-256: `10f5cde32b8132ccb5b89cf94d7ce3974f36a3c2f61df15d40fea18c7bbdc89b`

To refresh from a local backend, start the CMS on a loopback origin and run:

```sh
SGF_CMS_SCHEMA_ORIGIN=http://127.0.0.1:5099 npm run api:schema:fetch
npm run api:generate
npm run api:check
```

The fetch command only accepts `localhost`, `127.0.0.1`, or `::1`, with no credentials, path, query, or hash. It always reads `/umbraco/openapi/sgf-public-v1.json`.
