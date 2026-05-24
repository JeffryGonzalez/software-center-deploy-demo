import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <header class="flex items-start justify-between gap-4 mb-4">
      <div>
        <h2 class="text-2xl font-semibold">{{ title() }}</h2>
        @if (description(); as d) {
          <p class="text-sm opacity-70 mt-1">{{ d }}</p>
        }
      </div>
      <div class="flex items-center gap-2">
        <ng-content select="[actions]" />
      </div>
    </header>
  `,
})
export class PageHeader {
  title = input.required<string>();
  description = input<string>();
}
