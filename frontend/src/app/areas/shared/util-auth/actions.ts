import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const authActions = eventGroup({
  source: 'Auth',
  events: {
    login: type<void>(),
    logout: type<void>(),
  },
});
