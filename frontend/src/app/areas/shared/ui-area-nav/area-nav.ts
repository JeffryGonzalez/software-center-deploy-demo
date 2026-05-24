import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';

interface NavMeta {
  label: string;
  icon?: string;
}

interface NavItem extends NavMeta {
  path: string;
}

@Component({
  selector: 'app-area-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div role="tablist" class="tabs tabs-border">
      @for (item of items(); track item.path) {
        <a
          role="tab"
          class="tab"
          [routerLink]="['.', ...itemSegments(item.path)]"
          routerLinkActive="tab-active"
          [routerLinkActiveOptions]="{ exact: item.path === '' }"
        >
          {{ item.label }}
        </a>
      }
    </div>
  `,
})
export class AreaNav {
  private route = inject(ActivatedRoute);

  protected items = computed<NavItem[]>(() => {
    const children = this.route.routeConfig?.children ?? [];
    return children
      .filter((c) => c.data?.['nav'])
      .map((c) => ({
        path: c.path ?? '',
        ...(c.data!['nav'] as NavMeta),
      }));
  });

  protected itemSegments(path: string): string[] {
    return path === '' ? [] : path.split('/');
  }
}
