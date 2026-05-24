# Day 3 Summary - Applied Angular (May 20, 2026)

## Theme: Building a Real Feature End-to-End

Day 3 shifted gears from isolated demos to building a complete, production-shaped feature: the **Software Center**. The goal was to wire together everything covered so far -- routing, signals, state management, forms, and HTTP -- into a real application area with multiple screens, real API interactions (via Mock Service Worker), and thoughtful UI. The day also introduced two new tools: `httpResource` for signal-based data fetching and **Stellar DevTools** for inspecting NgRx Signal Store state in the browser.

---

## 1. Service Scope and Lifetime Review (Morning Warm-Up)

Before diving into the new feature, the instructor reviewed how Angular resolves services and what "scope" and "lifetime" mean in practice. Key points illustrated with the `CounterStore` demo:

- The classic `@Injectable({ providedIn: 'root' })` pattern makes a service a **singleton** for the entire app lifetime.
  > Note by Jeff: This is not a singleton as soon as you provide the service anywhere else. Be careful.
- Services do not need the decorator -- they can be provided directly in `providers` arrays at the component, route, or application level, giving you precise control over when the store is created and destroyed.
- `HttpClient` can be injected into both class-based services and Signal Stores via the constructor or `inject()`.
  - Prefer the `inject()` method - Constructor injection is deprecated.

---

## 2. The Software Center Feature -- Domain Design

The class reviewed the [Software Center requirements](./software-center.md) together before writing any code. This "design sprint" exercise demonstrated how to break a domain into Angular's recommended folder structure:

```
areas/catalog/
  data-catalog/      <- types, stores, API calls (shared state)
  feature-catalog/   <- employee-facing catalog browsing
  feature-admin/     <- manager/staff admin area
  ui-vendors/        <- reusable vendor UI components
```

**Why it matters:** Separating `data-*`, `feature-*`, and `ui-*` folders keeps responsibilities clear. Data layers are reusable across features; UI components are presentational and composable; feature shells own routing and page-level wiring.

---

## 3. Lazy-Loaded Feature Areas and Nested Routing

Two new top-level lazy routes were added to `app.routes.ts`:

```ts
{
  path: 'catalog',
  loadChildren: () =>
    import('./areas/catalog/feature-catalog/catalog.routes').then(c => c.CatalogRoutes),
},
{
  path: 'admin',
  loadChildren: () =>
    import('./areas/catalog/feature-admin/admin.routes').then(a => a.softwareAdminRoutes),
},
```

The **Admin** area uses child routes to provide sub-navigation with three pages: Overview, Vendors, and Items. Each feature shell component renders a `<router-outlet />` for its children and an `<app-area-nav />` component that automatically builds navigation links from the route `data` metadata.

**Key pattern:** The wildcard redirect now points to `catalog` instead of `home`, making the new feature the application's default landing area.

---

## 4. httpResource -- Signal-Based Data Fetching (Read-Only)

The employee-facing Catalog Overview page introduced Angular's new `httpResource` API:

```ts
catalogResource = httpResource<CatalogListItems>(() => '/api/catalog', {
  parse: CatalogListItemsSchema.parse,
});
```

- **Reactive by design:** The URL factory is a signal expression -- if you pass a signal-derived URL, the resource automatically re-fetches when it changes.
- **Zod parsing built in:** The `parse` option lets you validate and transform the response at the boundary, so the rest of your component works with fully-typed, trusted data.
- **Built-in async states:** `catalogResource.isLoading()`, `catalogResource.hasValue()`, and `catalogResource.error()` are all signals, making loading and error UI trivial with `@if`.

The page also demonstrated **client-side sorting** using a `signal<Sortkeys>` and a `computed()` that derives a sorted copy via `Array.prototype.toSorted()`:

```ts
sortingBy = signal<Sortkeys>('title');
catalogSorted = computed(
  () =>
    this.catalogResource
      .value()
      ?.toSorted((a, b) => a[this.sortingBy()].localeCompare(b[this.sortingBy()])) ?? [],
);
```

> **Note:** `httpResource` is ideal for read-only data. For mutations (POST/PUT/DELETE), use `fetch()` directly or `HttpClient`.

---

## 5. NgRx Signal Store with withEntities -- The Vendors Store

The Admin Vendors page needed a list of vendors that could also be mutated (adding new ones). This was built as an NgRx Signal Store using `withEntities`:

```ts
export const vendorsStore = signalStore(
  withEntities<VendorEntity>(),
  withMethods((store) => ({
    _load: async () => {
      const vendors = await fetch('/api/vendors').then((v) => v.json());
      patchState(store, setEntities(vendors));
    },
    add: async (item: VendorCreate) => {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const newVendor = await response.json();
      patchState(store, addEntity(newVendor));
    },
  })),
  withHooks({
    onInit(store) {
      store._load();
    },
  }),
);
```

**Why this pattern:**

- `withEntities` gives you a normalized entity map with helper updaters like `setEntities` and `addEntity` -- no manual array management.
- `withHooks` `onInit` auto-loads data when the store is first injected, so components do not need to trigger the fetch manually.
- The `add` method uses raw `fetch()` (rather than `HttpClient`) to demonstrate that Angular's HTTP layer is not the only option -- especially convenient inside stores.

---

## 6. Signal Forms -- Vendor Add Form

The `VendorAdd` component showcased the new `@angular/forms/signals` API, a fully signal-based, type-safe alternative to Reactive Forms:

```ts
vendorForm = form(
  this.model,
  (schema) => {
    required(schema.name, { message: 'Name is required' });
    minLength(schema.name, 10);
    maxLength(schema.name, 100);
    required(schema.url);
    required(schema.pointOfContact.name);

    validate(schema.pointOfContact, ({ value }) => {
      if (value().email.trim() === '' && value().phone.trim() === '') {
        return { kind: 'required', message: 'You must provide either a phone or an email address' };
      }
      return undefined;
    });
  },
  {
    submission: {
      action: async (value) => {
        await this.store.add(value().controlValue());
        this.vendorForm().reset();
        // reset model signal back to empty state
      },
    },
  },
);
```

**Key patterns:**

- `form()` takes a signal as its model -- the form and the signal stay in sync automatically.
- Validators are applied as plain function calls in the schema callback, not as decorators.
- Cross-field validation (e.g., "must have email OR phone") is expressed with `validate()` on a parent schema node.
- The `submission.action` async handler integrates form submission directly with the store and resets everything on success.
- In templates, `[formRoot]` and `[formField]` directives wire the HTML inputs to the signal form.

A custom `validateUrl` helper was extracted into `types.ts` to show how to create reusable, composable validators:

```ts
export function validateUrl(path: SchemaPath<string>, options?: { message: string }) {
  return validate(path, ({ value }) => {
    try {
      new URL(value());
      return null;
    } catch {
      return { kind: 'url', message: options?.message || 'Enter a valid URL' };
    }
  });
}
```

---

## 7. Stellar DevTools -- Inspecting Signal Store State

At the end of the day, the class integrated **Stellar DevTools** (`@hypertheory-labs/stellar-ng-devtools`), a dev-time tool for visualizing NgRx Signal Store state in the browser:

```ts
// app.config.ts
provideStellar(withHttpTrafficMonitoring(), withStellarBridge()),

// inside any signal store definition
withStellarDevtools('VendorsStore', {
  description: 'This store manages the vendors for our software center',
  sourceHint: 'src/app/areas/catalog/data-catalog/vendors-store.ts',
}),
```

The `sanitizeConfig` helper was also demonstrated -- it lets you mask sensitive fields so they never appear in the DevTools panel:

```ts
const config = sanitizeConfig<CounterState>({ _secret: 'masked' });
// pass as: withStellarDevtools('Demo-Counter', { sanitize: config })
```

This matters in real apps where stores might hold tokens, SSNs, or other PII. DevTools should be useful without being a security risk.

---

## Key Takeaways

- **Feature area structure** (`data-*` / `feature-*` / `ui-*`) keeps codebases scalable and navigable as they grow -- adopt this naming convention early.
- **`httpResource`** is the idiomatic Angular 19+ way to do signal-based read-only fetching; use the `parse` option with Zod to validate API responses at the boundary.
- **NgRx Signal Store + `withEntities`** is the right tool when you need a normalized, mutable collection that multiple parts of the UI share.
- **Signal Forms** replace Reactive Forms with a fully typed, signal-native API -- validators are plain functions, cross-field validation is straightforward, and all form state is signals.
- **Different HTTP tools for different jobs**: `httpResource` for reads, raw `fetch()` or `HttpClient` for mutations -- you do not have to pick one approach for the whole app.
- **Stellar DevTools** makes store state visible during development; use `sanitizeConfig` to keep sensitive fields out of tooling.

---

## What's Next (Day 4 Preview)

Day 4 will likely build on today's foundation by:

- **Completing the vendor workflow** -- adding URL validation via the custom `validateUrl` helper, and handling error responses from the POST endpoint gracefully.
- **Catalog item management** -- adding software items to vendors, which requires reading the vendors list and associating a new item with an existing vendor; a good exercise in composing multiple stores.
- **HttpClient with Observables** -- the day 3 outline listed this as a planned topic not fully covered; expect a deeper look at Observable-based HTTP and when it has advantages over `fetch()` or `httpResource`.
- **Role-based UI** -- the Software Center requirements define `SoftwareCenter` and `SoftwareCenterManager` roles; showing or hiding features based on the logged-in user's role is a natural next step.
- **Error handling patterns** -- the MSW Lens scenarios created today (slow response, server error) set up the perfect sandbox for exploring error boundaries and retry logic in Angular.
