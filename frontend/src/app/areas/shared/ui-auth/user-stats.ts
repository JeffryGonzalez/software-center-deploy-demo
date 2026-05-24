import { Component, inject } from '@angular/core';
import { authStore } from '../util-auth/store';
import { injectDispatch } from '@ngrx/signals/events';
import { authActions } from '../util-auth/actions';

@Component({
  selector: 'app-auth-user-stats',
  imports: [],
  template: `
    @if (store.isAuthenticated()) {
      <button (click)="actions.logout()" class="btn btn-ghost btn-sm border-b-2 border-b-green-400">
        Logout
      </button>
    } @else {
      <button (click)="actions.login()" class="btn btn-ghost btn-sm border-b-2 border-b-red-400">
        Login
      </button>
    }
  `,
  styles: ``,
})
export class UserStats {
  protected readonly store = inject(authStore);
  protected readonly actions = injectDispatch(authActions);
}
