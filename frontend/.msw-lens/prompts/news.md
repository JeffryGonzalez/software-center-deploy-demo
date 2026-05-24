# msw-lens context
generated: 2026-05-18T16:09:47.465Z
entry: src\app\areas\home\feature-home\pages\news.ts

---

## The ask

I'm working on the `News` component in a web application and want to
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

### news.ts
`src\app\areas\home\feature-home\pages\news.ts`
```typescript
import { Component } from '@angular/core';
import { PageHeader } from '../../../shared/ui-page-header/page-header';
import { NewsList } from '../ui/news-list';
import { NewsItem } from '../data/types';
import { httpResource } from '@angular/common/http';

@Component({
  selector: 'app-home-news',
  imports: [PageHeader, NewsList],
  template: `
    <app-page-header title="Angular News" description="Recent News About Angular" />
    <div class="prose max-w-none">
      @if (newsResource.hasValue()) {
        <app-home-news-list [news]="newsResource.value()" />
      }
    </div>
  `,
  styles: ``,
})
export class NewsPage {
  newsResource = httpResource<NewsItem[]>(() => 'https://news.hypertheory.com/angular');
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

### news-list.ts
`src\app\areas\home\feature-home\ui\news-list.ts`
```typescript
import { Component, input } from '@angular/core';
import { NewsItem } from '../data/types';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home-news-list',
  imports: [DatePipe],
  template: `
    <!--  @for replaces *ngFor, @if replaces *ngIf, etc.-->
    @for (item of news(); track item.id) {
      <div>
        <p class="text-xl text-secondary">{{ item.title }}</p>
        <p>{{ item.body }}</p>
        <p>{{ item.published | date }}</p>
      </div>
    }
  `,
  styles: ``,
})
export class NewsList {
  news = input.required<NewsItem[]>();
}
```

### types.ts
`src\app\areas\home\feature-home\data\types.ts`
```typescript
export type NewsItem = {
  id: string;
  title: string;
  body: string;
  published: string;
};
```

---

## Handler registration

### handlers.ts
`src\mocks\handlers.ts`
```typescript
import { HttpHandler } from 'msw';

import resourcesHandler from './resources/resources';
import booksHandler from './books/books';
import bypassed from './bypassed-endpoints';

const all: HttpHandler[] = [...resourcesHandler, ...booksHandler];

export const handlers: HttpHandler[] = all.filter((h) => {
  const { method, path } = h.info;
  if (typeof method !== 'string' || typeof path !== 'string') return true;
  return !bypassed.has(`${method} ${path}`);
});
```

---

## Existing manifests + handlers (pattern reference)

### resources.yaml
`src\mocks\resources\resources.yaml`
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
    - 'The List component has no @empty block — an empty array renders a bare <ul> with no user-visible message'
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
    delay: '1000'
  unauthorized:
    description: Tests 401 response — verifies session-expiry handling (redirect to login or inline error) from the store or a route guard
    httpStatus: 401
  server-error:
    description: Tests 500 response — verifies error boundary, fallback UI, or user-visible error message when the API is down
    httpStatus: 500
```

### resources.ts
`src\mocks\resources\resources.ts`
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
        await delay(1000);
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

  http.post(ENDPOINT, async ({ request }) => {
    const scenario = activeScenarios[`POST ${ENDPOINT}`] ?? 'success';

    switch (scenario) {
      case 'validation-error':
        return HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Validation failed',
            status: 400,
            errors: {
              title: ['Title is required'],
              url: ['URL must be a valid http(s) address'],
            },
          },
          { status: 400 },
        );

      case 'conflict':
        return HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Duplicate resource',
            status: 409,
            detail: 'A resource with this URL already exists',
          },
          { status: 409 },
        );

      case 'unauthorized':
        return HttpResponse.json(
          { type: 'about:blank', title: 'Unauthorized', status: 401 },
          { status: 401 },
        );

      case 'server-error':
        return new HttpResponse(null, { status: 500 });

      case 'slow':
        await delay(1000);
        return HttpResponse.json(
          { ...((await request.json()) as object), id: crypto.randomUUID() },
          { status: 201 },
        );

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

### resources-create.yaml
`src\mocks\resources\resources-create.yaml`
```yaml
endpoint: /api/resources
method: POST
description: Creates a new developer resource from the Add Resource form

responseType:
  name: Resource
  path: src/app/areas/resources/data/resources.ts

context:
  sourceHints:
    - src/app/areas/resources/data/resources.ts
    - src/app/areas/resources/feature-home/pages/add.ts
  hints:
    - "The store calls addEntity with the response body — the server response MUST include an id, or the entity will collide/disappear in the entity map"
    - "The form's submission action shows alert('Failed to add resource: ...') on any non-'ok' result; there is no per-field error rendering yet, so validation-error currently surfaces as a generic alert"
    - "URL duplicate detection happens client-side against the loaded list; a 409 from the server only triggers if a race condition or stale client state lets a dup through"

scenarios:
  success:
    description: Echoes the posted payload back with a fresh UUID — tests that the new resource is appended to the store and the form resets
    active: true
  slow:
    description: Tests that the submit button's pending/disabled state holds while the request is in flight
    delay: '1000'
  validation-error:
    description: Tests how the form surfaces a 400 from the server — currently rendered via the generic alert, no per-field messages
    httpStatus: 400
  conflict:
    description: Tests how the form surfaces a 409 duplicate-URL conflict from the server (race with client-side dedupe)
    httpStatus: 409
  unauthorized:
    description: Tests 401 mid-submit — verifies whether the form retains input and whether session-expiry handling kicks in
    httpStatus: 401
  server-error:
    description: Tests 500 response — verifies the form retains input and shows a recoverable error
    httpStatus: 500
```

### books.yaml
`src\mocks\books\books.yaml`
```yaml
endpoint: /api/books
method: GET
shape: collection
description: Returns the list of classic books used by the Books lab

responseType:
  name: BookEntity
  path: src/app/areas/books/data/types.ts

context:
  sourceHints:
    - src/app/areas/books/data/books.ts
    - src/app/areas/books/feature-home/pages/list.ts
    - src/app/areas/books/feature-home/pages/stats.ts
  hints:
    - "The list is generated from a fixed corpus seeded by the handler; ids 1-100 are stable across requests"
    - "Books have year, pages, author, country, language, link, imageLink — the stats page exercises every numeric field"

scenarios:
  typical:
    description: Shows ~100 classic books — the production-like view that exercises sorting, stats, and pagination
    active: true
  empty:
    description: Tests the zero-items state — verifies the list page renders an empty-state message instead of a bare table
  slow:
    description: Tests the loading/skeleton state while the request is in flight
    delay: '1000'
  server-error:
    description: Tests 500 response — verifies error boundary or fallback UI
    httpStatus: 500
```

### books.ts
`src\mocks\books\books.ts`
```typescript
import { http, HttpHandler, HttpResponse, delay } from 'msw';
import activeScenarios from '../active-scenarios';

const ENDPOINT = '/api/books';

type Book = {
  id: number;
  title: string;
  author: string;
  country: string;
  language: string;
  pages: number;
  year: number;
  link: string;
  imageLink: string;
};

// A fixed corpus of classic books — drawn from the public-domain BBC "100 Books" list.
const corpus: Omit<Book, 'id' | 'link' | 'imageLink'>[] = [
  { title: 'Things Fall Apart', author: 'Chinua Achebe', country: 'Nigeria', language: 'English', pages: 209, year: 1958 },
  { title: 'Fairy tales', author: 'Hans Christian Andersen', country: 'Denmark', language: 'Danish', pages: 784, year: 1836 },
  { title: 'The Divine Comedy', author: 'Dante Alighieri', country: 'Italy', language: 'Italian', pages: 928, year: 1315 },
  { title: 'The Epic Of Gilgamesh', author: 'Unknown', country: 'Sumer and Akkadian Empire', language: 'Akkadian', pages: 160, year: -1700 },
  { title: 'The Book Of Job', author: 'Unknown', country: 'Achaemenid Empire', language: 'Hebrew', pages: 176, year: -600 },
  { title: 'One Thousand and One Nights', author: 'Various', country: 'Indian/Iranian/Iraqi/Egyptian/Tajik', language: 'Arabic', pages: 288, year: 1200 },
  { title: 'Njál\'s Saga', author: 'Unknown', country: 'Iceland', language: 'Old Norse', pages: 384, year: 1350 },
  { title: 'Pride and Prejudice', author: 'Jane Austen', country: 'United Kingdom', language: 'English', pages: 226, year: 1813 },
  { title: 'Le Père Goriot', author: 'Honoré de Balzac', country: 'France', language: 'French', pages: 443, year: 1835 },
  { title: 'Molloy, Malone Dies, The Unnamable, the trilogy', author: 'Samuel Beckett', country: 'Republic of Ireland', language: 'French, English', pages: 256, year: 1952 },
  { title: 'The Decameron', author: 'Giovanni Boccaccio', country: 'Italy', language: 'Italian', pages: 1024, year: 1351 },
  { title: 'Ficciones', author: 'Jorge Luis Borges', country: 'Argentina', language: 'Spanish', pages: 224, year: 1965 },
  { title: 'Wuthering Heights', author: 'Emily Brontë', country: 'United Kingdom', language: 'English', pages: 342, year: 1847 },
  { title: 'The Stranger', author: 'Albert Camus', country: 'Algeria, French Empire', language: 'French', pages: 185, year: 1942 },
  { title: 'Poems', author: 'Paul Celan', country: 'Romania, France', language: 'German', pages: 320, year: 1952 },
  { title: 'Journey to the End of the Night', author: 'Louis-Ferdinand Céline', country: 'France', language: 'French', pages: 505, year: 1932 },
  { title: 'Don Quijote De La Mancha', author: 'Miguel de Cervantes', country: 'Spain', language: 'Spanish', pages: 1056, year: 1610 },
  { title: 'The Canterbury Tales', author: 'Geoffrey Chaucer', country: 'England', language: 'English', pages: 544, year: 1450 },
  { title: 'Stories', author: 'Anton Chekhov', country: 'Russia', language: 'Russian', pages: 194, year: 1886 },
  { title: 'Nostromo', author: 'Joseph Conrad', country: 'United Kingdom', language: 'English', pages: 320, year: 1904 },
  { title: 'Great Expectations', author: 'Charles Dickens', country: 'United Kingdom', language: 'English', pages: 194, year: 1861 },
  { title: 'Jacques the Fatalist', author: 'Denis Diderot', country: 'France', language: 'French', pages: 596, year: 1796 },
  { title: 'Berlin Alexanderplatz', author: 'Alfred Döblin', country: 'Germany', language: 'German', pages: 600, year: 1929 },
  { title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', country: 'Russia', language: 'Russian', pages: 551, year: 1866 },
  { title: 'The Idiot', author: 'Fyodor Dostoevsky', country: 'Russia', language: 'Russian', pages: 656, year: 1869 },
  { title: 'The Possessed', author: 'Fyodor Dostoevsky', country: 'Russia', language: 'Russian', pages: 768, year: 1872 },
  { title: 'The Brothers Karamazov', author: 'Fyodor Dostoevsky', country: 'Russia', language: 'Russian', pages: 824, year: 1880 },
  { title: 'Middlemarch', author: 'George Eliot', country: 'United Kingdom', language: 'English', pages: 800, year: 1871 },
  { title: 'Invisible Man', author: 'Ralph Ellison', country: 'United States', language: 'English', pages: 581, year: 1952 },
  { title: 'Medea', author: 'Euripides', country: 'Greece', language: 'Greek', pages: 104, year: -431 },
  { title: 'Absalom, Absalom!', author: 'William Faulkner', country: 'United States', language: 'English', pages: 313, year: 1936 },
  { title: 'The Sound and the Fury', author: 'William Faulkner', country: 'United States', language: 'English', pages: 326, year: 1929 },
  { title: 'Madame Bovary', author: 'Gustave Flaubert', country: 'France', language: 'French', pages: 528, year: 1857 },
  { title: 'Sentimental Education', author: 'Gustave Flaubert', country: 'France', language: 'French', pages: 606, year: 1869 },
  { title: 'Gypsy Ballads', author: 'Federico García Lorca', country: 'Spain', language: 'Spanish', pages: 218, year: 1928 },
  { title: 'One Hundred Years of Solitude', author: 'Gabriel García Márquez', country: 'Colombia', language: 'Spanish', pages: 417, year: 1967 },
  { title: 'Love in the Time of Cholera', author: 'Gabriel García Márquez', country: 'Colombia', language: 'Spanish', pages: 368, year: 1985 },
  { title: 'Faust', author: 'Johann Wolfgang von Goethe', country: 'Saxe-Weimar', language: 'German', pages: 158, year: 1832 },
  { title: 'Dead Souls', author: 'Nikolai Gogol', country: 'Russia', language: 'Russian', pages: 432, year: 1842 },
  { title: 'The Tin Drum', author: 'Günter Grass', country: 'Germany', language: 'German', pages: 600, year: 1959 },
  { title: 'The Devil to Pay in the Backlands', author: 'João Guimarães Rosa', country: 'Brazil', language: 'Portuguese', pages: 494, year: 1956 },
  { title: 'Hunger', author: 'Knut Hamsun', country: 'Norway', language: 'Norwegian', pages: 176, year: 1890 },
  { title: 'The Old Man and the Sea', author: 'Ernest Hemingway', country: 'United States', language: 'English', pages: 128, year: 1952 },
  { title: 'Iliad', author: 'Homer', country: 'Greece', language: 'Greek', pages: 608, year: -735 },
  { title: 'Odyssey', author: 'Homer', country: 'Greece', language: 'Greek', pages: 374, year: -800 },
  { title: 'A Doll\'s House', author: 'Henrik Ibsen', country: 'Norway', language: 'Norwegian', pages: 68, year: 1879 },
  { title: 'The Ramayana', author: 'Valmiki', country: 'India', language: 'Sanskrit', pages: 152, year: -450 },
  { title: 'The Mahabharata', author: 'Vyasa', country: 'India', language: 'Sanskrit', pages: 276, year: -700 },
  { title: 'Ulysses', author: 'James Joyce', country: 'Republic of Ireland', language: 'English', pages: 228, year: 1922 },
  { title: 'The Trial', author: 'Franz Kafka', country: 'Czechoslovakia', language: 'German', pages: 160, year: 1925 },
  { title: 'The Castle', author: 'Franz Kafka', country: 'Czechoslovakia', language: 'German', pages: 352, year: 1926 },
  { title: 'Complete Stories', author: 'Franz Kafka', country: 'Czechoslovakia', language: 'German', pages: 488, year: 1924 },
  { title: 'The recognition of Sakuntala', author: 'Kālidāsa', country: 'India', language: 'Sanskrit', pages: 147, year: 150 },
  { title: 'The Sound of the Mountain', author: 'Yasunari Kawabata', country: 'Japan', language: 'Japanese', pages: 288, year: 1954 },
  { title: 'Zorba the Greek', author: 'Nikos Kazantzakis', country: 'Greece', language: 'Greek', pages: 368, year: 1946 },
  { title: 'Sons and Lovers', author: 'D. H. Lawrence', country: 'United Kingdom', language: 'English', pages: 432, year: 1913 },
  { title: 'Independent People', author: 'Halldór Laxness', country: 'Iceland', language: 'Icelandic', pages: 470, year: 1934 },
  { title: 'Poems', author: 'Giacomo Leopardi', country: 'Italy', language: 'Italian', pages: 184, year: 1818 },
  { title: 'The Golden Notebook', author: 'Doris Lessing', country: 'United Kingdom', language: 'English', pages: 688, year: 1962 },
  { title: 'Pippi Longstocking', author: 'Astrid Lindgren', country: 'Sweden', language: 'Swedish', pages: 160, year: 1945 },
  { title: 'Diary of a Madman', author: 'Lu Xun', country: 'China', language: 'Chinese', pages: 389, year: 1918 },
  { title: 'Children of Gebelawi', author: 'Naguib Mahfouz', country: 'Egypt', language: 'Arabic', pages: 355, year: 1959 },
  { title: 'Buddenbrooks', author: 'Thomas Mann', country: 'Germany', language: 'German', pages: 736, year: 1901 },
  { title: 'The Magic Mountain', author: 'Thomas Mann', country: 'Germany', language: 'German', pages: 720, year: 1924 },
  { title: 'Moby Dick', author: 'Herman Melville', country: 'United States', language: 'English', pages: 378, year: 1851 },
  { title: 'Essays', author: 'Michel de Montaigne', country: 'France', language: 'French', pages: 404, year: 1595 },
  { title: 'History', author: 'Elsa Morante', country: 'Italy', language: 'Italian', pages: 600, year: 1974 },
  { title: 'Beloved', author: 'Toni Morrison', country: 'United States', language: 'English', pages: 321, year: 1987 },
  { title: 'The Tale of Genji', author: 'Murasaki Shikibu', country: 'Japan', language: 'Japanese', pages: 1360, year: 1006 },
  { title: 'The Man Without Qualities', author: 'Robert Musil', country: 'Austria', language: 'German', pages: 1774, year: 1930 },
  { title: 'Lolita', author: 'Vladimir Nabokov', country: 'Russia/United States', language: 'English', pages: 317, year: 1955 },
  { title: 'Nineteen Eighty-Four', author: 'George Orwell', country: 'United Kingdom', language: 'English', pages: 272, year: 1949 },
  { title: 'The Book of Disquiet', author: 'Fernando Pessoa', country: 'Portugal', language: 'Portuguese', pages: 277, year: 1928 },
  { title: 'Tales', author: 'Edgar Allan Poe', country: 'United States', language: 'English', pages: 842, year: 1950 },
  { title: 'In Search of Lost Time', author: 'Marcel Proust', country: 'France', language: 'French', pages: 4211, year: 1920 },
  { title: 'Gargantua and Pantagruel', author: 'François Rabelais', country: 'France', language: 'French', pages: 623, year: 1533 },
  { title: 'Pedro Páramo', author: 'Juan Rulfo', country: 'Mexico', language: 'Spanish', pages: 124, year: 1955 },
  { title: 'The Masnavi', author: 'Rumi', country: 'Persia, Persian Empire', language: 'Persian', pages: 438, year: 1236 },
  { title: 'Midnight\'s Children', author: 'Salman Rushdie', country: 'United Kingdom, India', language: 'English', pages: 536, year: 1981 },
  { title: 'Bostan', author: 'Saadi', country: 'Persia, Persian Empire', language: 'Persian', pages: 298, year: 1257 },
  { title: 'Season of Migration to the North', author: 'Tayeb Salih', country: 'Sudan', language: 'Arabic', pages: 139, year: 1966 },
  { title: 'Blindness', author: 'José Saramago', country: 'Portugal', language: 'Portuguese', pages: 352, year: 1995 },
  { title: 'Hamlet', author: 'William Shakespeare', country: 'England', language: 'English', pages: 432, year: 1603 },
  { title: 'King Lear', author: 'William Shakespeare', country: 'England', language: 'English', pages: 384, year: 1608 },
  { title: 'Othello', author: 'William Shakespeare', country: 'England', language: 'English', pages: 314, year: 1609 },
  { title: 'Oedipus the King', author: 'Sophocles', country: 'Greece', language: 'Greek', pages: 88, year: -430 },
  { title: 'The Red and the Black', author: 'Stendhal', country: 'France', language: 'French', pages: 576, year: 1830 },
  { title: 'The Life and Opinions of Tristram Shandy, Gentleman', author: 'Laurence Sterne', country: 'United Kingdom', language: 'English', pages: 640, year: 1760 },
  { title: 'Confessions of Zeno', author: 'Italo Svevo', country: 'Italy', language: 'Italian', pages: 412, year: 1923 },
  { title: 'Gulliver\'s Travels', author: 'Jonathan Swift', country: 'Republic of Ireland', language: 'English', pages: 178, year: 1726 },
  { title: 'Anna Karenina', author: 'Leo Tolstoy', country: 'Russia', language: 'Russian', pages: 864, year: 1877 },
  { title: 'War and Peace', author: 'Leo Tolstoy', country: 'Russia', language: 'Russian', pages: 1296, year: 1867 },
  { title: 'The Death of Ivan Ilyich', author: 'Leo Tolstoy', country: 'Russia', language: 'Russian', pages: 86, year: 1886 },
  { title: 'The Adventures of Huckleberry Finn', author: 'Mark Twain', country: 'United States', language: 'English', pages: 366, year: 1884 },
  { title: 'Ramayana', author: 'Tulsidas', country: 'India', language: 'Awadhi', pages: 1248, year: 1575 },
  { title: 'The Aeneid', author: 'Virgil', country: 'Roman Republic', language: 'Classical Latin', pages: 442, year: -23 },
  { title: 'Mahabharata', author: 'Vyasa', country: 'India', language: 'Sanskrit', pages: 768, year: -300 },
  { title: 'Leaves of Grass', author: 'Walt Whitman', country: 'United States', language: 'English', pages: 152, year: 1855 },
  { title: 'Mrs Dalloway', author: 'Virginia Woolf', country: 'United Kingdom', language: 'English', pages: 216, year: 1925 },
  { title: 'To the Lighthouse', author: 'Virginia Woolf', country: 'United Kingdom', language: 'English', pages: 209, year: 1927 },
  { title: 'Memoirs of Hadrian', author: 'Marguerite Yourcenar', country: 'France/Belgium', language: 'French', pages: 408, year: 1951 },
];

const books: Book[] = corpus.map((b, i) => ({
  id: i + 1,
  ...b,
  link: `https://en.wikipedia.org/wiki/${encodeURIComponent(b.title.replace(/\s+/g, '_'))}`,
  imageLink: `https://picsum.photos/seed/book-${i + 1}/240/360`,
}));

export default [
  http.get(ENDPOINT, async () => {
    const scenario = activeScenarios[`GET ${ENDPOINT}`] ?? 'typical';

    switch (scenario) {
      case 'empty':
        return HttpResponse.json([]);

      case 'slow':
        await delay(1000);
        return HttpResponse.json(books);

      case 'server-error':
        return new HttpResponse(null, { status: 500 });

      case 'typical':
      default:
        return HttpResponse.json(books);
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
