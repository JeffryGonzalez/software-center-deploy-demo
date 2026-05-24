# Class Documentation

These docs will grow throughout the class. I (Jeff) will put things in my docs-src folder, and you can synch from there. 

## About these docs
These pages are class reference material for the **Applied Angular** course.

They live in `docs-src/*.md`, are compiled to static HTML at build time by `scripts/build-docs.mjs`, and are served from `public/docs/`. The compiled HTML is **not** part of the application bundle — you can verify that in DevTools' Network tab: each doc is fetched on demand.

## Why it works this way

A class about lazy loading and bundle size shouldn't ship a markdown parser and a syntax highlighter in its own bundle. Build-time compilation keeps the runtime payload to just the doc's HTML.

## Adding a new doc

1. Add a markdown file in `docs-src/`, e.g. `creating-an-area.md`.
2. Add a route entry in `areas/docs/feature-docs/docs.routes.ts` referencing the slug.
3. Run `npm start` (which runs `npm run docs` first via `prestart`).
