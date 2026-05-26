import { Routes } from '@angular/router';
import { Home } from './home';
import { OverviewPage } from './pages/overview';
import { RecipesPage } from './pages/recipes';

export const homeRoutes: Routes = [
  {
    path: '',
    component: Home,
    data: { area: { label: 'Home' } },
    children: [
      {
        path: '',
        component: OverviewPage,
      },
      {
        path: 'recipes',
        component: RecipesPage,
      },
    ],
  },
];
