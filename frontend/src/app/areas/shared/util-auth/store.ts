import { signalStore, withComputed, withState } from '@ngrx/signals';
import { Events, on, withEventHandlers, withReducer } from '@ngrx/signals/events';
import { authActions } from './actions';
import { computed, inject } from '@angular/core';
import { withLogging } from '../util-logging/store-logging-feature';
import { withStellarDevtools } from '@hypertheory-labs/stellar-ng-devtools';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

type AuthState = {
  isAuthenticated: boolean;
  user: { name: string; email: string; roles: string[] } | undefined;
};

export const authStore = signalStore(
  withStellarDevtools('auth'),
  withState<AuthState>({
    isAuthenticated: false,
    user: undefined,
  }),
  withLogging('auth'),
  withReducer(
    on(authActions.login, () => ({
      isAuthenticated: true,
      user: { name: 'John Doe', email: 'john.doe@example.com', roles: ['software-center'] },
    })),
    on(authActions.logout, () => ({ isAuthenticated: false, user: undefined })),
  ),
  withComputed((state) => ({
    isSoftwareCenterTeamMember: computed(() => {
      return state.isAuthenticated()
        ? state.user()?.roles.some((r) => r === 'software-center')
        : false;
    }),
    isManager: computed(() => {
      return state.isAuthenticated() ? state.user()?.roles.some((r) => r === 'manager') : false;
    }),
  })),
  withEventHandlers((store, events = inject(Events), router = inject(Router)) => ({
    logout$: events.on(authActions.logout).pipe(tap(() => router.navigate(['/']))),
  })),
);
