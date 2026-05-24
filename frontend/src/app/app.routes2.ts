import { Route } from '@angular/router';
import { IconName } from './areas/shared/util-icons/icons';
import { homeRoutes } from './areas/home/feature-home/home.routes';
import { docsRoutes } from './areas/docs/feature-docs/docs.routes';
import { resourcesRoutes } from './areas/resources/feature-home/resources.routes';
import { CounterRoutes } from './areas/counter/feature-counter/counter.routes';
import { demoRoutes } from './areas/demos/feature-demos/demos.routes';
import { pomodoroRoutes } from './areas/jeff-pomodoro/feature-home/pomodoro.routes';

export interface AppNavData {
  nav: { label: string; icon: IconName };
}

export type AppRoute = Route & { data?: AppNavData };

export const routes: AppRoute[] = [
  {
    path: 'home',
    data: { nav: { label: 'Home', icon: 'solarHome' } },
    children: homeRoutes,
  },
  {
    path: 'docs',
    data: { nav: { label: 'Docs', icon: 'solarBook' } },
    children: docsRoutes,
  },
  {
    path: 'resources',
    data: { nav: { label: 'Resources', icon: 'solarCode' } },
    children: resourcesRoutes,
  },
  {
    path: 'counter',
    data: { nav: { label: 'Counter', icon: 'solarAddSquareBold' } },
    children: CounterRoutes,
  },
  {
    path: 'demos',
    data: { nav: { label: 'Demos', icon: 'solarLightbulb' } },
    children: demoRoutes,
  },
  {
    path: 'pomodoro',
    data: { nav: { label: 'Pomodoro', icon: 'solarBell' } },
    children: pomodoroRoutes,
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
