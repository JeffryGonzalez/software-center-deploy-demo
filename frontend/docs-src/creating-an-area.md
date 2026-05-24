# Creating an area

An "area" is a self-contained, lazy-loaded slice of the app. Each area has a shell component, a set of routes, and one or more pages. Adding one is mechanical — most of it expands from VS Code snippets.

## Folder layout

```
src/app/areas/<domain>/
  feature-<domain>/
    <domain>.ts            # the area shell
    <domain>.routes.ts     # the area's routes
    pages/
      overview.ts          # the area's index page
      ...
```

## Steps

### 1. Create the folder and files

Create `src/app/areas/billing/feature-billing/`. Inside it:

- `billing.ts` — use the `ngas` snippet.
- `billing.routes.ts` — use the `nga` snippet.
- `pages/overview.ts` — use the `ngap` snippet.

### 2. Register the lazy route and sidebar entry

In `src/app/app.routes.ts`, add an entry to the `routes` array:

```typescript
{
  path: 'billing',
  data: { nav: { label: 'Billing', icon: 'solarChartSquare' } },
  loadChildren: () =>
    import('./areas/billing/feature-billing/billing.routes')
      .then((m) => m.billingRoutes),
}
```

Two things happen here at the same time:

- `loadChildren` makes the area lazy-loaded. The area's chunk only downloads when the user navigates to `/billing`.
- `data.nav` makes it appear in the main sidebar. The sidebar reads top-level routes that have a `nav` entry and renders one icon-link per matching route.

The `icon` field is typed against `IconName` from `src/app/areas/shared/util-icons/icons.ts`, so if you pick a name that isn't in the registry the compiler will flag it before you run the app.

### 3. Register the icon (if it's new)

If the icon name you want isn't already in the registry, open `src/app/areas/shared/util-icons/icons.ts`, import it from `@ng-icons/solar-icons/outline`, and add it to the `icons` const:

```typescript
import {
  solarBook,
  // ... existing imports
  solarChartSquare, // new
} from '@ng-icons/solar-icons/outline';

export const icons = {
  solarBook,
  // ... existing entries
  solarChartSquare, // new
} as const;
```

That single registry feeds both `provideIcons(icons)` in `app.config.ts` and the `IconName` type used by the route data.

## What the snippets give you

The `ngas` snippet produces an area shell with three things wired up:

- The area title and description.
- `<app-area-nav>`, which reads child route `data.nav` entries and renders DaisyUI tabs.
- A bordered content panel containing `<router-outlet />`.

The `nga` snippet produces a routes file with `data: { area: { label } }` on the shell route and `data: { nav: { label } }` on the first page route, so the area tabs render correctly out of the box.

## The two-level nav pattern

The sidebar and the area tabs use the *same* opt-in pattern at two different levels:

- **Sidebar** reads `data.nav` from the top-level routes in `app.routes.ts`. Those routes are statically defined, so the sidebar can render at startup before any area has been lazy-loaded.
- **Area tabs** read `data.nav` from the *child* routes inside each area's `<area>.routes.ts`. Those are only available once the area itself has been loaded — which is fine, because the tabs only render once the area's shell has rendered.

Putting top-level nav metadata in `app.routes.ts` (instead of co-locating it inside the area's routes file) is what keeps lazy loading honest: opening DevTools' Network tab and watching the area chunk arrive on first visit still works.
