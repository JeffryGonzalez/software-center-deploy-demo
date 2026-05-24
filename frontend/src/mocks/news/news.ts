import { http, HttpHandler, HttpResponse, delay } from 'msw';
import activeScenarios from '../active-scenarios';

const ENDPOINT = 'https://news.hypertheory.com/angular';

const typicalNews = [
  {
    id: '1',
    title: 'Angular v19 Released',
    body: 'Angular v19 brings improved SSR, incremental hydration, and signal-based input/output APIs to stable.',
    published: '2024-11-19T12:00:00.000Z',
  },
  {
    id: '2',
    title: 'Signals API Now Stable',
    body: 'The Angular Signals API graduates to stable, providing fine-grained reactivity without Zone.js overhead.',
    published: '2024-10-15T09:30:00.000Z',
  },
  {
    id: '3',
    title: 'httpResource Developer Preview',
    body: 'Angular introduces httpResource — a Signals-native API for declarative HTTP data fetching.',
    published: '2024-09-20T14:00:00.000Z',
  },
  {
    id: '4',
    title: 'Angular DevTools 19 Update',
    body: 'Angular DevTools adds Signal graph inspection, component profiling improvements, and a new dependency viewer.',
    published: '2024-08-05T10:00:00.000Z',
  },
  {
    id: '5',
    title: 'New Angular.dev Learning Path',
    body: 'Angular.dev launches a revamped interactive tutorial experience with in-browser code editing.',
    published: '2024-07-22T08:00:00.000Z',
  },
];

const manyNews = [
  { id: '101', title: 'Angular 20 Announcement', body: 'The Angular team previews Angular 20 with new compilation strategies and expanded Signal APIs.', published: '2025-05-01T08:00:00.000Z' },
  { id: '102', title: 'Zoneless Angular Reaches Stable', body: 'Angular officially stabilizes the zoneless change-detection mode, eliminating Zone.js from default apps.', published: '2025-04-20T09:00:00.000Z' },
  { id: '103', title: 'Angular CLI 19.2 Released', body: 'CLI 19.2 introduces faster cold-start builds and new schematics for generating Signal-based components.', published: '2025-04-10T10:00:00.000Z' },
  { id: '104', title: 'New Deferrable Views Guide', body: 'The Angular docs team publishes an in-depth guide covering all @defer trigger options and best practices.', published: '2025-04-05T11:00:00.000Z' },
  { id: '105', title: 'Angular Material 3 Theming Update', body: 'Angular Material 3 theming receives palette customisation improvements and updated component tokens.', published: '2025-03-28T08:30:00.000Z' },
  { id: '106', title: 'Server-Side Rendering Enhancements', body: 'Angular SSR gains streaming support and improved hydration diagnostics in the latest release.', published: '2025-03-20T09:00:00.000Z' },
  { id: '107', title: 'linkedSignal API Preview', body: 'A new linkedSignal primitive is introduced to synchronise derived state with writable capabilities.', published: '2025-03-15T14:00:00.000Z' },
  { id: '108', title: 'Angular NgOptimizedImage Updates', body: 'NgOptimizedImage adds lazy-loading priority hints and automatic srcset generation improvements.', published: '2025-03-10T10:00:00.000Z' },
  { id: '109', title: 'Component Input Bindings From Router', body: 'Router component input bindings become stable, allowing route params to bind directly to component inputs.', published: '2025-03-01T09:00:00.000Z' },
  { id: '110', title: 'Angular Fire 19 Released', body: 'AngularFire 19 ships with Signal-based reactive wrappers for Firestore, Auth, and Storage.', published: '2025-02-22T11:00:00.000Z' },
  { id: '111', title: 'Hydration Event Replay Stable', body: 'Event replay during hydration reaches stable status, removing a key SSR UX regression.', published: '2025-02-15T08:00:00.000Z' },
  { id: '112', title: 'Angular Schematics Improvements', body: 'The schematics API receives typed options support and improved error messaging for migration scripts.', published: '2025-02-10T09:30:00.000Z' },
  { id: '113', title: 'Angular DevTools Signal Graph Stable', body: 'The Signal graph visualiser in Angular DevTools graduates from experimental to stable.', published: '2025-02-05T10:00:00.000Z' },
  { id: '114', title: 'New Built-in Control Flow Docs', body: 'The documentation for @if, @for, and @switch built-in control-flow blocks is fully rewritten with interactive examples.', published: '2025-01-30T08:00:00.000Z' },
  { id: '115', title: 'Angular Universal Deprecated', body: 'Angular Universal is officially deprecated in favour of the integrated SSR support built into the Angular CLI.', published: '2025-01-25T09:00:00.000Z' },
  { id: '116', title: 'Incremental DOM Compilation Research', body: 'The Angular compiler team shares research into incremental DOM compilation for faster partial builds.', published: '2025-01-20T10:00:00.000Z' },
  { id: '117', title: 'NgRx 19 Released', body: 'NgRx 19 introduces Signal Store improvements, functional effects, and a leaner API surface.', published: '2025-01-15T11:00:00.000Z' },
  { id: '118', title: 'Angular ESBuild Builder Stable', body: 'The ESBuild-based application builder is now the default and stable choice for all new Angular projects.', published: '2025-01-10T09:00:00.000Z' },
  { id: '119', title: 'TypeScript 5.7 Support Added', body: 'Angular 19.1 adds full support for TypeScript 5.7 including stricter type inference improvements.', published: '2025-01-05T08:00:00.000Z' },
  { id: '120', title: 'Angular Community Survey Results', body: 'The 2024 Angular community survey results are published, highlighting demand for better debugging tools.', published: '2025-01-02T10:00:00.000Z' },
  { id: '121', title: 'Angular v18.2 Patch', body: 'Angular 18.2 ships stability fixes for SSR hydration edge cases and Signal computed caching.', published: '2024-12-20T09:00:00.000Z' },
  { id: '122', title: 'TestBed Signal Support', body: 'TestBed gains improved utilities for testing Signal-based components without Zone.js teardown issues.', published: '2024-12-15T10:00:00.000Z' },
  { id: '123', title: 'New Router Features in 19.1', body: 'Router 19.1 adds view transitions support and lazy-loaded default routes.', published: '2024-12-10T08:30:00.000Z' },
  { id: '124', title: 'Angular Compiler Plugin for Vite', body: 'An experimental Angular compiler plugin for Vite is open-sourced, enabling Angular in Vite-based toolchains.', published: '2024-12-05T11:00:00.000Z' },
  { id: '125', title: 'Content Security Policy Improvements', body: 'Angular 19 adds automatic nonce injection support to help meet strict CSP requirements out of the box.', published: '2024-12-01T09:00:00.000Z' },
  { id: '126', title: 'Angular.dev Search Redesign', body: 'The angular.dev documentation site ships a rebuilt search experience powered by Algolia DocSearch v3.', published: '2024-11-28T10:00:00.000Z' },
  { id: '127', title: 'Standalone Migration Schematic Updated', body: 'The standalone migration schematic is updated to handle more edge cases including NgModules with providers.', published: '2024-11-22T09:00:00.000Z' },
  { id: '128', title: 'Angular Signals: toObservable Improvements', body: 'toObservable receives an injection-context override option for use outside the constructor.', published: '2024-11-18T11:00:00.000Z' },
  { id: '129', title: 'Partial Hydration Developer Preview', body: 'Partial hydration reaches developer preview, allowing @defer blocks to defer hydration on the client.', published: '2024-11-12T09:00:00.000Z' },
  { id: '130', title: 'New Animations Docs', body: 'The Angular animations documentation is rewritten with updated examples using the standalone API.', published: '2024-11-08T10:00:00.000Z' },
  { id: '131', title: 'Angular CLI Standalone Default', body: 'Standalone components are now the default when generating new components via the Angular CLI.', published: '2024-11-01T09:00:00.000Z' },
  { id: '132', title: 'Signal-Based Forms RFC', body: 'The Angular team publishes an RFC for Signal-based reactive forms, seeking community feedback.', published: '2024-10-25T10:00:00.000Z' },
  { id: '133', title: 'Angular 18.1 Released', body: 'Angular 18.1 ships with improved hot module replacement and Signal-related developer experience fixes.', published: '2024-10-18T09:00:00.000Z' },
  { id: '134', title: 'Vitest Integration for Angular', body: 'An official Vitest builder for Angular is released as a developer preview, replacing Karma in new projects.', published: '2024-10-12T11:00:00.000Z' },
  { id: '135', title: 'RxJS 8 Compatibility Notes', body: 'The Angular team publishes guidance on RxJS 8 compatibility and the path toward optional RxJS usage.', published: '2024-10-05T08:30:00.000Z' },
  { id: '136', title: 'Angular CDK New Drag Features', body: 'Angular CDK drag-and-drop gains auto-scroll configuration and improved accessibility keyboard handling.', published: '2024-09-28T09:00:00.000Z' },
  { id: '137', title: 'NgOptimizedImage Supports AVIF', body: 'NgOptimizedImage adds AVIF format support and automatic format negotiation via Accept headers.', published: '2024-09-22T10:00:00.000Z' },
  { id: '138', title: 'Angular 18 Full Release Notes', body: 'The full Angular 18 changelog is published, covering Signal stabilisation, SSR streaming, and Material 3.', published: '2024-09-15T09:00:00.000Z' },
  { id: '139', title: 'Improved Error Messages in Angular 18', body: 'Angular 18 ships clearer runtime error messages with links to documentation for common mistakes.', published: '2024-09-08T11:00:00.000Z' },
  { id: '140', title: 'afterRender and afterNextRender Stable', body: 'The afterRender and afterNextRender lifecycle hooks stabilise, offering a safe DOM interaction point.', published: '2024-09-01T09:00:00.000Z' },
  { id: '141', title: 'Angular Language Service Performance', body: 'The Angular Language Service receives a major performance pass, reducing autocomplete latency by 40%.', published: '2024-08-25T10:00:00.000Z' },
  { id: '142', title: 'New Control Flow Migration Tool', body: 'A schematic is released to auto-migrate NgIf/NgFor/NgSwitch usages to built-in control-flow syntax.', published: '2024-08-18T09:00:00.000Z' },
  { id: '143', title: 'Angular Material Table Virtual Scroll', body: 'Angular Material table gains virtual scrolling support for large datasets via CdkVirtualScrollViewport.', published: '2024-08-10T11:00:00.000Z' },
  { id: '144', title: 'Angular 17.3 Patch', body: 'Angular 17.3 addresses a memory leak in the Signal effect scheduler and fixes multiple template type-check regressions.', published: '2024-08-03T09:00:00.000Z' },
  { id: '145', title: 'Community Spotlight: Analog.js 2.0', body: 'Analog.js 2.0 ships with full-stack Angular SSR, file-based routing, and API routes support.', published: '2024-07-28T10:00:00.000Z' },
  { id: '146', title: 'Providedin Root Lazy Loading Fix', body: 'A long-standing issue where providedIn root services were eagerly loaded in lazy routes is resolved.', published: '2024-07-20T09:00:00.000Z' },
  { id: '147', title: 'Angular Summit 2024 Recap', body: 'Key announcements from Angular Summit 2024 include roadmap updates, Signal forms preview, and community awards.', published: '2024-07-14T11:00:00.000Z' },
  { id: '148', title: 'Typed Reactive Forms Improvements', body: 'Angular ships fixes for typed reactive forms inference edge cases with complex nested form groups.', published: '2024-07-07T09:00:00.000Z' },
  { id: '149', title: 'View Transitions API Support', body: 'Angular Router integrates the browser View Transitions API for smooth page-to-page animations.', published: '2024-07-01T10:00:00.000Z' },
  { id: '150', title: 'Angular 17 Year in Review', body: 'The Angular blog reflects on Angular 17 milestones: built-in control flow, deferrable views, and the new docs site.', published: '2024-06-25T09:00:00.000Z' },
];

const staleDateNews = [
  {
    id: '10',
    title: 'Item with an invalid date string',
    body: 'The published field contains a non-ISO string — DatePipe should silently render an empty date cell.',
    published: 'not-a-date',
  },
  {
    id: '11',
    title: 'Item with an empty date string',
    body: 'The published field is an empty string — DatePipe silently produces no output.',
    published: '',
  },
  {
    id: '12',
    title: 'Item with a far-future date',
    body: 'Published date is set to 2099 — verifies that DatePipe formats it without issues.',
    published: '2099-12-31T00:00:00.000Z',
  },
  {
    id: '13',
    title: 'Item with a far-past date',
    body: 'Published date is set to 1900 — verifies that DatePipe formats very old dates correctly.',
    published: '1900-01-01T00:00:00.000Z',
  },
];

export default [
  http.get(ENDPOINT, async () => {
    const scenario = activeScenarios[`GET ${ENDPOINT}`] ?? 'typical';

    switch (scenario) {
      case 'empty':
        return HttpResponse.json([]);

      case 'slow':
        await delay(3000);
        return HttpResponse.json(typicalNews);

      case 'never-resolves':
        await delay('infinite');
        return HttpResponse.json(typicalNews);

      case 'server-error':
        return new HttpResponse(null, { status: 500 });

      case 'stale-dates':
        return HttpResponse.json(staleDateNews);

      case 'many-items':
        return HttpResponse.json(manyNews);

      case 'typical':
      default:
        return HttpResponse.json(typicalNews);
    }
  }),
] as HttpHandler[];
