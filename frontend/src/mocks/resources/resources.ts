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
