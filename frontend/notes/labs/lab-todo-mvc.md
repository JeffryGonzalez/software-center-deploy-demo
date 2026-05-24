# Todo MVC Lab

[TodoMVC](https://todomvc.com) is the "hello world" of UI frameworks — a small app that turns out to have just enough state to flush out the interesting questions. We'll build it using the NgRx **Signal Store**, and we'll lean hard on `withEntities` and the entity helpers (`addEntity`, `updateEntity`, `removeEntity`, `updateAllEntities`, `removeEntities`).

What you'll practice:

- Modeling a collection with `withEntities<T>()` instead of a hand-rolled array
- Mutating the collection with the entity helpers — never `patchState` on a raw array
- Deriving the UI (counts, filtered lists, "all complete?") from `withComputed`
- Providing a signal store on a **route**, not via `providedIn: 'root'`
- Keeping components dumb — they read signals and call store methods, that's it

No persistence in this lab. Reload = empty list. We'll keep the surface small so the entity API is the thing you're looking at.

---

## Sprint 1 — Feature Scaffold

Features in this repo are created by hand. Use `src/app/areas/resources/` as a working reference — same shape, same conventions.

Create:

```
src/app/areas/todos/
├── data/
│   ├── store.ts        # signal store (withEntities)
│   └── types.ts        # Todo type
└── feature-home/
    ├── todos.routes.ts
    ├── home.ts         # shell
    └── pages/
        └── list.ts     # the whole TodoMVC UI lives here for now
```

### `types.ts`

```typescript
export type Todo = {
  id: string;
  title: string;
  completed: boolean;
};
```

### `home.ts` (shell)

Copy `src/app/areas/resources/feature-home/home.ts` and adjust the title. The shell is just a header + `<app-area-nav />` + `<router-outlet />`.

### `todos.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { Home } from './home';

export const todosRoutes: Routes = [
  {
    path: '',
    component: Home,
    data: { area: { label: 'Todos' } },
    children: [
      // list page goes here
    ],
  },
];
```

### Wire into `app.routes.ts`

```typescript
{
  path: 'todos',
  data: { nav: { label: 'Todos', icon: 'solarClipboardList' } },
  loadChildren: () =>
    import('./areas/todos/feature-home/todos.routes').then((m) => m.todosRoutes),
},
```

Add the icon to `src/app/areas/shared/util-icons/icons.ts` (or pick one already registered — `solarChecklist`, `solarClipboard`, etc.).

### Check Your Work

`npm start`, navigate to `http://localhost:4200/todos`. You should see the feature shell with an empty outlet.

---

## Sprint 2 — The Store (with `withEntities`)

This is the sprint that matters. Read it slowly.

### Why entities?

You _could_ write the store as `withState({ todos: [] as Todo[] })`. Don't. Entity collections show up everywhere — todos, books, users, messages — and they all have the same boring needs: add one, update one by id, remove one by id, replace the whole set, look one up by id. `withEntities` gives you all of that, with O(1) lookup via `entityMap`, for free.

You'll also notice you basically never write `patchState(store, { todos: [...] })` again. Every mutation goes through a helper.

### `data/store.ts`

```typescript
import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods } from '@ngrx/signals';
import {
  addEntity,
  removeEntities,
  removeEntity,
  updateAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { Todo } from './types';

export const todosStore = signalStore(
  withEntities<Todo>(),
  withMethods((store) => ({
    add(title: string): void {
      const trimmed = title.trim();
      if (!trimmed) return;
      patchState(
        store,
        addEntity({ id: crypto.randomUUID(), title: trimmed, completed: false }),
      );
    },
    toggle(id: string): void {
      const current = store.entityMap()[id];
      if (!current) return;
      patchState(store, updateEntity({ id, changes: { completed: !current.completed } }));
    },
    rename(id: string, title: string): void {
      const trimmed = title.trim();
      if (!trimmed) {
        patchState(store, removeEntity(id));
        return;
      }
      patchState(store, updateEntity({ id, changes: { title: trimmed } }));
    },
    remove(id: string): void {
      patchState(store, removeEntity(id));
    },
    toggleAll(completed: boolean): void {
      patchState(store, updateAllEntities({ completed }));
    },
    clearCompleted(): void {
      patchState(store, removeEntities((t) => t.completed));
    },
  })),
  withComputed((store) => ({
    remaining: computed(() => store.entities().filter((t) => !t.completed).length),
    completedCount: computed(() => store.entities().filter((t) => t.completed).length),
    allComplete: computed(
      () => store.entities().length > 0 && store.entities().every((t) => t.completed),
    ),
  })),
);
```

> **Notice what's _not_ here**: no `providedIn: 'root'`. We'll provide this on the route in a moment so the store's lifetime matches the feature's lifetime.

### Things to look at carefully

- `updateEntity({ id, changes })` — partial update, merged into the entity. You don't reconstruct the whole object.
- `removeEntities((t) => t.completed)` — predicate form. Beats `entities().filter(...)` + a manual `patchState`.
- `updateAllEntities({ completed })` — one call, every entity gets the patch.
- `store.entityMap()[id]` — O(1) lookup, returns `undefined` if missing.
- The computed signals derive everything else. The store's _state_ is just the entities.

### Provide the store on the route

In `todos.routes.ts`:

```typescript
import { Routes } from '@angular/router';
import { Home } from './home';
import { todosStore } from '../data/store';

export const todosRoutes: Routes = [
  {
    path: '',
    component: Home,
    providers: [todosStore],
    data: { area: { label: 'Todos' } },
    children: [
      // ...
    ],
  },
];
```

> **Why on the route, not `providedIn: 'root'`?** The store is scoped to the feature. Navigate away from `/todos` and the route component is destroyed — the store goes with it. Navigate back, you get a fresh instance. That's usually what you want for feature-local state: no stale data, no surprise leaks across features, no global registry to reason about. Use `'root'` only when the data legitimately needs to outlive the feature (auth, theme, app-wide caches).

### Check Your Work

Nothing visible yet. But the store compiles and the route provides it. Open the file, re-read the methods — make sure you can say out loud what each entity helper does.

---

## Sprint 3 — The List Page

One page does everything: input at the top, list in the middle, footer with filter + counters at the bottom.

### Add the route

```typescript
{
  path: '',
  loadComponent: () => import('./pages/list').then((m) => m.ListPage),
  data: { nav: { label: 'List' } },
},
```

### `pages/list.ts` — the skeleton

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PageHeader } from '../../../shared/ui-page-header/page-header';
import { todosStore } from '../../data/store';

@Component({
  selector: 'app-todos-list',
  imports: [PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Todos" />

    <div class="flex flex-col gap-2 max-w-xl">
      <input
        class="input input-bordered w-full"
        placeholder="What needs to be done?"
        [value]="draft()"
        (input)="draft.set($any($event.target).value)"
        (keydown.enter)="add()"
      />

      <ul class="flex flex-col divide-y">
        @for (todo of store.entities(); track todo.id) {
          <li class="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              class="checkbox"
              [checked]="todo.completed"
              (change)="store.toggle(todo.id)"
            />
            <span class="flex-1" [class.line-through]="todo.completed" [class.opacity-60]="todo.completed">
              {{ todo.title }}
            </span>
            <button class="btn btn-ghost btn-xs" (click)="store.remove(todo.id)">✕</button>
          </li>
        } @empty {
          <li class="opacity-60 italic py-4">Nothing yet. Add one above.</li>
        }
      </ul>
    </div>
  `,
})
export class ListPage {
  protected readonly store = inject(todosStore);
  protected readonly draft = signal('');

  protected add(): void {
    this.store.add(this.draft());
    this.draft.set('');
  }
}
```

### Check Your Work

Add a few todos. Toggle them. Delete them. The list updates. Notice that the component never touches `patchState` — it just calls store methods.

---

## Sprint 4 — Inline Edit (double-click to edit)

TodoMVC's signature interaction. Double-click a todo to edit; Enter saves; Escape cancels; blank title deletes it (the store already handles the delete-on-empty case in `rename`).

Add an editing signal in the component:

```typescript
protected readonly editingId = signal<string | null>(null);
protected readonly editingDraft = signal('');

protected startEdit(todo: { id: string; title: string }): void {
  this.editingId.set(todo.id);
  this.editingDraft.set(todo.title);
}

protected commitEdit(id: string): void {
  this.store.rename(id, this.editingDraft());
  this.editingId.set(null);
}

protected cancelEdit(): void {
  this.editingId.set(null);
}
```

Update the `<li>` template:

```html
<li class="flex items-center gap-3 py-2">
  <input
    type="checkbox"
    class="checkbox"
    [checked]="todo.completed"
    (change)="store.toggle(todo.id)"
  />
  @if (editingId() === todo.id) {
    <input
      class="input input-bordered input-sm flex-1"
      autofocus
      [value]="editingDraft()"
      (input)="editingDraft.set($any($event.target).value)"
      (keydown.enter)="commitEdit(todo.id)"
      (keydown.escape)="cancelEdit()"
      (blur)="commitEdit(todo.id)"
    />
  } @else {
    <span
      class="flex-1 cursor-text"
      [class.line-through]="todo.completed"
      [class.opacity-60]="todo.completed"
      (dblclick)="startEdit(todo)"
    >
      {{ todo.title }}
    </span>
  }
  <button class="btn btn-ghost btn-xs" (click)="store.remove(todo.id)">✕</button>
</li>
```

### Check Your Work

Double-click a todo. Edit it. Enter saves; Escape leaves it alone; clearing the text and pressing Enter deletes it (that branch is in the store's `rename`).

---

## Sprint 5 — Footer: Counts, Toggle-All, Clear Completed

The footer exercises the rest of the entity helpers.

```html
<div class="flex items-center gap-4 pt-2 border-t text-sm">
  <label class="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      class="checkbox checkbox-sm"
      [checked]="store.allComplete()"
      (change)="store.toggleAll($any($event.target).checked)"
    />
    <span>Toggle all</span>
  </label>

  <span class="opacity-70">
    {{ store.remaining() }} {{ store.remaining() === 1 ? 'item' : 'items' }} left
  </span>

  <span class="flex-1"></span>

  @if (store.completedCount() > 0) {
    <button class="btn btn-ghost btn-sm" (click)="store.clearCompleted()">
      Clear completed ({{ store.completedCount() }})
    </button>
  }
</div>
```

### Check Your Work

- Add three todos. Tick the "Toggle all" checkbox → all become complete. Untick → all become active. (`updateAllEntities`)
- Mix completed and active. "Clear completed" removes only the completed ones. (`removeEntities` with predicate)
- "X items left" updates as you toggle individual todos. (`remaining` computed)

> **Key thought**: re-read your store methods now. Every footer button maps to exactly one entity helper. The component doesn't loop, doesn't filter, doesn't slice — the helpers do.

---

## Sprint 6 — Filter (All / Active / Completed)

Filter state belongs in the store (so future pages or deep links could read it too).

In `store.ts`, add filter state. This is a great spot to combine `withState` with `withEntities`:

```typescript
import { signalStore, withComputed, withMethods, withState, patchState } from '@ngrx/signals';

type Filter = 'all' | 'active' | 'completed';

export const todosStore = signalStore(
  withState({ filter: 'all' as Filter }),
  withEntities<Todo>(),
  withMethods((store) => ({
    // ...existing methods...
    setFilter(filter: Filter): void {
      patchState(store, { filter });
    },
  })),
  withComputed((store) => ({
    // ...existing computed...
    visible: computed(() => {
      const all = store.entities();
      switch (store.filter()) {
        case 'active':    return all.filter((t) => !t.completed);
        case 'completed': return all.filter((t) =>  t.completed);
        default:          return all;
      }
    }),
  })),
);
```

In the template, iterate `store.visible()` instead of `store.entities()`, and add filter buttons:

```html
<div class="join">
  @for (f of ['all', 'active', 'completed']; track f) {
    <button
      class="btn btn-sm join-item"
      [class.btn-active]="store.filter() === f"
      (click)="store.setFilter(f)"
    >
      {{ f }}
    </button>
  }
</div>
```

(You may need to type-narrow the loop variable — feel free to declare the array as `Filter[]` in the component.)

### Check Your Work

Switching filters changes which todos are shown, but counts and the toggle-all checkbox still reflect _all_ todos (because they use `entities()` / `remaining()` directly, not `visible()`). That's the right behavior — and a nice example of why you keep the entity collection canonical and derive views from it.

---

## Finished?

Stretch goals:

- **Drag to reorder.** `withEntities` keeps insertion order — `updateEntity` doesn't change it. To reorder, you'll need to think about whether order is part of the entity (`sortIndex` field) or part of an external array. Try both, see what bites.
- **Active count badge in the tab strip.** `<app-area-nav />` reads `data.nav.label` — could you make it dynamic? (You probably _can't_ without changes; the more honest version is: render the count next to the page title.)
- **Bulk add.** Paste a multi-line string into the input → split on `\n` and use `addEntities` to add them all in one shot.
- **Undo delete.** Capture the entity before `removeEntity`, show a toast with an "Undo" button that calls `addEntity` with the same shape. Note that the id is preserved, so `entityMap` lookups elsewhere don't break.

---

## To Learn More About…

> _Use your AI coding assistant as a learning tool. Rewrite these prompts in your own voice and chase what's confusing you._

**`withEntities` vs. `withState({ items: [] })`.** Why does one exist when the other works?

> "I'm using `withEntities<T>()` from `@ngrx/signals/entities`. What does it actually give me over just `withState({ todos: [] as Todo[] })`? Walk me through three concrete operations — add-by-id, update-by-id, remove-by-predicate — in both styles and show me where the entity version is shorter, faster, or harder to mess up."

**The entity helper family.** Easy to grab the wrong one.

> "List every helper exported from `@ngrx/signals/entities` (`addEntity`, `setEntity`, `updateEntity`, `updateAllEntities`, `removeEntity`, `removeEntities`, `setEntities`, etc.) and for each one give me a one-sentence rule for when it's the right tool. Then quiz me — give me five scenarios and ask which helper I'd reach for."

**Providing a store on a route vs. `providedIn: 'root'`.** This is the call you keep having to make.

> "What's the _practical_ difference between providing an NgRx signal store on a route's `providers` array versus `providedIn: 'root'`? Walk me through a scenario where the route-scoped version prevents a bug. Then walk me through one where `'root'` is unambiguously the right choice."

**`computed` for derived collections.** `visible` in this lab is a `computed` over `entities` + `filter`.

> "I have a signal store with `entities` and a `filter` signal. I derive `visible` as a `computed`. Is this efficient — does it re-run on every render, or only when its dependencies change? What about memoization — if I switch filters and switch back, does it recompute or use a cached value?"

**Why no persistence in this lab.** Most TodoMVCs persist to `localStorage`. We didn't.

> "If I wanted to add `localStorage` persistence to this signal store via `withHooks` and an `effect`, walk me through the design decisions: when to read, when to write, how to handle malformed JSON, what to do if the saved shape doesn't match the current `Todo` type. Don't write the code — make me think about the failure modes first."

**Try it without help.** Once it works, throw it away and rebuild from scratch — no AI, no peeking. Then:

> "Here's the TodoMVC I just rebuilt from memory \[paste]. Where am I leaning on the entity helpers properly, and where am I reaching past them and doing things by hand that the library would do better?"
