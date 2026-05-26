# msw-lens context
generated: 2026-05-26T13:39:52.276Z
entry: src\app\areas\home\feature-home\pages\recipes.ts

---

## The ask

I'm working on the `Recipes` component in a web application and want to
create MSW mock scenarios for the endpoints it depends on.

Based on the source files below, please:

1. Identify the HTTP endpoints this component reaches — through its hooks, stores, services, or direct fetch/http calls
2. For each endpoint, generate a `.yaml` manifest in msw-lens format (see "Manifest pattern" below)
3. For each endpoint, also generate a handler stub (`.ts`) with a switch statement
   over the scenario names (see "Handler pattern" below)
4. Register the new handler in `handlers.ts` — match the import pattern shown above
5. For each scenario, cover: happy path, empty/null states, error conditions
   (with appropriate HTTP status codes), slow/timeout, and any edge cases the
   **response type shape** suggests I haven't anticipated

**On scenario descriptions:** say what UI behavior it tests, not what the data
looks like. Not: "Returns an empty items array." Instead: "Tests that the empty
cart message appears and the checkout button disables."

**If an endpoint already has a manifest** below: do not generate a new one. Suggest
scenarios to add to the existing manifest (or note that coverage is sufficient), and
be explicit about which endpoints you treated this way.

Follow the canonical Manifest pattern in the "About msw-lens" section below. If you
notice anything in the component or its markup that suggests a scenario I should
consider but haven't asked about — flag it.

If the provided files are incomplete — init methods with no visible call site,
protected routes with no guard in scope, dependencies that seem to come from
outside what was crawled — **list your assumptions explicitly** rather than
silently filling the gaps.

---

## Source files

### recipes.ts
`src\app\areas\home\feature-home\pages\recipes.ts`
```typescript
import { Component } from '@angular/core';
import { PageHeader } from '../../../shared/ui-page-header/page-header';
import { httpResource } from '@angular/common/http';
import { JsonPipe } from '@angular/common';

export type Recipe = {
  id: string;
  name: string;
  longNarrative: string;
  steps: string[];
};

@Component({
  selector: 'app-home-recipes',
  imports: [PageHeader, JsonPipe],
  template: `
    <app-page-header title="Page Title" description="Page description." />
    <div class="prose max-w-none">
      <ul>
        @for (r of recipeResource.value(); track r.id) {
          <li>
            <pre> {{ r | json }}</pre>
          </li>
        }
      </ul>
    </div>
  `,
  styles: ``,
})
export class RecipesPage {
  recipeResource = httpResource<Recipe[]>(() => 'https://recipes.com/api/my-recipes');
}
```

### page-header.ts
`src\app\areas\shared\ui-page-header\page-header.ts`
```typescript
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <header class="flex items-start justify-between gap-4 mb-4">
      <div>
        <h2 class="text-2xl font-semibold">{{ title() }}</h2>
        @if (description(); as d) {
          <p class="text-sm opacity-70 mt-1">{{ d }}</p>
        }
      </div>
      <div class="flex items-center gap-2">
        <ng-content select="[actions]" />
      </div>
    </header>
  `,
})
export class PageHeader {
  title = input.required<string>();
  description = input<string>();
}
```

---

## Handler registration

### handlers.ts
`src\mocks\handlers.ts`
```typescript
import { HttpHandler } from 'msw';

import catalogHandler from './catalog/catalog';
import vendorsHandler from './vendors/vendors';
import vendorItemsHandler from './vendors/vendor-items';
import bypassed from './bypassed-endpoints';

const all: HttpHandler[] = [
  ...catalogHandler,
  ...vendorsHandler,
  ...vendorItemsHandler,
];

export const handlers: HttpHandler[] = all.filter((h) => {
  const { method, path } = h.info;
  if (typeof method !== 'string' || typeof path !== 'string') return true;
  return !bypassed.has(`${method} ${path}`);
});
```

---

## Existing manifests + handlers (pattern reference)

### vendors.yaml
`src\mocks\vendors\vendors.yaml`
```yaml
endpoint: /api/vendors
method: GET
shape: collection
description: Returns the list of vendors loaded into the signal store on the Vendors admin page

responseType:
  name: VendorEntity
  path: src/app/areas/catalog/data-catalog/types.ts

context:
  sourceHints:
    - src/app/areas/catalog/data-catalog/vendors-store.ts
    - src/app/areas/catalog/feature-admin/pages/vendors.ts
    - src/app/areas/catalog/ui-vendors/vendor-list.ts
  hints:
    - 'The store _load() uses bare fetch with no .catch() — a 500 or network error throws an unhandled promise rejection with no UI feedback'
    - 'VendorList has no @empty block — an empty array renders a blank 4-column grid with no empty-state message'
    - 'The store is provided at root via signalStore defaults — _load() fires once on onInit and is not retried'

scenarios:
  typical:
    description: Shows several vendors in the card grid — the normal production-like view with name, url, and point-of-contact details
    active: true
  empty:
    description: Tests the zero-vendors state — the grid renders blank with no empty-state message; verifies whether a placeholder should be added
  overloaded:
    description: Tests the 4-column grid with many vendors — verifies layout holds and cards don't overflow or collapse
  slow:
    description: Tests the period before _load() resolves — the grid is blank with no loading indicator; verifies whether a skeleton or spinner should be added
    delay: '2000'
  server-error:
    description: Tests 500 response — fetch throws an unhandled rejection with no UI feedback; verifies whether error handling should be added to the store
    httpStatus: 500
```

### vendors.ts
`src\mocks\vendors\vendors.ts`
```typescript
import { http, HttpHandler, HttpResponse, delay } from 'msw';
import activeScenarios from '../active-scenarios';

const ENDPOINT = '/api/vendors';

const typicalVendors = [
  {
    id: '1',
    name: 'Microsoft',
    url: 'https://microsoft.com',
    pointOfContact: { name: 'Alice Nguyen', email: 'alice@microsoft.com', phone: '555-0101' },
  },
  {
    id: '2',
    name: 'Adobe',
    url: 'https://adobe.com',
    pointOfContact: { name: 'Bob Chen', email: 'bob@adobe.com', phone: '555-0102' },
  },
  {
    id: '3',
    name: 'Salesforce',
    url: 'https://salesforce.com',
    pointOfContact: { name: 'Carol Smith', email: 'carol@salesforce.com', phone: '555-0103' },
  },
  {
    id: '4',
    name: 'GitHub',
    url: 'https://github.com',
    pointOfContact: { name: 'Dan Park', email: 'dan@github.com', phone: '555-0104' },
  },
  {
    id: '5',
    name: 'Docker',
    url: 'https://docker.com',
    pointOfContact: { name: 'Eva Torres', email: 'eva@docker.com', phone: '555-0105' },
  },
  {
    id: '6',
    name: 'AgileBits',
    url: 'https://1password.com',
    pointOfContact: { name: 'Frank Lee', email: 'frank@agilebits.com', phone: '555-0106' },
  },
];

const overloadedVendors = Array.from({ length: 40 }, (_, i) => ({
  id: String(i + 1),
  name: `Vendor ${i + 1}`,
  url: `https://vendor${i + 1}.example.com`,
  pointOfContact: {
    name: `Contact ${i + 1}`,
    email: `contact${i + 1}@vendor${i + 1}.example.com`,
    phone: `555-${String(i + 1).padStart(4, '0')}`,
  },
}));

export default [
  http.get(ENDPOINT, async () => {
    const scenario = activeScenarios[`GET ${ENDPOINT}`] ?? 'typical';

    switch (scenario) {
      case 'empty':
        return HttpResponse.json([]);

      case 'overloaded':
        return HttpResponse.json(overloadedVendors);

      case 'slow':
        await delay(2000);
        return HttpResponse.json(typicalVendors);

      case 'server-error':
        return new HttpResponse(null, { status: 500 });

      case 'typical':
      default:
        return HttpResponse.json(typicalVendors);
    }
  }),

  http.post(ENDPOINT, async ({ request }) => {
    const scenario = activeScenarios[`POST ${ENDPOINT}`] ?? 'success';

    switch (scenario) {
      case 'slow':
        await delay(1000);
        return HttpResponse.json(
          { ...((await request.json()) as object), id: crypto.randomUUID() },
          { status: 201 },
        );

      case 'server-error':
        return new HttpResponse(null, { status: 500 });

      case 'success':
      default:
        return HttpResponse.json(
          { ...((await request.json()) as object), id: crypto.randomUUID() },
          { status: 201 },
        );
    }
  }),
] as HttpHandler[];
```

### vendors-create.yaml
`src\mocks\vendors\vendors-create.yaml`
```yaml
endpoint: /api/vendors
method: POST
description: Creates a new vendor from the Add Vendor form and returns the saved entity with a server-assigned id

responseType:
  name: VendorEntity
  path: src/app/areas/catalog/data-catalog/types.ts

context:
  sourceHints:
    - src/app/areas/catalog/data-catalog/vendors-store.ts
    - src/app/areas/catalog/ui-vendors/vendor-add.ts
  hints:
    - 'The store calls addEntity with the response body — the response MUST include an id or the entity will be missing from the store'
    - 'The store add() method has no .catch() — a non-ok response or network error throws an unhandled promise rejection with no UI feedback'
    - 'The submit button uses aria-disabled, not disabled — it can still be clicked when the form is invalid'
    - 'On success the form resets via vendorForm().reset() and model.set(...) — verify the form clears and the new card appears in the grid'

scenarios:
  success:
    description: Echoes the posted payload back with a fresh UUID — tests that the new vendor card appears in the grid and the form resets
    active: true
  slow:
    description: Tests the period while the POST is in flight — verifies whether the submit button shows a pending or disabled state during submission
    delay: '1000'
  server-error:
    description: Tests 500 response — the store's add() throws an unhandled rejection; verifies whether an error message surfaces or the form retains its input
    httpStatus: 500
```

### vendor-items.yaml
`src\mocks\vendors\vendor-items.yaml`
```yaml
endpoint: /api/vendors/:vendorId/items
method: GET
shape: collection
description: Returns catalog items for a specific vendor displayed on the Items admin page

responseType:
  name: VendorCatalogItem
  path: src/app/areas/catalog/data-catalog/catalog-api.ts

context:
  sourceHints:
    - src/app/areas/catalog/data-catalog/vendor-catalog-item-store.ts
    - src/app/areas/catalog/data-catalog/catalog-api.ts
    - src/app/areas/catalog/feature-admin/pages/items.ts
  hints:
    - 'ItemsPage receives an `id` input from the route but never calls store.getForVendor(id) — the store will always display an empty entity list regardless of the active vendor'
    - 'The store uses switchMap — a second call to getForVendor() cancels the first; there is no loading state or error handling in the store or template'
    - 'addCatalogItemToVendor() in CatalogApi has a URL bug: `/api/vendors/${vendorId}items` is missing a slash — POST requests will never reach /api/vendors/:vendorId/items'
    - 'The template renders raw JSON via JsonPipe in a <pre> block — there is no loading indicator, empty-state message, or error UI'

scenarios:
  typical:
    description: Shows catalog items for the requested vendor — the normal production-like view with titles and version numbers rendered as raw JSON
    active: true
  empty:
    description: Tests a vendor with no catalog items — the <pre> renders an empty array with no user-visible empty-state message; verifies whether a placeholder should be added
  overloaded:
    description: Tests a vendor with 30 catalog items — verifies the <pre> block does not overflow the viewport and that large payloads are still readable
  slow:
    description: Tests the loading state — the <pre> stays empty during the delay because there is no loading indicator; verifies whether a spinner or skeleton should be added
    delay: '2000'
  unknown-vendor:
    description: Tests a 404 for a vendor ID that does not exist — verifies whether the page renders an error message or silently shows an empty list
    httpStatus: 404
  server-error:
    description: Tests a 500 response — rxMethod has no error handling so the observable completes silently and the <pre> stays empty; verifies whether an error boundary or retry option should be added
    httpStatus: 500
```

### vendor-items.ts
`src\mocks\vendors\vendor-items.ts`
```typescript
import { http, HttpHandler, HttpResponse, delay } from 'msw';
import activeScenarios from '../active-scenarios';

const ENDPOINT = '/api/vendors/:vendorId/items';

type VendorCatalogItem = {
  id: string;
  title: string;
  version: string;
};

const itemsByVendor: Record<string, VendorCatalogItem[]> = {
  '1': [
    { id: 'ms-1', title: 'Microsoft 365', version: '2024' },
    { id: 'ms-2', title: 'Visual Studio Code', version: '1.89.0' },
    { id: 'ms-3', title: 'Azure DevOps', version: '2024.1' },
  ],
  '2': [
    { id: 'ad-1', title: 'Adobe Acrobat', version: '24.0' },
    { id: 'ad-2', title: 'Creative Cloud', version: '2024' },
    { id: 'ad-3', title: 'Figma', version: '116.0' },
  ],
  '3': [
    { id: 'sf-1', title: 'Salesforce CRM', version: "Spring '24" },
    { id: 'sf-2', title: 'Slack', version: '4.38.0' },
    { id: 'sf-3', title: 'Tableau', version: '2024.1' },
  ],
  '4': [
    { id: 'gh-1', title: 'GitHub Enterprise', version: '3.12' },
    { id: 'gh-2', title: 'GitHub Actions', version: '2.317.0' },
    { id: 'gh-3', title: 'GitHub Copilot', version: '1.0' },
  ],
  '5': [
    { id: 'dk-1', title: 'Docker Desktop', version: '4.30.0' },
    { id: 'dk-2', title: 'Docker Hub Pro', version: '1.0' },
  ],
  '6': [
    { id: 'ab-1', title: '1Password Teams', version: '8.10.0' },
    { id: 'ab-2', title: '1Password CLI', version: '2.25.0' },
  ],
};

const overloadedItems: VendorCatalogItem[] = Array.from({ length: 30 }, (_, i) => ({
  id: `item-${i + 1}`,
  title: `Catalog Item ${i + 1}`,
  version: `${Math.floor(i / 10) + 1}.${i % 10}.0`,
}));

export default [
  http.get(ENDPOINT, async ({ params }) => {
    const vendorId = params['vendorId'] as string;
    const scenario = activeScenarios[`GET ${ENDPOINT}`] ?? 'typical';

    switch (scenario) {
      case 'empty':
        return HttpResponse.json([]);

      case 'overloaded':
        return HttpResponse.json(overloadedItems);

      case 'slow':
        await delay(2000);
        return HttpResponse.json(itemsByVendor[vendorId] ?? []);

      case 'unknown-vendor':
        return new HttpResponse(null, { status: 404 });

      case 'server-error':
        return new HttpResponse(null, { status: 500 });

      case 'typical':
      default:
        return HttpResponse.json(itemsByVendor[vendorId] ?? []);
    }
  }),

  http.post(ENDPOINT, async ({ request }) => {
    const scenario = activeScenarios[`POST ${ENDPOINT}`] ?? 'success';

    switch (scenario) {
      case 'slow':
        await delay(1000);
        return HttpResponse.json(
          { ...((await request.json()) as object), id: crypto.randomUUID() },
          { status: 201 },
        );

      case 'server-error':
        return new HttpResponse(null, { status: 500 });

      case 'success':
      default:
        return HttpResponse.json(
          { ...((await request.json()) as object), id: crypto.randomUUID() },
          { status: 201 },
        );
    }
  }),
] as HttpHandler[];
```

### vendor-items-create.yaml
`src\mocks\vendors\vendor-items-create.yaml`
```yaml
endpoint: /api/vendors/:vendorId/items
method: POST
description: Adds a new catalog item to a specific vendor and returns the saved entity with a server-assigned id

responseType:
  name: VendorCatalogItem
  path: src/app/areas/catalog/data-catalog/catalog-api.ts

context:
  sourceHints:
    - src/app/areas/catalog/data-catalog/vendor-catalog-item-store.ts
    - src/app/areas/catalog/data-catalog/catalog-api.ts
  hints:
    - 'addCatalogItemToVendor() has a URL bug: the path is `/api/vendors/${vendorId}items` (missing slash) — this handler uses the corrected URL /api/vendors/:vendorId/items; the bug must be fixed in catalog-api.ts before this handler can intercept POST requests'
    - 'The store calls addEntity with the response body — the response MUST include an id or the new entity will be missing from the store'
    - 'The store addVendor() method has no .catch() — a non-ok response or network error throws an unhandled rejection with no UI feedback'

scenarios:
  success:
    description: Echoes the posted payload back with a fresh UUID — tests that the new item appears in the entity list and any UI that reads from the store updates correctly
    active: true
  slow:
    description: Tests the period while the POST is in flight — verifies whether the submit trigger disables or shows a pending state during submission
    delay: '1000'
  server-error:
    description: Tests a 500 response — the store's addVendor() throws an unhandled rejection; verifies whether an error message surfaces or the request is silently dropped
    httpStatus: 500
```

### catalog.yaml
`src\mocks\catalog\catalog.yaml`
```yaml
endpoint: /api/catalog
method: GET
shape: collection
description: Returns the list of approved software items displayed on the Catalog overview page

responseType:
  name: CatalogListItem
  path: src/app/areas/catalog/data-catalog/types.ts

context:
  sourceHints:
    - src/app/areas/catalog/data-catalog/types.ts
    - src/app/areas/catalog/feature-catalog/pages/overview.ts
  hints:
    - 'The @for block has an @empty fallback — an empty array renders "No currently supported software" instead of a bare table'
    - 'The error block renders an alert-error banner — any non-2xx response triggers it via httpResource.error()'

scenarios:
  typical:
    description: Shows several approved software items — the normal production-like view with titles and vendors
    active: true
  empty:
    description: Tests the @empty fallback row — verifies "No currently supported software" renders instead of a blank table body
  overloaded:
    description: Tests rendering with many catalog items — verifies the table handles long lists without overflow or layout issues
  slow:
    description: Tests the loading-spinner state while the request is in flight — verifies all spinners are visible and no flash of empty content
    delay: '1000'
  server-error:
    description: Tests 500 response — verifies the alert-error banner renders with "Bummer - can't load the catalog right now."
    httpStatus: 500
  malformed-data:
    description: Return a few catalog items that don't have titles or vendors
    httpStatus: 200
```

### catalog.ts
`src\mocks\catalog\catalog.ts`
```typescript
import { http, HttpHandler, HttpResponse, delay } from 'msw';
import activeScenarios from '../active-scenarios';

const ENDPOINT = '/api/catalog';

const typicalCatalog = [
  { id: '1', title: 'Microsoft 365', vendor: 'Microsoft' },
  { id: '2', title: 'Visual Studio Code', vendor: 'Microsoft' },
  { id: '3', title: 'Slack', vendor: 'Salesforce' },
  { id: '4', title: 'Zoom', vendor: 'Zoom Video Communications' },
  { id: '5', title: 'GitHub Enterprise', vendor: 'GitHub' },
  { id: '6', title: 'Docker Desktop', vendor: 'Docker' },
  { id: '7', title: 'Figma', vendor: 'Adobe' },
  { id: '8', title: '1Password', vendor: 'AgileBits' },
];

const malformedCatalog = [
  { id: '1', title: '', vendor: 'Microsoft' },
  { id: '2', title: 'Visual Studio Code' },
  { id: '3', vendor: 'Salesforce' },
  { id: '4', title: null, vendor: null },
];

const overloadedCatalog = Array.from({ length: 80 }, (_, i) => ({
  id: String(i + 1),
  title: `Approved Software ${i + 1}`,
  vendor: `Vendor ${(i % 10) + 1}`,
}));

export default [
  http.get(ENDPOINT, async () => {
    const scenario = activeScenarios[`GET ${ENDPOINT}`] ?? 'typical';

    switch (scenario) {
      case 'empty':
        return HttpResponse.json([]);

      case 'overloaded':
        return HttpResponse.json(overloadedCatalog);

      case 'slow':
        await delay(1000);
        return HttpResponse.json(typicalCatalog);

      case 'malformed-data':
        return HttpResponse.json(malformedCatalog);

      case 'server-error':
        return new HttpResponse(null, { status: 500 });

      case 'typical':
      default:
        return HttpResponse.json(typicalCatalog);
    }
  }),
] as HttpHandler[];
```

---

## About msw-lens

msw-lens manages MSW scenario switching for web development. Manifests live
alongside handlers under `src/mocks/`. msw-lens writes two tool-owned files:
`src/mocks/active-scenarios.ts` (which scenario is active per endpoint) and
`src/mocks/bypassed-endpoints.ts` (endpoints that pass through to the real API
instead of being mocked). Vite HMR picks up changes immediately.

Both files are tool-owned. Do not include instructions to edit them manually.

Bypass requires MSW worker started with `onUnhandledRequest: 'bypass'` — otherwise
unhandled requests warn or error instead of passing through.

### Manifest pattern (match this exactly)

```yaml
endpoint: /api/resource/   # MUST match the handler's ENDPOINT constant exactly
method: GET
shape: document            # document | collection — determines scenario vocabulary
description: What this endpoint returns

responseType:              # the success-response type
  name: TypeScriptTypeName
  path: relative/path/to/types.ts   # path relative to where you run `lens:context`

errorType:                 # optional — 4xx/5xx response shape (e.g. RFC 9457 ProblemDetails)
  name: ProblemDetails
  path: relative/path/to/types.ts

context:
  sourceHints:             # paths to files that consume this endpoint
    - path/to/store.ts     # LLM reads these directly — provide pointers, not summaries
    - path/to/component.ts
  hints:                   # optional — free-form annotations the code doesn't make obvious
    - "401 always redirects to /login via a route guard"
    - "quantity must be between 1 and 99"

scenarios:
  scenario-name:
    description: What UI behavior this tests (not what the data looks like)
    active: true           # at most one scenario per manifest — marks the default
    httpStatus: 401        # optional — omit for 200
    delay: real            # optional — 'real', 'infinite', or integer-string ms ('2000')
```

Four things are non-negotiable:

1. **`endpoint` MUST match the handler's `ENDPOINT` constant exactly, and both must match what the source actually calls.** If the source uses an absolute URL (e.g. `fetch('https://api.example.com/posts')`), use that absolute URL as both `endpoint` and `ENDPOINT` — MSW intercepts absolute URLs directly. Do not modify the source. The switcher writes keys to `active-scenarios.ts` as `METHOD endpoint` (e.g. `GET /api/cart`); the handler reads keys in the same format. A mismatch is silent — the handler falls through to its default case forever and the switcher appears to do nothing.

2. **`shape` is `document` or `collection` (literal values) for GET endpoints. Omit `shape` for mutations** (POST/PUT/PATCH/DELETE) — the method itself drives the archetype vocabulary.

3. **At most one scenario has `active: true`** — and you should always specify one. The fallback (first scenario in declaration order) reorders silently when the manifest is edited.

4. **`delay` is one of:** `real` (realistic latency), `infinite` (never resolves — tests timeout UI), or an integer-string of milliseconds (`"2000"`).


### Handler pattern (match this exactly)

Every handler follows the shape below. Three things are non-negotiable:

1. **Default-import** `activeScenarios` — the file uses `export default`, not a named export.
2. **Key lookup uses `` `METHOD ${ENDPOINT}` ``** — the switcher writes keys in that format. Missing the method prefix means the switcher has no effect and the handler silently falls through to the default case.
3. **Default-export the handler array** as `HttpHandler[]` — `handlers.ts` aggregates by importing each as a default and spreading.

```typescript
import { http, HttpHandler, HttpResponse, delay } from 'msw';
import activeScenarios from '../active-scenarios';

const ENDPOINT = '/api/cart';

export default [
  http.get(ENDPOINT, async () => {
    const scenario = activeScenarios[`GET ${ENDPOINT}`] ?? 'typical';

    switch (scenario) {
      case 'empty':
        return HttpResponse.json({ items: [], total: 0 });
      case 'unauthorized':
        // Returning a structured ProblemDetails body — see manifest `errorType`
        return HttpResponse.json(
          { type: 'about:blank', title: 'Session expired', status: 401 },
          { status: 401 }
        );
      case 'server-error':
        return new HttpResponse(null, { status: 500 });
      case 'slow':
        await delay('real');
        return HttpResponse.json(typicalResponse);
      case 'never-resolves':
        // delay('infinite') — request never settles; tests timeout / loading-stuck UI
        await delay('infinite');
        return HttpResponse.json(typicalResponse);
      case 'typical':
      default:
        return HttpResponse.json(typicalResponse);
    }
  }),
] as HttpHandler[];
```

Register in `handlers.ts` (with the bypass filter):

```typescript
import { HttpHandler } from 'msw';
import cartHandler from './cart/cart';
import bypassed from './bypassed-endpoints';

const all: HttpHandler[] = [...cartHandler];

export const handlers: HttpHandler[] = all.filter((h) => {
  const { method, path } = h.info;
  if (typeof method !== 'string' || typeof path !== 'string') return true;
  return !bypassed.has(`${method} ${path}`);
});
```

`bypassed-endpoints.ts` is tool-owned. The filter removes bypassed endpoints from MSW
registration entirely so matching requests pass through to the real network. Requires
`worker.start({ onUnhandledRequest: 'bypass' })`.

Scenario archetypes to consider:

**Document endpoints** (single item responses):
- `happy-path` — successful response with typical data
- `not-found` — 404, resource doesn't exist
- `unauthorized` — 401, tests auth guards and login redirect
- `server-error` — 500, tests error boundary or fallback UI
- `slow` — MSW delay('real'), tests loading/skeleton states
- `malformed-data` — response missing optional fields or with unexpected nulls

**Collection endpoints** (array/list responses):
- `typical` — N items, normal case
- `empty` — zero items, tests empty-state UI
- `overloaded` — far more items than the UI was designed for (tests pagination, overflow)
- `slow` — tests loading skeleton
- `unauthorized` — 401
- `server-error` — 500

**Mutation endpoints** (POST / PUT / PATCH / DELETE):
- `success` / `created` — 201/202/204, happy path; tests UI confirmation, redirect, or form reset
- `validation-error` — 400/422, field-level ProblemDetails; tests whether error messages surface per-field or as a summary
- `conflict` — 409, duplicate or constraint violation; tests whether the UI surfaces a meaningful message
- `unauthorized` — 401, session expired mid-form; tests redirect or inline session error
- `forbidden` — 403, insufficient role; tests whether the UI blocks submission or shows an access error
- `server-error` — 500; tests whether the form retains input and shows a recoverable error message
- `slow` — MSW delay('real'); tests whether the submit button shows a pending/disabled state during submission
