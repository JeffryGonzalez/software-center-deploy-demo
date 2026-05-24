# Day 1 Summary — Applied Angular (May 18, 2026)

Welcome to Applied Angular! Day 1 was all about **orientation and foundations** — getting comfortable with the project structure, understanding the instructor's opinionated approach to building Angular applications, and writing our first real components. By end of day we had built a working counter application complete with a signal-based store and state that persists across page reloads.

---

## 1. Project Structure and the Opinionated Approach

Before writing any code, Jeff walked through *why* the project is structured the way it is:

- **Areas over a monolithic app.** The app is broken into feature areas (e.g., `home`, `resources`, `counter`). Each area is an independently deployable unit and a natural team boundary — this is how you avoid merge conflicts on large teams.
- **Keep `app/` tiny.** Routing, top-level config, and shared pieces only.
- **No role-suffixes in filenames.** Angular convention names files like `app.component.ts`, but Jeff drops the `.component` — it's just `app.ts`. Inside the file, the class name makes the role obvious.
- **Inline templates and styles.** Fewer files per component, easier to scan.

### Folder layout for an area

```
areas/
  <area-name>/
    data-<area>/       <- services, stores, types (no UI)
    feature-<area>/    <- routable pages / shell
      pages/           <- page-level components
    ui-<area>/         <- presentational / reusable components
```

---

## 2. Components and Inputs — The New Control Flow Syntax

The first hands-on exercise introduced Angular's **modern template control flow** (`@for`, `@if`) and the **`input()` signal API**.

We created a **News** page for the Home area that displays a list of news items.

**`data/types.ts`** — a TypeScript type for the data shape:
```typescript
export type NewsItem = {
  id: string;
  title: string;
  body: string;
  published: string;
};
```

**`ui/news-list.ts`** — a presentational component with a required input:
```typescript
export class NewsList {
  news = input.required<NewsItem[]>();
}
```
```html
@for (item of news(); track item.id) {
  <div>
    <p>{{ item.title }}</p>
    <p>{{ item.body }}</p>
    <p>{{ item.published | date }}</p>
  </div>
}
```

Key patterns:
- `input()` and `input.required<T>()` replace the `@Input()` decorator. They return **signals**, so you read them by calling them: `news()`.
- `@for` replaces `*ngFor`. The `track` clause is **required** — use a unique identifier so Angular can efficiently update the DOM.
- `@if` replaces `*ngIf`.
- `DatePipe` is imported directly in the component `imports` array — no NgModule needed.

---

## 3. httpResource — Declarative HTTP Fetching

After testing the UI with hardcoded data, we wired the News page to a real (mocked) API using Angular's **`httpResource`**:

```typescript
export class NewsPage {
  newsResource = httpResource<NewsItem[]>(() => 'https://news.hypertheory.com/angular');
}
```
```html
@if (newsResource.hasValue()) {
  <app-home-news-list [news]="newsResource.value()" />
}
```

Why this matters:
- `httpResource` is a signal-based alternative to `HttpClient`. It returns reactive signals: `.value()`, `.isLoading()`, `.hasValue()`, and more.
- No `subscribe()`, no manual cleanup — the resource manages its own lifecycle.
- The `@if (newsResource.hasValue())` guard prevents rendering before data arrives.

---

## 4. Mock Service Worker and msw-lens

We explored how the project uses **MSW (Mock Service Worker)** to intercept HTTP calls in the browser — no real backend required during development.

The **msw-lens** tool generates an AI-friendly context file describing every mocked endpoint and its test scenarios. Active scenarios are switched in `src/mocks/active-scenarios.ts`, enabling instant testing of loading states, empty states, 401/500 errors, and edge cases.

During class, Jeff used the msw-lens prompt system to generate a complete set of mock scenarios for the News endpoint from the component source code alone — a great example of AI tooling accelerating the repetitive parts of development.

---

## 5. Signals and the NgRx Signal Store

The afternoon focused on **signals** for state management, culminating in a complete Counter feature area.

### Signals recap
- `signal(initialValue)` — creates a reactive value.
- `.set(newValue)` — replaces the value; `.update(fn)` — derives new value from old.
- `computed(() => ...)` — derived signal that auto-updates when dependencies change.

### The NgRx Signal Store

Rather than scattering signals across components, we centralized state in a `signalStore`:

```typescript
export const counterStore = signalStore(
  withState<CounterState>({ by: 1, current: 0 }),
  withMethods((store) => ({
    setBy: (value: ByValues) => patchState(store, { by: value }),
    increment: () => patchState(store, { current: store.current() + store.by() }),
    decrement: () => patchState(store, { current: store.current() - store.by() }),
    reset: () => patchState(store, { current: 0 }),
  })),
  withComputed((store) => ({
    resetDisabled: computed(() => store.current() === 0),
  })),
  withHooks({
    onInit(store) {
      const saved = localStorage.getItem('counter-data');
      if (saved) patchState(store, JSON.parse(saved));
      watchState(store, (state) => {
        localStorage.setItem('counter-data', JSON.stringify(state));
      });
    },
  }),
);
```

Inject the store into any component with `inject()`:

```typescript
export class OverviewPage {
  store = inject(counterStore);
}
```

```html
<button (click)="store.decrement()">-</button>
<span>{{ store.current() }}</span>
<button (click)="store.increment()">+</button>
<button [disabled]="store.resetDisabled()" (click)="store.reset()">Reset</button>
```

The **PrefsPage** injected the same store to let users pick the increment step (1, 3, or 5). Changes in Prefs are instantly reflected on the Counter page — zero event-passing boilerplate.

### FizzBuzz component

We built a `FizzBuzz` UI component that reads the counter from the store and uses `@switch` to show a contextual alert:

```typescript
fizzBuzz = computed(() => {
  const current = this.store.current();
  if (current % 3 === 0 && current % 5 === 0) return 'FizzBuzz';
  if (current % 3 === 0) return 'Fizz';
  if (current % 5 === 0) return 'Buzz';
  return undefined;
});
```

No `@Input()`, no events, no subscriptions — just inject the store and derive what you need.

---

## Key Takeaways

- **Area-based architecture** keeps features isolated, independently deployable, and merge-conflict-free.
- **`input()` signals** replace `@Input()` decorators — reactive and type-safe.
- **Modern control flow** (`@for`, `@if`, `@switch`) replaces structural directives; `@for` requires `track`.
- **`httpResource`** gives declarative, signal-based HTTP fetching with built-in loading/error state.
- **MSW + msw-lens** lets you develop and test entirely offline with rich, switchable scenario coverage.
- **NgRx Signal Store** is the recommended way to share state across components within an area.
- **`withHooks` + `watchState`** makes persisting state to `localStorage` trivial.
- **`inject()`** replaces constructor injection — simpler and usable in class fields.

---

## What's Next (Day 2)

- **Lecture:** Deeper dive into state management in a signals/zoneless Angular world.
- **Lab 1:** Hands-on practice with signals — you will apply today's patterns yourself.
- More NgRx Signal Store features and continued `httpResource` work.

> **Before class:** Make sure your GitHub account is connected (`gh auth login`) and Classroom Sync is working.
