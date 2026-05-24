# msw-lens context
generated: 2026-05-16T11:36:50.641Z
entry: src/app/areas/resources/feature-home/pages/add.ts

---

## The ask

I'm working on the `Add` component in a web application and want to
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

### add.ts
`src/app/areas/resources/feature-home/pages/add.ts`
```typescript
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, required, validate } from '@angular/forms/signals';
import { PageHeader } from '../../../shared/ui-page-header/page-header';
import { resourcesStore } from '../../data/resources';

interface NewResourceModel {
  title: string;
  url: string;
  description: string;
  tags: string[];
}

const normalize = (t: string) =>
  t
    .trim()
    .toLocaleLowerCase()
    .replace(/[\s_-]+/g, '');

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1).fill(0).map((_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let curr = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const next = Math.min(curr + 1, prev[j] + 1, prev[j - 1] + cost);
      prev[j - 1] = curr;
      curr = next;
    }
    prev[b.length] = curr;
  }
  return prev[b.length];
}

@Component({
  selector: 'app-resources-add',
  imports: [PageHeader, FormField, FormRoot],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Add Resource" description="Share a resource with others" />

    <form class="flex flex-col gap-4 max-w-lg" [formRoot]="resourceForm">
      <div class="flex flex-col w-full">
        <label class="label" for="title">Title</label>
        <input
          class="input w-full"
          id="title"
          placeholder="Title"
          [formField]="resourceForm.title"
        />
        <div>
          @if (resourceForm.title().touched() && resourceForm.title().invalid()) {
            @for (error of resourceForm.title().errors(); track error.kind) {
              <span class="label text-error text-xs">{{ error.message }}</span>
            }
          }
        </div>
      </div>

      <div class="flex flex-col w-full">
        <label for="url">URL</label>

        <input
          class="input  w-full"
          id="url"
          type="url"
          placeholder="URL"
          [formField]="resourceForm.url"
        />

        <div>
          @if (resourceForm.url().touched() && resourceForm.url().invalid()) {
            @for (error of resourceForm.url().errors(); track error.kind) {
              <span class="label text-error text-xs">{{ error.message }}</span>
            }
          }
        </div>
      </div>

      <div class="flex flex-col w-full">
        <label for="description">Description</label>
        <textarea
          class="textarea  w-full"
          placeholder="Description"
          [formField]="resourceForm.description"
        ></textarea>
        <div>
          @if (resourceForm.description().touched() && resourceForm.description().invalid()) {
            @for (error of resourceForm.description().errors(); track error.kind) {
              <span class="label text-error text-xs">{{ error.message }}</span>
            }
          }
        </div>
      </div>

      <div class="flex flex-col w-full">
        <label for="tags-input">Tags</label>

        @if (model().tags.length) {
          <ul class="flex flex-wrap gap-2 mb-2">
            @for (tag of model().tags; track tag) {
              <li class="badge badge-primary gap-1">
                {{ tag }}
                <button
                  type="button"
                  class="cursor-pointer"
                  aria-label="Remove tag"
                  (click)="removeTag(tag)"
                >
                  &times;
                </button>
              </li>
            }
          </ul>
        }

        <input
          class="input w-full"
          id="tags-input"
          list="known-tags"
          placeholder="Type a tag, press Enter or comma"
          [value]="draft()"
          (input)="onDraftInput($event)"
          (keydown)="onDraftKey($event)"
          (blur)="commitDraft()"
        />
        <datalist id="known-tags">
          @for (tag of availableTags(); track tag) {
            <option [value]="tag"></option>
          }
        </datalist>

        @if (suggestion(); as s) {
          <div class="alert alert-warning mt-2 py-2 text-sm">
            <span>
              Similar tag already exists: <strong>{{ s.existing }}</strong
              >. Use it instead of <em>{{ s.draft }}</em
              >?
            </span>
            <div class="flex gap-2">
              <button type="button" class="btn btn-xs btn-primary" (click)="acceptSuggestion()">
                Use "{{ s.existing }}"
              </button>
              <button type="button" class="btn btn-xs btn-ghost" (click)="keepDraft()">
                Keep "{{ s.draft }}"
              </button>
            </div>
          </div>
        }
      </div>

      <button
        class="btn btn-primary self-start aria-disabled:opacity-50 aria-disabled:cursor-not-allowed"
        type="submit"
        [attr.aria-disabled]="resourceForm().invalid() || null"
      >
        Add Resource
      </button>
    </form>
  `,
  styles: ``,
})
export class AddPage {
  protected readonly store = inject(resourcesStore);

  readonly model = signal<NewResourceModel>({
    title: '',
    url: '',
    description: '',
    tags: [],
  });

  protected readonly draft = signal('');
  protected readonly suggestion = signal<{ draft: string; existing: string } | null>(null);

  protected readonly availableTags = computed(() => {
    const already = new Set(this.model().tags.map(normalize));
    return this.store.tags().filter((t) => !already.has(normalize(t)));
  });

  protected onDraftInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (value.includes(',')) {
      const parts = value.split(',');
      for (const part of parts.slice(0, -1)) this.tryAdd(part);
      this.draft.set(parts[parts.length - 1]);
    } else {
      this.draft.set(value);
    }
    this.suggestion.set(null);
  }

  protected onDraftKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.commitDraft();
    } else if (event.key === 'Backspace' && !this.draft() && this.model().tags.length) {
      const tags = this.model().tags;
      this.removeTag(tags[tags.length - 1]);
    }
  }

  protected commitDraft() {
    const value = this.draft();
    if (value.trim()) this.tryAdd(value);
  }

  private tryAdd(raw: string) {
    const value = raw.trim();
    if (!value) {
      this.draft.set('');
      return;
    }
    const norm = normalize(value);
    const existingChips = this.model().tags;
    if (existingChips.some((t) => normalize(t) === norm)) {
      this.draft.set('');
      return;
    }
    const candidates = [...this.store.tags(), ...existingChips];
    const near = candidates.find((t) => {
      const n = normalize(t);
      if (n === norm) return true;
      const minLen = Math.min(n.length, norm.length);
      if (minLen < 4) return false;
      return levenshtein(n, norm) <= 2;
    });
    if (near && normalize(near) !== norm) {
      this.suggestion.set({ draft: value, existing: near });
      return;
    }
    this.addTag(value);
  }

  private addTag(value: string) {
    this.model.update((m) => ({ ...m, tags: [...m.tags, value] }));
    this.draft.set('');
    this.suggestion.set(null);
  }

  protected removeTag(tag: string) {
    this.model.update((m) => ({ ...m, tags: m.tags.filter((t) => t !== tag) }));
  }

  protected acceptSuggestion() {
    const s = this.suggestion();
    if (!s) return;
    const existingChips = this.model().tags;
    if (!existingChips.some((t) => normalize(t) === normalize(s.existing))) {
      this.addTag(s.existing);
    } else {
      this.draft.set('');
      this.suggestion.set(null);
    }
  }

  protected keepDraft() {
    const s = this.suggestion();
    if (!s) return;
    this.addTag(s.draft);
  }

  readonly resourceForm = form(
    this.model,
    (s) => {
      validate(s.url, ({ value }) => {
        let url = value();
        if (!/^https?:\/\//.test(url)) {
          url = 'https://' + url;
        }
        try {
          new URL(url);
        } catch {
          return { kind: 'invalid', message: 'Please enter a valid URL' };
        }
        if (this.store.links().some((r) => r === url)) {
          return { kind: 'duplicate', message: 'This URL has already been submitted' };
        }
        return null;
      });
      required(s.title, { message: 'Title is required' });

      required(s.description, { message: 'Description is required' });
    },
    {
      submission: {
        action: async (value) => {
          const payload = value().controlValue();
          const result = await this.store.add(payload);
          if (result === 'ok') {
            this.resourceForm().reset();
          } else {
            alert('Failed to add resource: ' + result);
          }
        },
      },
    },
  );
}
```

### page-header.ts
`src/app/areas/shared/ui-page-header/page-header.ts`
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

### resources.ts
`src/app/areas/resources/data/resources.ts`
```typescript
import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods } from '@ngrx/signals';
import { addEntity, setEntities, withEntities } from '@ngrx/signals/entities';

export type Resource = {
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
};

export const resourcesStore = signalStore(
  withEntities<Resource>(),
  withMethods((store) => {
    return {
      _load: async () =>
        fetch('/api/resources')
          .then((res) => res.json())
          .then((resources) => patchState(store, setEntities(resources))),
      add: async (resource: Omit<Resource, 'id'>) => {
        try {
          const res = await fetch('/api/resources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resource),
          });
          const newResource = await res.json();
          patchState(store, addEntity(newResource));
          return 'ok';
        } catch (error) {
          return Promise.reject(error instanceof Error ? error.message : 'Unknown error');
        }
      },
    };
  }),
  withComputed((store) => ({
    links: computed(() => store.entities().map((r) => r.url.toLocaleLowerCase())),
    tags: computed(() => {
      const seen = new Map<string, string>();
      for (const r of store.entities()) {
        for (const t of r.tags) {
          const key = t.trim().toLocaleLowerCase();
          if (key && !seen.has(key)) seen.set(key, t.trim());
        }
      }
      return [...seen.values()].sort((a, b) => a.localeCompare(b));
    }),
  })),
  withHooks({
    onInit(store) {
      store._load();
    },
  }),
);
```

---

## Handler registration

### handlers.ts
`src/mocks/handlers.ts`
```typescript
import { HttpHandler } from 'msw';

import resourcesHandler from './resources/resources';
import bypassed from './bypassed-endpoints';

const all: HttpHandler[] = [...resourcesHandler];

export const handlers: HttpHandler[] = all.filter((h) => {
  const { method, path } = h.info;
  if (typeof method !== 'string' || typeof path !== 'string') return true;
  return !bypassed.has(`${method} ${path}`);
});
```

---

## Existing manifests + handlers (pattern reference)

### resources.yaml
`src/mocks/resources/resources.yaml`
```yaml
endpoint: /api/resources
method: GET
shape: collection
description: Returns the list of developer resources displayed on the Overview page

responseType:
  name: Resource
  path: src/app/areas/resources/data/resources.ts

context:
  sourceHints:
    - src/app/areas/resources/data/resources.ts
    - src/app/areas/resources/ui/list.ts
    - src/app/areas/resources/feature-home/pages/overview.ts
  hints:
    - "The List component has no @empty block — an empty array renders a bare <ul> with no user-visible message"
    - "tags.join(', ') is called directly in the template — a resource with an empty tags array renders 'Tags: ' with no value"

scenarios:
  typical:
    description: Shows several developer resources with titles, descriptions, URLs, and tags — the normal production-like view
    active: true
  empty:
    description: Tests the zero-items state — currently renders a bare <ul> with no empty-state message; useful for verifying whether one should be added
  overloaded:
    description: Tests rendering with 60 resources to expose layout overflow, scroll behaviour, or the absence of pagination
  slow:
    description: Tests the loading/skeleton state while the request is in flight; verifies no flash of empty content
    delay: real
  unauthorized:
    description: Tests 401 response — verifies session-expiry handling (redirect to login or inline error) from the store or a route guard
    httpStatus: 401
  server-error:
    description: Tests 500 response — verifies error boundary, fallback UI, or user-visible error message when the API is down
    httpStatus: 500
```

### resources.ts
`src/mocks/resources/resources.ts`
```typescript
import { http, HttpHandler, HttpResponse, delay } from 'msw';
import activeScenarios from '../active-scenarios';

const ENDPOINT = '/api/resources';

const typicalResources = [
  {
    id: '1',
    title: 'Angular Documentation',
    description:
      'Official Angular framework documentation covering components, directives, services, and more.',
    url: 'https://angular.dev',
    tags: ['angular', 'documentation', 'framework'],
  },
  {
    id: '2',
    title: 'NgRx Signal Store',
    description:
      'State management library for Angular using signals — composable, typed, and zero-boilerplate.',
    url: 'https://ngrx.io/guide/signals',
    tags: ['ngrx', 'signals', 'state-management'],
  },
  {
    id: '3',
    title: 'RxJS',
    description:
      'Reactive extensions for JavaScript — composable async code using observables and operators.',
    url: 'https://rxjs.dev',
    tags: ['rxjs', 'reactive', 'observables'],
  },
  {
    id: '4',
    title: 'TypeScript Handbook',
    description: 'The official TypeScript language handbook with examples and deep-dives.',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    tags: ['typescript', 'documentation'],
  },
  {
    id: '5',
    title: 'MSW — Mock Service Worker',
    description:
      'API mocking library that intercepts requests at the network level using a Service Worker.',
    url: 'https://mswjs.io',
    tags: ['msw', 'testing', 'mocking'],
  },
];

const overloadedResources = Array.from({ length: 60 }, (_, i) => ({
  id: String(i + 1),
  title: `Developer Resource ${i + 1}`,
  description: `Description for developer resource number ${i + 1}. Useful for exploring edge cases around long lists.`,
  url: `https://example.com/resource-${i + 1}`,
  tags: ['tag-a', 'tag-b'],
}));

export default [
  http.get(ENDPOINT, async () => {
    const scenario = activeScenarios[`GET ${ENDPOINT}`] ?? 'typical';

    switch (scenario) {
      case 'empty':
        return HttpResponse.json([]);

      case 'overloaded':
        return HttpResponse.json(overloadedResources);

      case 'slow':
        await delay('real');
        return HttpResponse.json(typicalResources);

      case 'unauthorized':
        return HttpResponse.json(
          { type: 'about:blank', title: 'Unauthorized', status: 401 },
          { status: 401 },
        );

      case 'server-error':
        return new HttpResponse(null, { status: 500 });

      case 'typical':
      default:
        return HttpResponse.json(typicalResources);
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
