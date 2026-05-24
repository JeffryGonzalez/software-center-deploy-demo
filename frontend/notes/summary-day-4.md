# Day 4 Summary — Applied Angular (May 21, 2026)

Day 4 was the capstone session of the week. After three days of building the architectural foundation of a production-grade Angular application, today pulled everything together: code quality tooling, authentication and authorization, a real HTTP API to replace mock data, RxJS-interop inside NgRx Signal Stores, and a polished "Add Item" workflow using Angular's new Signals-based forms. The session closed with a discussion of using AI as a learning accelerator, and a set of final labs to take the patterns home.

---

## 1. Code Quality: ESLint and Prettier

The morning opened with a practical look at the tools that keep a codebase consistent across a team.

**What was covered:**
- **Prettier** — an opinionated formatter configured via `.prettierrc`. The rule "format on save" was enabled in VS Code settings. Prettier handles subjective style questions (semicolons, quote style, print width) so the team doesn't have to argue about them.
- **ESLint** — a linter that catches logical errors, enforces Angular-specific best practices, and can fail a CI build when rules are violated.

**Why it matters:** When everyone's editor auto-formats on save using the same config, diffs in pull requests show only meaningful changes. ESLint catches real bugs (unused imports, deprecated patterns) at edit-time rather than in production.

**Key takeaway:** Add these tools once, configure them in `.prettierrc` and `eslint.config.js`, and let the editor do the work. The Angular CLI scaffolds both by default.

---

## 2. Authentication and Authorization

The `authStore` (introduced earlier in the week) was completed today, and a set of **route guards** was added on top of it.

### The Auth Store

```ts
// src/app/areas/shared/util-auth/store.ts
export const authStore = signalStore(
  withState<AuthState>({ kind: 'unauthenticated' }),
  withReducer(
    on(authActions.login,  () => ({ kind: 'authenticated', user: { ... } })),
    on(authActions.logout, () => ({ kind: 'unauthenticated' })),
  ),
  withComputed((state) => ({
    isAuthenticated:           computed(() => state.kind() === 'authenticated'),
    isSoftwareCenterTeamMember: computed(() => ...),
    isManager:                 computed(() => ...),
  })),
);
```

The state shape is a **discriminated union** (`kind: 'authenticated' | 'unauthenticated'`), which makes impossible states impossible and keeps computed derivations clean.

### Route Guards

```ts
// src/app/areas/shared/util-auth/auth-guards.ts
export const softwareCenterTeamMember = () => {
  const auth   = inject(authStore);
  const router = inject(Router);
  if (auth.isSoftwareCenterTeamMember()) {
    return true;
  } else {
    return router.createUrlTree(['/']);   // redirect to home
  }
};
```

Guards are plain functions — they inject any services they need via `inject()` and return either `true` or a `UrlTree` for a redirect. Angular's router calls them automatically when navigating to a guarded route.

**Why this matters:** Authorization logic lives in one place, not scattered across components. Changing a role check updates the guard, and every route that uses it is protected automatically.

---

## 3. RxJS Interop: `rxMethod` inside Signal Stores

This was one of the most important conceptual shifts of the day. Angular's modern API is built on **Signals**, but the wider ecosystem (HTTP, timers, WebSockets) still speaks **RxJS Observables**. `rxMethod` from `@ngrx/signals/rxjs-interop` bridges the two.

### The Pattern

```ts
// src/app/areas/catalog/data-catalog/vendor-catalog-item-store.ts
export const vendorCatalogItemStore = signalStore(
  withEntities<VendorCatalogItem>(),
  withMethods((store) => {
    const apiService = inject(CatalogApi);
    return {
      // Called with a vendorId string; RxJS handles cancellation via switchMap
      getForVendor: rxMethod<string>(
        pipe(
          tap((_) => patchState(store, removeAllEntities())), // clear stale data first
          switchMap((id) =>
            apiService
              .getCatalogItems(id)
              .pipe(tap((items) => patchState(store, setEntities(items)))),
          ),
        ),
      ),
      // Called with { vendorId, item }; mergeMap allows concurrent adds
      addVendor: rxMethod<CatalogItemRequest>(
        pipe(
          mergeMap((v) =>
            apiService
              .addCatalogItemToVendor(v.vendorId, v.item)
              .pipe(tap((v) => patchState(store, addEntity(v)))),
          ),
        ),
      ),
    };
  }),
);
```

**Key concepts demonstrated:**
- `rxMethod<T>` accepts a value (or signal, or observable) of type `T` and pipes it through an RxJS pipeline.
- `switchMap` cancels any in-flight request when a new value arrives — perfect for "load items for the selected vendor."
- `mergeMap` allows concurrent requests — correct for "add multiple items in parallel."
- `tap` is used to write results back into the store via `patchState`.

**Why this matters:** You get the ergonomics of Angular Signals in your components *and* all the power of RxJS (cancellation, debouncing, error handling) inside the store. Neither world is sacrificed.

---

## 4. The Catalog API Service

A dedicated `CatalogApi` class was introduced to encapsulate HTTP calls for catalog items, keeping the store focused on state management.

```ts
// src/app/areas/catalog/data-catalog/catalog-api.ts
export class CatalogApi {
  #http = inject(HttpClient);

  getCatalogItems(vendorId: string) {
    return this.#http.get<VendorCatalogItem[]>(`/api/vendors/${vendorId}/items`);
  }

  addCatalogItemToVendor(vendorId: string, item: VendorCatalogItemCreate) {
    return this.#http.post<VendorCatalogItem>(`/api/vendors/${vendorId}/items`, item);
  }
}
```

**Why this pattern:** Separating the HTTP layer from the store keeps each class focused on one responsibility. The store handles *what state looks like*; the API service handles *how to fetch and send data*.

The service is provided at the **route level** (`providers: [vendorsStore, vendorCatalogItemStore, CatalogApi]` in `admin.routes.ts`) so it shares the same lifetime as its companion stores — it's created when the admin route is activated and destroyed when you navigate away.

---

## 5. Adding Catalog Items with Signals-Based Forms

The `AddItemPage` component showed how Angular's new `@angular/forms/signals` API handles a real create workflow.

```ts
export class AddItemPage {
  vendorStore   = inject(vendorsStore);
  itemStore     = inject(vendorCatalogItemStore);
  selectedVendorId = signal('');
  model = signal<VendorCatalogItemCreate>({ title: '', version: '' });

  itemForm = form(
    this.model,
    (schema) => {
      required(schema.title,   { message: 'Title is required' });
      minLength(schema.title, 2);
      required(schema.version, { message: 'Version is required' });
    },
    {
      submission: {
        action: async (value) => {
          const vendorId = this.selectedVendorId();
          if (!vendorId) return;
          await this.itemStore.addVendor({ vendorId, item: value().controlValue() });
          this.itemForm().reset();
          this.model.set({ title: '', version: '' });
        },
      },
    },
  );
}
```

The template drives a `<select>` for vendor choice (updating `selectedVendorId`) and text inputs for title and version, with inline validation error messages. The submit button is disabled (`aria-disabled`) when the form is invalid or no vendor is selected.

---

## 6. Replacing Mocks with a Real API

A brand-new Node.js/Express back-end was added to the `api/` folder, using **better-sqlite3** for persistence.

**API surface:**
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/vendors` | List all vendors |
| POST   | `/api/vendors` | Create a vendor |
| GET    | `/api/vendors/:vendorId/items` | List items for a vendor |
| POST   | `/api/vendors/:vendorId/items` | Add an item to a vendor |
| GET    | `/api/catalog` | Full catalog view |

A `proxy.conf.json` was added to the Angular dev server so requests to `/api/*` are forwarded to the Express server running on port 3000 — no CORS issues in development.

The MSW mock handlers for vendor items were also completed with realistic scenarios (`typical`, `empty`, `overloaded`, `slow`, `unknown-vendor`, `server-error`) so you can test the UI in isolation even without the real API running.

---

## 7. AI as a Learning Tool

The instructor shared a document (`notes/ai-learning.md`) covering how to use AI coding assistants as *learning accelerators*, not just code generators. Key ideas:

- **Mental model verification:** "I think X works like Y — where does my model break down?" — let AI find the gaps.
- **Deliberate breaking:** Generate or write working code, then ask AI to show you every way it can fail.
- **Write it yourself first, then compare:** The comparison is more instructive than either approach alone.
- **AI as reviewer:** Write the code, ask AI to critique it — keeps you in the author role while getting senior-level feedback.

The central point: the value of writing code by hand is building the mental models and failure intuitions needed to *evaluate* AI-generated code. The two practices reinforce each other.

---

## Key Takeaways

- **`rxMethod` is the bridge between Signal Stores and RxJS.** Use `switchMap` for requests that should cancel on new input; use `mergeMap` for concurrent independent operations.
- **Auth is just state.** A discriminated union in a Signal Store + computed role signals + functional route guards is all you need for a complete auth/authz system.
- **Separate HTTP services from stores.** A dedicated `XyzApi` class injected into the store keeps each piece focused and independently testable.
- **Provide services at the route level** for stores and APIs that belong to a feature — they share the route's lifetime and are automatically destroyed on navigation.
- **MSW scenarios let you test every branch of the UI** (loading, empty, error, slow) without requiring the real API.
- **ESLint + Prettier are non-negotiable on a team.** Set them up once, configure your editor to run them on save, and stop arguing about formatting in code review.
- **The Angular Signals forms API** (`form()`, `required()`, `minLength()`) keeps your model and form in sync with a declarative, type-safe schema — no more `FormGroup` / `FormControl` boilerplate.

---

## What's Next

Now that you've seen the full picture, here are the best directions for continued learning:

1. **Complete the final lab.** The `notes/labs/lab-final.md` file has a guided project that ties all four days together. Do it while the material is fresh.

2. **Explore the other lab options.** `lab-books.md`, `lab-todo-mvc.md`, and `lab-text-analyzer.md` are progressively more challenging exercises that reinforce these same patterns in different domains.

3. **Wire up real authentication.** Today's `authStore` hard-codes a user on login. A natural next step is integrating a real identity provider (Auth0, Azure AD, Keycloak) using the `oidc-client-ts` library and replacing the `login` action with a real OIDC flow.

4. **Add optimistic updates.** The `addVendor` method currently waits for the server response before updating the store. Try updating the store *before* the response arrives (and rolling back on error) for a snappier UX.

5. **Error handling in `rxMethod` pipelines.** Explore `catchError` and `EMPTY` to gracefully recover from failed HTTP calls without crashing the store's observable stream.

6. **Testing Signal Stores.** Look into how to unit-test stores with `TestBed` — inject the store, call methods, and assert on `store.entities()` or other computed signals.

7. **Explore Angular's new resource API.** For read-only data fetching, `resource()` and `httpResource()` (introduced alongside Signals) offer a simpler alternative to `rxMethod` when you don't need the full RxJS pipeline.

---

*This summary was auto-generated from the day's commits and source code. If anything is unclear or you spot an error, open an issue or reach out to the instructor.*
