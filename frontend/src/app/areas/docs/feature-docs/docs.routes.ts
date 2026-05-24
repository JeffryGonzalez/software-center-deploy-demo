import { Routes } from '@angular/router';
import { Docs } from './docs';
import { DocPage } from './pages/doc-page';

export const docsRoutes: Routes = [
  {
    path: '',
    component: Docs,
    data: { area: { label: 'Docs' } },
    children: [
      {
        path: '',
        component: DocPage,
        data: {
          nav: { label: 'Overview' },
          slug: 'overview',
        },
      },
      {
        path: 'creating-an-area',
        component: DocPage,
        data: {
          nav: { label: 'Creating an area' },
          slug: 'creating-an-area',
        },
      },
    ],
  },
];
