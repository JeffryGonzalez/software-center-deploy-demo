import { Routes } from '@angular/router';
import { PomodoroHome } from './home';
import { pomodoroStore } from '../data/store';

export const pomodoroRoutes: Routes = [
  {
    path: '',
    component: PomodoroHome,
    providers: [pomodoroStore],
    data: { area: { label: 'Pomodoro' } },
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/timer').then((m) => m.TimerPage),
        data: { nav: { label: 'Timer' } },
      },
      {
        path: 'prefs',
        loadComponent: () => import('./pages/prefs').then((m) => m.PrefsPage),
        data: { nav: { label: 'Settings' } },
      },
    ],
  },
];
