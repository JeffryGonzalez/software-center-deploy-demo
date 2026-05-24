import { Routes } from '@angular/router';

import { OverviewPage } from './pages/overview';
import { Home } from './home';
import { resourcesStore } from '../data/resources';

export const resourcesRoutes: Routes = [
  {
    path: '',
    component: Home,
    providers: [resourcesStore],
    data: { area: { label: 'Resources' } },
    children: [
      {
        path: '',
        component: OverviewPage,
        data: { nav: { label: 'Overview' } },
      },
      {
        path: 'add',
        loadComponent: () => import('./pages/add').then((m) => m.AddPage),
        data: { nav: { label: 'Add Resource' } },
      },
    ],
  },
];
