import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AreaNav } from '../../shared/ui-area-nav/area-nav';

@Component({
  selector: 'app-pomodoro-home',
  imports: [RouterOutlet, AreaNav],
  template: `
    <header class="mb-4">
      <p class="text-sm opacity-70 text-accent">Focus in 25, rest in 5</p>
      <div class="flex items-center justify-between gap-4 mt-1">
        <h2 class="text-2xl font-semibold text-primary">Pomodoro</h2>
        <app-area-nav />
      </div>
    </header>
    <section class="bg-base-100 border border-base-300 rounded-box p-6 shadow-sm">
      <router-outlet />
    </section>
  `,
})
export class PomodoroHome {}
