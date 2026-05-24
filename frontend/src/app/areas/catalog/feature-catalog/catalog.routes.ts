import { Routes } from '@angular/router';
import { Catalog } from './catalog';
import { OverviewPage } from './pages/overview';

export const CatalogRoutes: Routes = [
  {
    path: '',
    component: Catalog,
    data: { area: { label: 'Area Title' } },
    children: [
      {
        path: '',
        component: OverviewPage,
        data: { nav: { label: 'Overview' } },
      },
    ],
  },
];
