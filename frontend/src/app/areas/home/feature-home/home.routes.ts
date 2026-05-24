import { Routes } from '@angular/router';
import { Home } from './home';
import { OverviewPage } from './pages/overview';
import { AboutPage } from './pages/about';
import { NewsPage } from './pages/news';

export const homeRoutes: Routes = [
  {
    path: '',
    component: Home,
    data: { area: { label: 'Home' } },
    children: [
      {
        path: '',
        component: OverviewPage,
        data: { nav: { label: 'Overview' } },
      },

      {
        path: 'about',
        component: AboutPage,
        data: { nav: { label: 'About' } },
      },
      {
        path: 'news',
        component: NewsPage,
        data: { nav: { label: 'Angular News' } },
      },
    ],
  },
];
