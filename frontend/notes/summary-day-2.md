# Day 2 Summary — Applied Angular (May 19, 2026)

Day 2 went deeper into Angular's reactive model, exploring the full signal toolkit — `effect`, `linkedSignal`, and `untracked` — while building real, non-trivial features. The morning kicked off with a Pomodoro Timer lab (the students' first full-area build from scratch), then Jeff walked through a series of targeted demos covering component lifecycle, `linkedSignal`, custom Signal Store features, and Angular's change detection strategy. The afternoon closed with a look at route preloading, `withComponentInputBinding`, and `ChangeDetectionStrategy.OnPush` applied to a working counter.

---

## 1. Lab: Pomodoro Timer (Your First Full Area)

The first lab of the class asked you to build a **Pomodoro Timer** feature area from scratch — following the same conventions established on Day 1.

The complete instructor solution lives in `src/app/areas/jeff-pomodoro/`. Reference it if you got stuck.

### What was built

- **`data/store.ts`** — a `signalStore` holding `workMinutes` and `breakMinutes`, persisted to `localStorage` via an `effect` inside `withHooks`.
- **`feature-home/pages/prefs.ts`** — a settings page with range sliders wired directly to the store.
- **`feature-home/pages/timer.ts`** — the actual countdown timer using `signal`, `computed`, `effect`, and `DestroyRef`.

### Key patterns

**Persisting with `effect` (instead of `watchState`):**
```typescript
withHooks({
  onInit(store) {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) patchState(store, JSON.parse(saved));

    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        workMinutes: store.workMinutes(),
        breakMinutes: store.breakMinutes(),
      }));
    });
  },
})
```
`effect` is another way to react to signal changes — useful when you need a side effect that isn't easily expressed with `watchState`.

**Using `untracked` to break accidental dependencies:**
```typescript
effect(() => {
  const dur = this.sessionDuration();
  // We only want to reset when sessionDuration changes — not when isRunning toggles.
  if (!untracked(this.isRunning)) this.secondsRemaining.set(dur);
});
```
`untracked()` lets you *read* a signal inside an `effect` without making that effect depend on it. This is important when you want some reads to be "passive".

**Cleanup with `DestroyRef`:**
```typescript
private destroyRef = inject(DestroyRef);

constructor() {
  this.destroyRef.onDestroy(() => {
    if (this.intervalId !== null) clearInterval(this.intervalId);
  });
}
```
`DestroyRef` is the modern way to register cleanup logic — no need to implement `OnDestroy`.

**Auto-flipping mode with `effect`:**
```typescript
effect(() => {
  if (this.secondsRemaining() === 0 && this.isRunning()) {
    this.pause();
    this.mode.update((m) => (m === 'work' ? 'break' : 'work'));
  }
});
```
Effects replace `ngOnInit` subscriptions and lifecycle hooks for reactive wiring.

---

## 2. Demo: `linkedSignal`

Jeff showed the **Linked Signals** demo (`src/app/areas/demos/feature-demos/pages/ls.ts`) — a product selector with a quantity input and a live price summary.

### The problem it solves

When you select a different product, the quantity (`qty`) should reset to 1. But `qty` also needs to be writable (the user types into it). A regular `computed` is read-only. A regular `signal` won't automatically reset when `selected` changes.

**`linkedSignal` is a signal that can be written to, but also resets itself when its source changes:**
```typescript
qty = linkedSignal({
  source: this.selected,
  computation: () => 1,  // reset to 1 whenever `selected` changes
});
```

The demo started with a plain `signal(1)` (commented out as a before state), then evolved to `linkedSignal` — a great way to see exactly why the primitive exists.

---

## 3. Demo: Component Lifecycle and `effect` Cleanup

The **LifeCycle** demo (`pages/pib.ts` and `pages/life-child.ts`) explored how Angular creates and destroys child components as route params change.

```typescript
export class LifechildPage implements OnDestroy {
  id = input.required<string>();

  constructor() {
    effect((onCleanup) => {
      console.log(`The id changed! ${this.id()}`);
      onCleanup(() =>
        console.log('This will run when the injection context is destroyed.')
      );
    });
  }

  ngOnDestroy(): void {
    console.log('Goodbye, cruel world!');
  }
}
```

Key points:
- An `effect` can accept an `onCleanup` callback — runs when the effect re-runs *or* when the component is destroyed.
- `OnDestroy` still works, but `onCleanup` inside `effect` is the signal-native equivalent.
- Jeff noted: **`effect` largely replaces `OnInit`** for reactive wiring, and `onCleanup` largely replaces `OnDestroy`.

---

## 4. Demo: Custom Signal Store Feature (`withLogging`)

Jeff built a reusable `signalStoreFeature` that logs every state change to the console.

```typescript
// src/app/areas/shared/util-logging/store-logging-feature.ts
export function withLogging(name: string) {
  return signalStoreFeature(
    withHooks({
      onInit(store) {
        watchState(store, (state) => {
          console.log(`Store [${name}] → ${JSON.stringify(state)}`);
        });
      },
    }),
  );
}
```

Apply it to any store:
```typescript
export const signalCounterStore = signalStore(
  withState({ current: 0, _secret: 'Nobody knows' }),
  withLogging('counter'),
  withMethods((store) => ({
    increment: () => patchState(store, { current: store.current() + 1 }),
    decrement: () => patchState(store, { current: store.current() - 1 }),
  })),
);
```

This is the **composability superpower** of NgRx Signal Store — cross-cutting concerns (logging, undo, persistence) become reusable features you mix in with one line.

Also shown: **scoped providers** — placing `providers: [signalCounterStore]` directly in the component decorator limits the store's lifetime to that component tree:
```typescript
@Component({
  providers: [signalCounterStore],   // store is created and destroyed with this component
  ...
})
export class CounterPage { ... }
```

---

## 5. Demo: `@defer` — Deferred Loading in Templates

The counter overview page demonstrated Angular's **`@defer` block**:

```html
@defer (on timer(3000ms)) {
  <app-counter-fizzbuzz />
} @placeholder {
  <p>Chart is coming soon!</p>
} @loading {
  <p>Loading your stuff</p>
}
```

- `@defer` lazily renders (and lazily loads the JS for) a component.
- `on timer(3000ms)` triggers loading after 3 seconds.
- `@placeholder` shows while deferred content hasn't started loading.
- `@loading` shows while it is loading.
- Other triggers: `on idle`, `on viewport`, `on interaction`, `on hover`, `when <expression>`.

---

## 6. Change Detection and `ChangeDetectionStrategy.OnPush`

A whiteboard session (`notes/change-detection.excalidraw`) explained how Angular decides when to re-render components:

- **Default strategy**: Angular re-checks a component on *any* async event (click, timer, HTTP response) — safe but can be slow for large trees.
- **OnPush strategy**: Angular only re-checks when an `@Input` reference changes, an event originates from within the component, or a signal it reads changes.

Signals make **OnPush** the obvious default for new components — signals notify Angular precisely when they change, so there's no need for broad re-checking.

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  ...
})
```

Both `TimerPage` and `FizzBuzz` were marked `OnPush`. You should make this your habit for all new components.

---

## 7. Router Configuration: Preloading and Input Binding

`app.config.ts` was updated with two important router options:

```typescript
provideRouter(
  routes,
  withExperimentalAutoCleanupInjectors(),
  withComponentInputBinding(),       // <-- new
  withPreloading(PreloadAllModules), // <-- new
)
```

- **`withComponentInputBinding()`** — route params (`:id`) are automatically bound to component `input()` signals with the same name. No need to inject `ActivatedRoute`.
- **`withPreloading(PreloadAllModules)`** — after the initial load, Angular silently preloads all lazy-loaded route chunks in the background. First navigation feels instant; subsequent navigations to lazy routes are already cached.

---

## Key Takeaways

- **`effect`** is the signal-native replacement for `ngOnInit` subscriptions. It runs in injection context (constructors and `withHooks`) and can register cleanup with `onCleanup`.
- **`untracked`** lets you read a signal "passively" inside an effect without creating a dependency on it.
- **`DestroyRef.onDestroy`** is the modern cleanup hook — no need to implement `OnDestroy`.
- **`linkedSignal`** solves the "reset on source change, but still writable" problem that neither `signal` nor `computed` alone handles.
- **`signalStoreFeature`** lets you package cross-cutting store behavior (logging, persistence, undo) into composable, reusable pieces.
- **Scoped providers** (`providers: [MyStore]` in a component) give a store a lifetime tied to that component — not the whole app.
- **`@defer`** makes lazy-loading a template-level concern: load, placeholder, loading states — no code splitting configuration needed.
- **`ChangeDetectionStrategy.OnPush` + signals** is the recommended combination for all new components. OnPush is safe because signals notify Angular precisely.
- **`withComponentInputBinding()`** eliminates `ActivatedRoute` injection for route params.
- **`withPreloading(PreloadAllModules)`** makes lazy-loaded routes feel eager after startup.

---

## What's Next — Day 3

Day 3 will likely build on today's foundations:

- **HTTP and the API layer** — the Excalidraw diagram (`notes/api.excalidraw`) hints at a deeper look at REST APIs, `httpResource`, mutation (POST/PUT/DELETE), and optimistic updates.
- **More Signal Store patterns** — custom features, entity management, and connecting stores to HTTP.
- **Forms** — `provideSignalFormsConfig` was added to `app.config.ts` today, setting the stage for Angular's new signal-based forms API.
- **More complex component hierarchies** — building on the lifecycle and input-binding demos from today.
- **Lab continuation** — you'll likely extend the Pomodoro Timer or start a new feature area that ties together routing, HTTP, and state management.

---

*Notes and all code are in the repo. The instructor's Pomodoro solution is at `frontend/src/app/areas/jeff-pomodoro/`. The Demos area (`frontend/src/app/areas/demos/`) contains every walkthrough from today's live coding sessions.*
