import { Routes } from '@angular/router';
import { Demos } from './demos';
import { OverviewPage } from './pages/overview';
import { LinkedPage } from './pages/ls';
import { LifecyclePage } from './pages/pib';
import { LifechildPage } from './pages/life-child';
import { CounterPage } from './pages/counter';

export const demoRoutes: Routes = [
  {
    path: '',
    component: Demos,
    data: { area: { label: 'Demos' } },
    children: [
      {
        path: '',
        component: OverviewPage,
        data: { nav: { label: 'Overview' } },
      },
      {
        path: 'ls',
        component: LinkedPage,
        data: { nav: { label: 'Linked Signals' } },
      },
      {
        path: 'life',
        component: LifecyclePage,
        data: { nav: { label: 'LifeCycle' } },
        children: [{ path: ':id', component: LifechildPage }],
      },
      {
        path: 'counter',
        component: CounterPage,
        data: { nav: { label: 'Counter With Service' } },
      },
    ],
  },
];
