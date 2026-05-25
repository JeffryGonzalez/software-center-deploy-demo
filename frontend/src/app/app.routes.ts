import { Route } from '@angular/router';
import { IconName } from './areas/shared/util-icons/icons';
import { softwareCenterTeamMember } from './areas/shared/util-auth/auth-guards';

export interface AppNavData {
  nav: { label: string; icon: IconName; needsAuth?: boolean };
}

export type AppRoute = Route & { data?: AppNavData };

export const routes: AppRoute[] = [
  {
    path: 'home',
    data: { nav: { label: 'Home', icon: 'solarHome' } },
    loadChildren: () => import('./areas/home/feature-home/home.routes').then((m) => m.homeRoutes),
  },
  {
    path: 'catalog',
    data: { nav: { label: 'Catalog', icon: 'solarFolder' } },
    loadChildren: () =>
      import('./areas/catalog/feature-catalog/catalog.routes').then((c) => c.CatalogRoutes),
  },
  {
    path: 'admin',
    canActivate: [softwareCenterTeamMember],
    data: { nav: { label: 'Admin', icon: 'solarSettings', needsAuth: true } },
    loadChildren: () =>
      import('./areas/catalog/feature-admin/admin.routes').then((a) => a.softwareAdminRoutes),
  },
  {
    path: '**',
    redirectTo: 'catalog',
  },
];
