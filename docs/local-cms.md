# Local CMS API config

The generated client uses one server-only origin:

```sh
CMS_INTERNAL_ORIGIN=http://127.0.0.1:5099
```

Set it only where SvelteKit server code needs to call the CMS. Offline commands such as `npm run check`, `npm run api:check`, and `npm run build` do not need the CMS and do not read from the network.

Schema refresh is separate and opt-in:

```sh
SGF_CMS_SCHEMA_ORIGIN=http://127.0.0.1:5099 npm run api:schema:fetch
```

That command fetches the public local document at `/umbraco/openapi/sgf-public-v1.json` with no credentials or custom headers. Do not point it at production.
