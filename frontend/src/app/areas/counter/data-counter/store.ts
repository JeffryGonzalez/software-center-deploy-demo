// I need a store that holds a signal for what we are counting by, and allows the prefs component to set that variable,
// other components can access this too, but it should be used only within the counter area.

import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  watchState,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';

const byValues = [1, 3, 5, 10] as const;
type ByValues = (typeof byValues)[number];

type CounterState = {
  by: ByValues;
  current: number;
};

export const counterStore = signalStore(
  withProps(() => ({
    countByVals: byValues,
  })),
  withState<CounterState>({
    by: 1,
    current: 0,
  }),
  withMethods((store) => {
    return {
      setBy: (value: ByValues) => patchState(store, { by: value }),
      increment: () => patchState(store, { current: store.current() + store.by() }),
      decrement: () => patchState(store, { current: store.current() - store.by() }),
      reset: () => patchState(store, { current: 0 }),
    };
  }),
  withComputed((store) => {
    return {
      resetDisabled: computed(() => store.current() === 0),
    };
  }),
  withHooks({
    onInit(store) {
      const savedJson = localStorage.getItem('counter-data');
      if (savedJson !== null) {
        const savedState = JSON.parse(savedJson) as unknown as CounterState;
        patchState(store, savedState);
      }
      watchState(store, (state) => {
        const dataToSave = JSON.stringify(state);
        localStorage.setItem('counter-data', dataToSave);
      });
    },
  }),
);
