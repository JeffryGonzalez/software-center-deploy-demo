# Books

The "rock star" version of this lab would be for you to explore ways to work with the data, and signals, computed, etc.

What we want is a "pleasing" list of the books — use a table, or cards, or whatever.

Then we want a section at the top of the list that provides some statistics about the books.

- Total Books
- Average number of pages
- Longest Book Length and Title(s) of those books.
- The earliest date of a book
- The latest date of the book.

Add a way to sort the books by:

- Title
- Author
- Year

Both ascending and descending.

If you want a big challenge, add pagination.

**Below this line** might be helpful, it might not. You do you.

The mock API has an endpoint at `/api/books`. It supports a `GET` request.

We want to create a component that lists out the data from the results of the HTTP call to this endpoint.

---

## Goal (if you want to think through this, and, you know, _apply_ Angular)

You _may_ learn the most by _not_ trying to follow the step-by-step instructions below.

The `/api/books` endpoint returns a list of about a hundred books. We want a new feature in the application that displays the list of books on a page.

We would like to display just the id, title, author and year of each book. Maybe in a table, or some grid like structure. See what works for you.

You can do pretty much _all_ of this in a single component to start. Don't reach for a service or store _yet_.

### Display the data

Start by showing the 'raw' JSON of the endpoint. Then find a better way to display it.

We don't want to show all the details of the book — just the id, title, author, and year of each book.

You could use a table, a grid of cards, whatever you think looks good. Go shopping on [DaisyUI](https://daisyui.com) for inspiration and code to swipe.

### Pretend like this is the future, and "business" wants something else

At the top of the list of books, display a component that you create that takes the books as an input, and generates some statistics about them.

1. The total number of books.
2. The earliest year a book was published from our list.
3. The most recent year a book was published from our list.
4. The average number of pages of the books.

### Pretend like this is the "next sprint"

We want a way to sort the books by either title, author, or year released. By default it should be sorted by title.

Oh, and they want a "prefs" page in the feature where the user can configure what they want to sort by. This should be persisted in local storage.

**Extra Credit If You Can Sort in both Ascending and Descending Order.**

### Pretend like this is the "next sprint"

However you are displaying the list of books, make it so that the title of the book is a hyperlink that takes the user to another route that displays all the details of the book.

Add a page (`details.ts`) to display _all_ of the data about that book (id, title, author, country, language, pages, year, and links for the image, or show the image, and the link provided to the book).

### Final Sprint (Extra Credit)

We are considering letting users add books. Create a form that allows the user to add books, and the added book shows up in the list and is included in the stats.

If you have time, mock out the `post` handler in the mock service worker, so our API people know what to build.

> **Extra Credit**: Implement the Outbox pattern — capture the new book in a client-side "outbox" first, show it immediately, then flush to the server. Bonus points if you handle the case where the server rejects it.

---

## Steps

### 1. Create the Feature Folder

There is no scaffolding schematic in this project — we create features by hand, following the convention used by the `resources` feature.

Create the following structure:

```
src/app/areas/books/
├── data/
│   └── books.ts            # NgRx signalStore + types
└── feature-home/
    ├── books.routes.ts     # child Routes array
    ├── home.ts             # shell component (header + <app-area-nav /> + <router-outlet />)
    └── pages/
        ├── list.ts
        ├── stats.ts
        ├── prefs.ts
        ├── details.ts
        └── add.ts          # extra-credit
```

Use the `resources` feature (`src/app/areas/resources/`) as a working reference — same shape, same conventions.

### 2. Wire it into the App Router

Open `src/app/app.routes.ts` and add an entry:

```typescript
{
  path: 'books',
  data: { nav: { label: 'Books', icon: 'solarBook' } },
  loadChildren: () => import('./areas/books/feature-home/books.routes').then((m) => m.booksRoutes),
},
```

`solarBook` is already registered in `src/app/areas/shared/util-icons/icons.ts`. If you want a different icon, add it there.

### 3. Prototype: Get the Data

Inside `pages/list.ts`, start the simplest possible way — fetch the data and dump it out as JSON so you can see the "shape":

```typescript
import { ChangeDetectionStrategy, Component, resource } from '@angular/core';

@Component({
  selector: 'app-books-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<pre>{{ books.value() | json }}</pre>`,
})
export class ListPage {
  protected books = resource({
    loader: () => fetch('/api/books').then((r) => r.json()),
  });
}
```

> The `resource` API from `@angular/core` is a tidy way to wrap a one-shot fetch into a signal. If you'd rather use `HttpClient` and `toSignal`, that's also fine.

Add a route for it in `books.routes.ts` and verify you can see the JSON in the browser. Note the shape — pull out a `BookEntity` type:

```typescript
export type BookEntity = {
  id: number;
  title: string;
  author: string;
  country: string;
  language: string;
  pages: number;
  year: number;
  link: string;
  imageLink?: string;
};
```

Now convert the raw output into something nicer — a table, a grid of cards, whatever you like. Start with [DaisyUI's table](https://daisyui.com/components/table/) and iterate.

### 4. Statistics

For your _first_ pass, embed the stats in the same component as the list. Add `computed()` values like:

```typescript
totalBooks = computed(() => this.books.value()?.length ?? 0);
averagePages = computed(() => {
  const list = this.books.value() ?? [];
  if (!list.length) return 0;
  return Math.round(list.reduce((sum, b) => sum + b.pages, 0) / list.length);
});
earliestYear = computed(() => Math.min(...(this.books.value() ?? []).map((b) => b.year)));
latestYear = computed(() => Math.max(...(this.books.value() ?? []).map((b) => b.year)));
```

Display the stats in [DaisyUI's `stats` component](https://daisyui.com/components/stat/) at the top of the page.

### 5. Lift the Stats to Their Own Page

UX has seen your work, likes it, but thinks it's "too busy." They want a separate **Stats** page.

Create `pages/stats.ts` as its own component. Add it as a child route in `books.routes.ts` — give it `data: { nav: { label: 'Stats' } }` so it shows up in the `<app-area-nav />` tabs at the top of the feature shell.

For now, it's fine if `stats.ts` does its own `resource()` call to `/api/books`. Multiple components hitting the same endpoint is OK during a prototype — the browser cache (or a future store) will deduplicate later.

The `home.ts` shell component for the books feature should look almost identical to `src/app/areas/resources/feature-home/home.ts` — copy it and adjust the title.

### 6. Sortable Columns

When the user clicks a column header in the list, sort by that column. Click it again to reverse the sort.

Hold the sort state in two signals inside `list.ts`:

```typescript
sortKey = signal<'title' | 'author' | 'year'>('title');
sortDir = signal<'asc' | 'desc'>('asc');

sortedBooks = computed(() => {
  const list = [...(this.books.value() ?? [])];
  const key = this.sortKey();
  const dir = this.sortDir() === 'asc' ? 1 : -1;
  return list.sort((a, b) => (a[key] > b[key] ? dir : a[key] < b[key] ? -dir : 0));
});
```

### 7. Prefs Page + Local Storage

Create `pages/prefs.ts` with a UI (dropdown or radio buttons) that lets the user pick the default sort column.

You'll need somewhere for both pages to read/write that preference. This is where a **signal store** earns its keep. Use the `resourcesStore` (`src/app/areas/resources/data/resources.ts`) as a starting point. Your `booksStore` will eventually hold:

- The list of books (use `withEntities<BookEntity>()`)
- The sort key + direction
- Persistence on top of `localStorage` via `withHooks`

```typescript
withHooks({
  onInit(store) {
    const saved = localStorage.getItem('books-prefs');
    if (saved) patchState(store, JSON.parse(saved));
    effect(() => {
      localStorage.setItem('books-prefs', JSON.stringify({
        sortKey: store.sortKey(),
        sortDir: store.sortDir(),
      }));
    });
  },
});
```

**Extra Credit**: When the user clicks a column header on the list page, _also_ update the stored preference — so navigating back to **Prefs** shows the column they just chose as the active selection.

### 8. Details Page

Make each book title in the list a `[routerLink]` to `/books/details/<id>`. Add a child route:

```typescript
{
  path: 'details/:id',
  loadComponent: () => import('./pages/details').then((m) => m.DetailsPage),
}
```

In `details.ts`, read the `id` from the route, look the book up in the store, and display its full details.

The challenge: `/api/books` returns the whole list — there is no `/api/books/:id`. This is where the store really pays off:

- The store loads all books on `onInit`.
- The details page reads the book from `store.entityMap()[id]` (NgRx signal entities give you that for free).
- If the id isn't found, show a "Book not found" message with a link back to the list.

> Hint: `addEntity`, `setEntities`, and `entityMap` come from `@ngrx/signals/entities` — see `src/app/areas/resources/data/resources.ts`.

### 9. Refactor List + Prefs to Use the Store

Both `list.ts` and `prefs.ts` should read from `booksStore` rather than running their own `resource()` calls.

### Extra Credit — Background Refresh

Every five seconds, refetch the list "behind the scenes" so the data stays fresh. Use `effect()` plus `setInterval`, and clean up with `DestroyRef`.

---

## To Learn More About…

> _Use your AI coding assistant as a learning tool — not just a code generator. The prompts below are starting points; rewrite them in your own voice and follow your curiosity._

**Signals vs. RxJS Observables.** Most Angular tutorials online still teach Observables-first. We're using signals. Ask:

> "I'm learning Angular signals. I've used Observables and `async` pipes before. Where does the mental model overlap, and where does it diverge? Give me three concrete cases where the choice between them isn't obvious."

**The `resource` API.** It's new and people don't talk about it much.

> "Explain Angular's `resource()` API. When would I reach for it instead of `HttpClient` + `toSignal`? What does it _not_ do well? Show me a case where switching back to `HttpClient` would be the right call."

**Signal Store + entities.** Easy to cargo-cult, hard to actually understand.

> "I'm using `withEntities` from `@ngrx/signals/entities`. Help me understand what `entityMap`, `selectAll`, and `ids` actually are, and why an entity-shaped store is preferred over `withState({ books: [] })`. What problems does it prevent that I'd otherwise hit?"

**`computed` vs. plain methods.** A common stumble.

> "Inside an Angular component, when should I use `computed()` versus just a regular method (or a getter)? The result looks the same on screen — what's actually different? Show me a case where using a method instead of `computed` would cause a visible bug."

**Quiz me.** When you _think_ you've got it:

> "Quiz me on Angular signals, `computed`, and `effect`. Give me five short questions, one at a time, and don't tell me the answer until I try. Mark them wrong if I'm being vague."

**What's lurking?** Once your books feature works:

> "Here's my books feature \[paste files]. What subtle bugs or edge cases would bite me in production that aren't obvious yet? Don't fix them — just point them out and tell me what mental model would have caught each one."
