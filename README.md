# Springfield Devs website

This repository is for the public [sgf.dev](https://sgf.dev) frontend.
The Umbraco CMS and backend live in [cms.sgf.dev](https://github.com/sgfdevs/cms.sgf.dev).

This branch starts the SvelteKit frontend rewrite with a minimal Svelte 5 app. It does not include the final page migration, Tailwind styling, asset migration, generated API client, or live CMS integration yet.

## Requirements

- Node.js 22.17 or newer. Node 24 is supported.
- npm 11 or newer is recommended because the lockfile was generated with npm 11.

## Development

Install dependencies:

```sh
npm ci
```

Run the local dev server:

```sh
npm run dev
```

Check Svelte and TypeScript:

```sh
npm run check
```

Build the production Node server:

```sh
npm run build
```

Preview the built app with Vite:

```sh
npm run preview
```

Run the adapter-node production server after a build:

```sh
npm run serve
```

## Backend dependency

The frontend will later consume APIs from `cms.sgf.dev`. That API contract and generated OpenAPI client are not part of this layer.
