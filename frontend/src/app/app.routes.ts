import { Route } from '@angular/router';
import { IconName } from './areas/shared/util-icons/icons';
import { softwareCenterTeamMember } from './areas/shared/util-auth/auth-guards';

export interface AppNavData {
  nav: { label: string; icon: IconName; needsAuth?: boolean };
}

export type AppRoute = Route & { data?: AppNavData };

export const routes: AppRoute[] = [
  {
    path: 'catalog',
    data: { nav: { label: 'Catalog', icon: 'solarFolder' } },
    loadChildren: () =>
      import('./areas/catalog/feature-catalog/catalog.routes').then((c) => c.CatalogRoutes),
  },
  {
    path: 'admin',
    canActivate: [softwareCenterTeamMember],
    data: { nav: { label: 'Software Admin', icon: 'solarSettings', needsAuth: true } },
    loadChildren: () =>
      import('./areas/catalog/feature-admin/admin.routes').then((a) => a.softwareAdminRoutes),
  },
  {
    path: 'home',
    data: { nav: { label: 'Home', icon: 'solarHome' } },
    loadChildren: () => import('./areas/home/feature-home/home.routes').then((m) => m.homeRoutes),
  },
  {
    path: 'docs',
    data: { nav: { label: 'Docs', icon: 'solarBook' } },
    loadChildren: () => import('./areas/docs/feature-docs/docs.routes').then((m) => m.docsRoutes),
  },
  {
    path: 'resources',
    data: { nav: { label: 'Resources', icon: 'solarCode' } },
    loadChildren: () =>
      import('./areas/resources/feature-home/resources.routes').then((m) => m.resourcesRoutes),
  },
  {
    path: 'counter',
    data: { nav: { label: 'Counter', icon: 'solarAddSquareBold' } },
    loadChildren: () =>
      import('./areas/counter/feature-counter/counter.routes').then((c) => c.CounterRoutes),
  },
  {
    path: 'demos',
    data: { nav: { label: 'Demos', icon: 'solarLightbulb' } },
    loadChildren: () =>
      import('./areas/demos/feature-demos/demos.routes').then((d) => d.demoRoutes),
  },
  {
    path: 'pomodoro',
    data: { nav: { label: 'Pomodoro', icon: 'solarBell' } },
    loadChildren: () =>
      import('./areas/jeff-pomodoro/feature-home/pomodoro.routes').then((r) => r.pomodoroRoutes),
  },

  {
    path: '**',
    redirectTo: 'catalog',
  },
];
