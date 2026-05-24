import { effect } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';

const STORAGE_KEY = 'pomodoro-prefs';

type PomodoroState = {
  workMinutes: number;
  breakMinutes: number;
};

const defaultState: PomodoroState = { workMinutes: 25, breakMinutes: 5 };

export const pomodoroStore = signalStore(
  withState<PomodoroState>(defaultState),
  withMethods((store) => ({
    setWorkMinutes(workMinutes: number): void {
      patchState(store, { workMinutes });
    },
    setBreakMinutes(breakMinutes: number): void {
      patchState(store, { breakMinutes });
    },
  })),
  withHooks({
    onInit(store) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Partial<PomodoroState>;
          patchState(store, {
            workMinutes: parsed.workMinutes ?? defaultState.workMinutes,
            breakMinutes: parsed.breakMinutes ?? defaultState.breakMinutes,
          });
        } catch {
          // ignore malformed storage
        }
      }
      effect(() => {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            workMinutes: store.workMinutes(),
            breakMinutes: store.breakMinutes(),
          }),
        );
      });
    },
  }),
);
