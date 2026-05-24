import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AreaNav } from '../../shared/ui-area-nav/area-nav';

@Component({
  selector: 'app-docs',
  template: `
    <header class="mb-4">
      <p class="text-sm opacity-70">Reference material for the Applied Angular class.</p>
      <div class="flex items-center justify-between gap-4 mt-1">
        <h2 class="text-2xl font-semibold">Docs</h2>
        <app-area-nav />
      </div>
    </header>
    <section class="bg-base-100 border border-base-300 rounded-box p-6 shadow-sm">
      <router-outlet />
    </section>
  `,
  styles: [],
  imports: [RouterOutlet, AreaNav],
})
export class Docs {}
