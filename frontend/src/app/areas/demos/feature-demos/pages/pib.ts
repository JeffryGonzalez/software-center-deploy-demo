import { Component, signal } from '@angular/core';
import { PageHeader } from '../../../shared/ui-page-header/page-header';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-demos-lifecycle',
  imports: [PageHeader, RouterLink, RouterOutlet],
  template: `
    <app-page-header title="LifeCycle" description="Component Lifecycle" />
    <div class="prose max-w-none">
      <div class="flex flex-row gap-4">
        @for (id of ids(); track id) {
          <a [routerLink]="id">{{ id }}</a>
        }
      </div>
      <div class="p-8 m-4 border-2 border-amber-300">
        <router-outlet />
      </div>
    </div>
  `,
  styles: ``,
})
export class LifecyclePage {
  ids = signal(['12', '3', '4', '18', '22', '44', '69']);
}
