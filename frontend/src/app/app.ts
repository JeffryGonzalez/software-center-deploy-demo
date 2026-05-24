import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { AppNavData } from './app.routes';
import { IconName } from './areas/shared/util-icons/icons';
import { UserStats } from './areas/shared/ui-auth/user-stats';
import { StellarOverlayComponent } from '@hypertheory-labs/stellar-ng-devtools';
interface NavEntry {
  path: string;
  label: string;
  icon: IconName;
  exact: boolean;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIcon, UserStats, StellarOverlayComponent],
  template: `
    <div class="drawer drawer-open">
      <input
        id="app-drawer"
        type="checkbox"
        class="drawer-toggle"
        [checked]="open()"
        (change)="onToggle($event)"
      />

      <div class="drawer-content flex flex-col min-h-screen">
        <header class="navbar bg-base-300 border-b border-base-300">
          <h1 class="text-lg font-semibold px-2 text-primary">{{ title() }}</h1>
          <div class="ml-auto">
            <app-auth-user-stats />
          </div>
        </header>

        <main class="flex-1 bg-base-200">
          <div class="max-w-7xl mx-auto w-full p-6">
            <router-outlet />

            <stellar-overlay />
          </div>
        </main>
      </div>

      <div
        class="drawer-side is-drawer-close:overflow-visible"
        (mouseenter)="onHoverEnter()"
        (mouseleave)="onHoverLeave()"
      >
        <label for="app-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
        <div
          class="is-drawer-close:w-14 is-drawer-open:w-64 bg-base-300 flex flex-col items-start min-h-full transition-[width] duration-200"
        >
          <ul class="menu w-full grow">
            @for (item of navItems(); track item.path) {
              <li>
                <a
                  [routerLink]="['/', item.path]"
                  routerLinkActive="menu-active"
                  [routerLinkActiveOptions]="{ exact: item.exact }"
                  class="is-drawer-close:tooltip is-drawer-close:tooltip-right min-h-10"
                  [attr.data-tip]="item.label"
                  (click)="onNavClick()"
                >
                  <ng-icon [name]="item.icon" class="text-xl" />
                  <span class="is-drawer-close:hidden">{{ item.label }} </span>
                </a>
              </li>
            }
          </ul>

          <div
            class="m-2 is-drawer-close:tooltip is-drawer-close:tooltip-right"
            data-tip="Toggle sidebar"
          >
            <label
              for="app-drawer"
              class="btn btn-ghost btn-circle drawer-button is-drawer-open:rotate-y-180"
            >
              <ng-icon name="solarPin" class="text-xl" />
            </label>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class App {
  private router = inject(Router);

  protected readonly title = signal('Software Center');
  protected readonly pinned = signal(false);
  protected readonly hovered = signal(false);
  protected readonly open = computed(() => this.pinned() || this.hovered());

  protected readonly navItems = computed<NavEntry[]>(() =>
    this.router.config
      .filter((r): r is typeof r & { data: AppNavData } => !!r.data?.['nav'])
      .map((r) => {
        const path = r.path ?? '';
        return {
          path,
          label: r.data.nav.label,
          icon: r.data.nav.icon,
          exact: path === '',
        };
      }),
  );

  private hoverOpenTimer: ReturnType<typeof setTimeout> | null = null;
  private hoverCloseTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly OPEN_DELAY_MS = 400;
  private readonly CLOSE_DELAY_MS = 150;

  protected onToggle(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.clearTimers();
    this.pinned.set(checked);
    if (!checked) this.hovered.set(false);
  }

  protected onHoverEnter() {
    this.clearTimers();
    if (this.pinned() || this.hovered()) return;
    this.hoverOpenTimer = setTimeout(() => this.hovered.set(true), this.OPEN_DELAY_MS);
  }

  protected onHoverLeave() {
    this.clearTimers();
    if (this.pinned() || !this.hovered()) return;
    this.hoverCloseTimer = setTimeout(() => this.hovered.set(false), this.CLOSE_DELAY_MS);
  }

  protected onNavClick() {
    this.clearTimers();
    if (this.pinned()) return;
    this.hovered.set(false);
  }

  private clearTimers() {
    if (this.hoverOpenTimer) {
      clearTimeout(this.hoverOpenTimer);
      this.hoverOpenTimer = null;
    }
    if (this.hoverCloseTimer) {
      clearTimeout(this.hoverCloseTimer);
      this.hoverCloseTimer = null;
    }
  }
}
