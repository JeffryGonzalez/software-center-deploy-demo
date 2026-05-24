# msw-lens — project context
generated: 2026-05-21T18:56:59.183Z

> Drop this file into any LLM conversation for instant context about what
> is mocked in this project, what scenarios exist, and what is currently active.

## Active scenarios

| endpoint | method | active scenario |
|----------|--------|-----------------|
| `/api/vendors` | GET | `typical` |
| `/api/vendors` | POST | `success` |
| `/api/vendors/:vendorId/items` | GET | `typical` |
| `/api/vendors/:vendorId/items` | POST | `success` |
| `/api/resources` | GET | `slow` |
| `/api/resources` | POST | `slow` |
| `https://news.hypertheory.com/angular` | GET | `many-items` |
| `/api/catalog` | GET | `typical` |
| `/api/books` | GET | `typical` |

## Scenario details

### GET `/api/vendors`
manifest: `src\mocks\vendors\vendors.yaml`
> Returns the list of vendors loaded into the signal store on the Vendors admin page

- **typical** ✓ **(active)** — Shows several vendors in the card grid — the normal production-like view with name, url, and point-of-contact details
- **empty** — Tests the zero-vendors state — the grid renders blank with no empty-state message; verifies whether a placeholder should be added
- **overloaded** — Tests the 4-column grid with many vendors — verifies layout holds and cards don't overflow or collapse
- **slow** *(delay: 2000)* — Tests the period before _load() resolves — the grid is blank with no loading indicator; verifies whether a skeleton or spinner should be added
- **server-error** *(500)* — Tests 500 response — fetch throws an unhandled rejection with no UI feedback; verifies whether error handling should be added to the store

sourceHints:
- `src/app/areas/catalog/data-catalog/vendors-store.ts`
- `src/app/areas/catalog/feature-admin/pages/vendors.ts`
- `src/app/areas/catalog/ui-vendors/vendor-list.ts`

### POST `/api/vendors`
manifest: `src\mocks\vendors\vendors-create.yaml`
> Creates a new vendor from the Add Vendor form and returns the saved entity with a server-assigned id

- **success** ✓ **(active)** — Echoes the posted payload back with a fresh UUID — tests that the new vendor card appears in the grid and the form resets
- **slow** *(delay: 1000)* — Tests the period while the POST is in flight — verifies whether the submit button shows a pending or disabled state during submission
- **server-error** *(500)* — Tests 500 response — the store's add() throws an unhandled rejection; verifies whether an error message surfaces or the form retains its input

sourceHints:
- `src/app/areas/catalog/data-catalog/vendors-store.ts`
- `src/app/areas/catalog/ui-vendors/vendor-add.ts`

### GET `/api/vendors/:vendorId/items`
manifest: `src\mocks\vendors\vendor-items.yaml`
> Returns catalog items for a specific vendor displayed on the Items admin page

- **typical** ✓ **(active)** — Shows catalog items for the requested vendor — the normal production-like view with titles and version numbers rendered as raw JSON
- **empty** — Tests a vendor with no catalog items — the <pre> renders an empty array with no user-visible empty-state message; verifies whether a placeholder should be added
- **overloaded** — Tests a vendor with 30 catalog items — verifies the <pre> block does not overflow the viewport and that large payloads are still readable
- **slow** *(delay: 2000)* — Tests the loading state — the <pre> stays empty during the delay because there is no loading indicator; verifies whether a spinner or skeleton should be added
- **unknown-vendor** *(404)* — Tests a 404 for a vendor ID that does not exist — verifies whether the page renders an error message or silently shows an empty list
- **server-error** *(500)* — Tests a 500 response — rxMethod has no error handling so the observable completes silently and the <pre> stays empty; verifies whether an error boundary or retry option should be added

sourceHints:
- `src/app/areas/catalog/data-catalog/vendor-catalog-item-store.ts`
- `src/app/areas/catalog/data-catalog/catalog-api.ts`
- `src/app/areas/catalog/feature-admin/pages/items.ts`

### POST `/api/vendors/:vendorId/items`
manifest: `src\mocks\vendors\vendor-items-create.yaml`
> Adds a new catalog item to a specific vendor and returns the saved entity with a server-assigned id

- **success** ✓ **(active)** — Echoes the posted payload back with a fresh UUID — tests that the new item appears in the entity list and any UI that reads from the store updates correctly
- **slow** *(delay: 1000)* — Tests the period while the POST is in flight — verifies whether the submit trigger disables or shows a pending state during submission
- **server-error** *(500)* — Tests a 500 response — the store's addVendor() throws an unhandled rejection; verifies whether an error message surfaces or the request is silently dropped

sourceHints:
- `src/app/areas/catalog/data-catalog/vendor-catalog-item-store.ts`
- `src/app/areas/catalog/data-catalog/catalog-api.ts`

### GET `/api/resources`
manifest: `src\mocks\resources\resources.yaml`
> Returns the list of developer resources displayed on the Overview page

- **typical** — Shows several developer resources with titles, descriptions, URLs, and tags — the normal production-like view
- **empty** — Tests the zero-items state — currently renders a bare <ul> with no empty-state message; useful for verifying whether one should be added
- **overloaded** — Tests rendering with 60 resources to expose layout overflow, scroll behaviour, or the absence of pagination
- **slow** ✓ **(active)** *(delay: 1000)* — Tests the loading/skeleton state while the request is in flight; verifies no flash of empty content
- **unauthorized** *(401)* — Tests 401 response — verifies session-expiry handling (redirect to login or inline error) from the store or a route guard
- **server-error** *(500)* — Tests 500 response — verifies error boundary, fallback UI, or user-visible error message when the API is down

sourceHints:
- `src/app/areas/resources/data/resources.ts`
- `src/app/areas/resources/ui/list.ts`
- `src/app/areas/resources/feature-home/pages/overview.ts`

### POST `/api/resources`
manifest: `src\mocks\resources\resources-create.yaml`
> Creates a new developer resource from the Add Resource form

- **success** — Echoes the posted payload back with a fresh UUID — tests that the new resource is appended to the store and the form resets
- **slow** ✓ **(active)** *(delay: 1000)* — Tests that the submit button's pending/disabled state holds while the request is in flight
- **validation-error** *(400)* — Tests how the form surfaces a 400 from the server — currently rendered via the generic alert, no per-field messages
- **conflict** *(409)* — Tests how the form surfaces a 409 duplicate-URL conflict from the server (race with client-side dedupe)
- **unauthorized** *(401)* — Tests 401 mid-submit — verifies whether the form retains input and whether session-expiry handling kicks in
- **server-error** *(500)* — Tests 500 response — verifies the form retains input and shows a recoverable error

sourceHints:
- `src/app/areas/resources/data/resources.ts`
- `src/app/areas/resources/feature-home/pages/add.ts`

### GET `https://news.hypertheory.com/angular`
manifest: `src\mocks\news\news.yaml`
> Returns recent Angular news items displayed on the News page

- **typical** — Shows several recent Angular news items — the normal production-like view with titles, bodies, and formatted dates
- **empty** — Tests the zero-items state — the list renders with no items and no empty-state message; verifies whether a "no news" placeholder should be added
- **slow** *(delay: 3000)* — Tests the loading state — the content area is blank while the request is in flight (no skeleton or spinner); verifies that only the page header is visible during load
- **never-resolves** *(delay: infinite)* — Tests the permanent-loading state — content stays blank indefinitely; verifies whether a timeout message or fallback UI should be added
- **server-error** *(500)* — Tests 500 response — content area silently stays blank with no error message surfaced to the user; verifies whether an error boundary or fallback UI should be added
- **stale-dates** — Tests items with invalid, empty, and extreme published dates — verifies that DatePipe edge cases do not break rendering and that blank or unexpected date output is acceptable
- **many-items** ✓ **(active)** — Tests rendering with 50 news items — verifies that the list handles a large number of items without layout issues, performance degradation, or truncation

sourceHints:
- `src/app/areas/home/feature-home/pages/news.ts`
- `src/app/areas/home/feature-home/ui/news-list.ts`
- `src/app/areas/home/feature-home/data/types.ts`

### GET `/api/catalog`
manifest: `src\mocks\catalog\catalog.yaml`
> Returns the list of approved software items displayed on the Catalog overview page

- **typical** ✓ **(active)** — Shows several approved software items — the normal production-like view with titles and vendors
- **empty** — Tests the @empty fallback row — verifies "No currently supported software" renders instead of a blank table body
- **overloaded** — Tests rendering with many catalog items — verifies the table handles long lists without overflow or layout issues
- **slow** *(delay: 1000)* — Tests the loading-spinner state while the request is in flight — verifies all spinners are visible and no flash of empty content
- **server-error** *(500)* — Tests 500 response — verifies the alert-error banner renders with "Bummer - can't load the catalog right now."
- **malformed-data** *(200)* — Return a few catalog items that don't have titles or vendors

sourceHints:
- `src/app/areas/catalog/data-catalog/types.ts`
- `src/app/areas/catalog/feature-catalog/pages/overview.ts`

### GET `/api/books`
manifest: `src\mocks\books\books.yaml`
> Returns the list of classic books used by the Books lab

- **typical** ✓ **(active)** — Shows ~100 classic books — the production-like view that exercises sorting, stats, and pagination
- **empty** — Tests the zero-items state — verifies the list page renders an empty-state message instead of a bare table
- **slow** *(delay: 1000)* — Tests the loading/skeleton state while the request is in flight
- **server-error** *(500)* — Tests 500 response — verifies error boundary or fallback UI

sourceHints:
- `src/app/areas/books/data/books.ts`
- `src/app/areas/books/feature-home/pages/list.ts`
- `src/app/areas/books/feature-home/pages/stats.ts`

---

## How msw-lens works

msw-lens reads scenario manifests — YAML files co-located with MSW handlers under
`src/mocks/`. The active selection writes to two tool-owned files:

- `src/mocks/active-scenarios.ts` — which scenario is active per endpoint
- `src/mocks/bypassed-endpoints.ts` — endpoints that bypass MSW entirely (pass through to the real API)

Vite HMR picks up file changes immediately. No browser refresh needed.

These files are **tool-owned**. Do not edit them manually; msw-lens regenerates them on every run.

**Bypass requires** MSW worker started with `onUnhandledRequest: 'bypass'` —
otherwise unhandled requests will warn or error instead of passing through.

**Commands:**
- `npm run lens` — interactive scenario switcher (single run)
- `npm run lens:watch` — stay in the switcher, Ctrl+C to exit
- `npm run lens:context -- <component.ts>` — generate a prompt for an LLM

Manifests live alongside handlers: `auth/user.yaml` next to `auth/user.ts`.

---

## Manifest format

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

