# Pomodoro Timer Lab

> This lab is designed for developers who want more step-by-step guidance.
> If you're comfortable with Angular signals and want a bigger challenge, try the [Text Analyzer lab](./lab-text-analyzer.md) instead, or do this one as a "warm up", and do the text analyzer later.

The [Pomodoro Technique](https://en.wikipedia.org/wiki/Pomodoro_Technique) is a time-management method where you work in focused sessions (typically 25 minutes) separated by short breaks (5 minutes). You'll build a working Pomodoro timer that teaches:

- `signal()` for mutable local state
- `computed()` for derived UI state
- `effect()` for reacting to state changes
- Child routing within a feature
- NgRx Signal Store for shared state
- `localStorage` persistence

---

## Sprint 1 — Feature Scaffold

There is no scaffolding schematic in this project — features are created by hand. Use the `resources` feature (`src/app/areas/resources/`) as a working reference.

Create this structure:

```
src/app/areas/pomodoro/
└── feature-home/
    ├── pomodoro.routes.ts
    ├── home.ts
    └── pages/
        └── home.ts
```

### `home.ts` (the shell)

Copy `src/app/areas/resources/feature-home/home.ts` and rename the selector / title. The shell renders a header + `<app-area-nav />` (the tab strip is automatic — it reads child routes that have `data: { nav: { label } }`) + a `<router-outlet />`.

### `pomodoro.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { Home } from './home';

export const pomodoroRoutes: Routes = [
  {
    path: '',
    component: Home,
    data: { area: { label: 'Pomodoro' } },
    children: [
      // pages go here
    ],
  },
];
```

### Wire into `app.routes.ts`

Add a top-level entry:

```typescript
{
  path: 'pomodoro',
  data: { nav: { label: 'Pomodoro', icon: 'solarStopwatch' } },
  loadChildren: () =>
    import('./areas/pomodoro/feature-home/pomodoro.routes').then((m) => m.pomodoroRoutes),
},
```

Add `solarStopwatch` (or whichever icon you prefer) to `src/app/areas/shared/util-icons/icons.ts`:

```typescript
import { solarStopwatch } from '@ng-icons/solar-icons/outline';
// ...add to the icons object below
```

### Check Your Work

Start the app (`npm start`) and navigate to `http://localhost:4200`. You should see a **Pomodoro** link in the left sidebar. Clicking it should take you to `/pomodoro` and show the feature shell (currently empty inside the `router-outlet`).

---

## Sprint 2 — Timer Page

### Create the Timer Component

Create `src/app/areas/pomodoro/feature-home/pages/timer.ts`:

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeader } from '../../../shared/ui-page-header/page-header';

@Component({
  selector: 'app-pomodoro-timer',
  imports: [PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Pomodoro Timer" />
    <div class="flex flex-col items-center gap-6 py-4">
      <div class="badge badge-lg badge-error">Focus</div>
      <div class="text-6xl font-mono font-bold text-error">25:00</div>
      <div class="flex gap-4">
        <button class="btn btn-primary w-24">Start</button>
        <button class="btn btn-ghost">Reset</button>
      </div>
    </div>
  `,
})
export class TimerPage {}
```

### Add the Route

In `pomodoro.routes.ts`, add to `children`:

```typescript
{
  path: '',
  loadComponent: () => import('./pages/timer').then((m) => m.TimerPage),
  data: { nav: { label: 'Timer' } },
},
```

> Setting `data.nav.label` is what makes the **Timer** tab appear in `<app-area-nav />` automatically — no manual link list needed.

### Check Your Work

Navigate to `/pomodoro`. You should see a **Timer** tab and the static UI rendered below it.

---

## Sprint 3 — Timer State with Signals

Now make the timer actually count. All state lives inside the component for this sprint — no store yet.

### Add Signals

In `timer.ts`, add these to the component class:

```typescript
protected secondsRemaining = signal(25 * 60);
protected isRunning = signal(false);
private intervalId: ReturnType<typeof setInterval> | null = null;
```

### Add a Computed for the Formatted Time

```typescript
protected formattedTime = computed(() => {
  const s = this.secondsRemaining();
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});
```

### Update the Template

```html
<div class="text-6xl font-mono font-bold text-error">{{ formattedTime() }}</div>
```

### Start / Pause / Reset

```typescript
protected start(): void {
  this.isRunning.set(true);
  this.intervalId = setInterval(() => {
    this.secondsRemaining.update((s) => s - 1);
  }, 1000);
}

protected pause(): void {
  this.isRunning.set(false);
  if (this.intervalId !== null) {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }
}

protected reset(): void {
  this.pause();
  this.secondsRemaining.set(25 * 60);
}
// UPDATED THIS
  protected toggleTimer(): void {
    if (this.isRunning()) {
      this.pause();
    } else {
      this.start();
    }
  }

```

Wire the buttons:

```html
<button class="btn btn-primary w-24" (click)="toggleTimer()">Start</button>
<button class="btn btn-ghost" (click)="reset()">Reset</button>
```

### Don't Forget Cleanup

If the user navigates away while the timer is running, `setInterval` keeps firing. Use `DestroyRef`:

```typescript
private destroyRef = inject(DestroyRef);

constructor() {
  this.destroyRef.onDestroy(() => {
    if (this.intervalId !== null) clearInterval(this.intervalId);
  });
}
```

> `DestroyRef` is imported from `@angular/core`, same as `inject`.

### Check Your Work

Start the timer — it should count down. Pause should stop it. Reset should return to 25:00.

---

## Sprint 4 — More Computed Signals

### Button Label

```typescript
protected startLabel = computed(() => (this.isRunning() ? 'Pause' : 'Start'));
```

```html
<button class="btn btn-primary w-24" (click)="toggleTimer()">{{ startLabel() }}</button>
```

### Progress Indicator

```typescript
protected progressPercent = computed(() => {
  const total = 25 * 60;
  return Math.round(((total - this.secondsRemaining()) / total) * 100);
});
```

DaisyUI has a circular `radial-progress` component. Replace the plain time div with:

```html
<div
  class="radial-progress text-2xl font-mono font-bold text-error"
  [style.--value]="progressPercent()"
  [style.--size]="'12rem'"
  [style.--thickness]="'8px'"
  role="progressbar"
>
  {{ formattedTime() }}
</div>
```

### Check Your Work

The progress ring should fill as time counts down. The button label should toggle.

> **Key concept**: Neither `startLabel` nor `progressPercent` use any `if/else` in the template — all the conditional logic lives in `computed()`. The template just reads values.

---

## Sprint 5 — Mode Switching with `effect()`

### Add Mode Signal

```typescript
protected mode = signal<'work' | 'break'>('work');

protected sessionDuration = computed(() =>
  this.mode() === 'work' ? 25 * 60 : 5 * 60,
);
```

Update `reset()` to use `sessionDuration()`. Update `progressPercent` to use it instead of the hardcoded `25 * 60`.

### Introduce `effect()` — Auto Mode Switch

When `secondsRemaining` hits zero, flip mode and reset. This is a side effect, not a derivation — `effect()` is the right tool.

```typescript
constructor() {
  effect(() => {
    if (this.secondsRemaining() === 0 && this.isRunning()) {
      this.pause();
      this.mode.update((m) => (m === 'work' ? 'break' : 'work'));
      this.secondsRemaining.set(this.sessionDuration());
    }
  });

  this.destroyRef.onDestroy(() => {
    if (this.intervalId !== null) clearInterval(this.intervalId);
  });
}
```

### Update the UI for Mode

```html
<div
  class="badge badge-lg"
  [class.badge-error]="mode() === 'work'"
  [class.badge-info]="mode() === 'break'"
>
  {{ mode() === 'work' ? 'Focus' : 'Break' }}
</div>
```

You can also flip the color class on the `radial-progress` div the same way.

### Check Your Work

Temporarily set the work session to 5 seconds. When it hits zero, the badge should switch to "Break", colors change, timer resets to the break duration.

---

## Sprint 6 — Preferences Page + Signal Store

Work and break durations are hardcoded. Move them into a shared store and add a Prefs page.

### Create the Store

`src/app/areas/pomodoro/data/store.ts`:

```typescript
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export const pomodoroStore = signalStore(
  withState({
    workMinutes: 25,
    breakMinutes: 5,
  }),
  withMethods((store) => ({
    setWorkMinutes(minutes: number): void {
      patchState(store, { workMinutes: minutes });
    },
    setBreakMinutes(minutes: number): void {
      patchState(store, { breakMinutes: minutes });
    },
  })),
);
```

Provide the store on the feature's parent route so both pages share one instance (mirroring how `resources.routes.ts` provides `resourcesStore`):

```typescript
import { pomodoroStore } from '../data/store';
// ...
{
  path: '',
  component: Home,
  providers: [pomodoroStore],
  data: { area: { label: 'Pomodoro' } },
  children: [ /* ... */ ],
}
```

### Update the Timer to Use the Store

In `timer.ts`:

```typescript
protected store = inject(pomodoroStore);

protected sessionDuration = computed(() =>
  this.mode() === 'work' ? this.store.workMinutes() * 60 : this.store.breakMinutes() * 60,
);
```

Initialize `secondsRemaining` from the store:

```typescript
protected secondsRemaining = signal(this.store.workMinutes() * 60);
```

> **Important**: `store` must be declared _before_ `secondsRemaining` in the class body, because class fields are initialized top-to-bottom.

### Create the Prefs Page

`src/app/areas/pomodoro/feature-home/pages/prefs.ts`. Inject the same store and add sliders:

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageHeader } from '../../../shared/ui-page-header/page-header';
import { pomodoroStore } from '../../data/store';

@Component({
  selector: 'app-pomodoro-prefs',
  imports: [PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Timer Settings" />
    <div class="flex flex-col gap-4 max-w-md">
      <label class="flex flex-col gap-1">
        <span class="flex justify-between">
          <span>Focus Duration</span>
          <span class="opacity-60">{{ store.workMinutes() }} min</span>
        </span>
        <input
          type="range"
          class="range range-error"
          min="1"
          max="60"
          step="1"
          [value]="store.workMinutes()"
          (input)="store.setWorkMinutes(+$any($event.target).value)"
        />
      </label>
      <!-- Repeat for breakMinutes -->
    </div>
  `,
})
export class PrefsPage {
  protected store = inject(pomodoroStore);
}
```

### Wire Up the Route

```typescript
{
  path: 'prefs',
  loadComponent: () => import('./pages/prefs').then((m) => m.PrefsPage),
  data: { nav: { label: 'Settings' } },
},
```

### Check Your Work

1. Navigate to Settings and move the sliders.
2. Navigate back to the Timer.
3. Hit Reset — the timer should reflect the new durations.

---

## Sprint 7 — Persistence

The store resets on every page reload. Persist it with `localStorage`.

### Add `withHooks` to the Store

```typescript
import { effect } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';

const STORAGE_KEY = 'pomodoro-prefs';

export const pomodoroStore = signalStore(
  withState({ workMinutes: 25, breakMinutes: 5 }),
  withMethods((store) => ({
    setWorkMinutes(minutes: number): void {
      patchState(store, { workMinutes: minutes });
    },
    setBreakMinutes(minutes: number): void {
      patchState(store, { breakMinutes: minutes });
    },
  })),
  withHooks({
    onInit(store) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) patchState(store, JSON.parse(saved));
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
```

### Check Your Work

1. Open Settings and change the work duration to 45.
2. Reload the page.
3. Open Settings — still 45.
4. DevTools → Application → Local Storage → you should see the `pomodoro-prefs` key.

---

## Finished?

Stretch goals:

- **Session counter**: How many focus sessions completed today.
- **Long break**: After 4 focus sessions, offer a 15-minute long break.
- **Sound notification**: Use the Web Audio API to play a tone when the timer finishes (try it in an `effect`).
- **Page title**: Update the browser tab title with the current timer using `Title` from `@angular/platform-browser`.

---

## To Learn More About…

> _Use your AI coding assistant as a learning tool — not just a code generator. The prompts below are starting points; rewrite them in your own voice and follow your curiosity._

**`signal` vs. `computed` vs. `effect`.** The three look similar but have very different jobs.

> "Explain the difference between `signal`, `computed`, and `effect` in Angular. For each one, give me a case where using one of the others would be the wrong choice and explain what breaks. Don't just describe them — show me failure modes."

**Reactive side effects.** Effects are easy to misuse.

> "When is `effect()` the right tool, and when is it a sign I'm misusing signals? Show me three common anti-patterns with `effect` and what to do instead."

**Cleanup and `DestroyRef`.** Easy to get wrong, hard to spot.

> "I'm using `setInterval` inside an Angular component. Explain every way I could fail to clean it up, and what symptom each failure would produce. Then show me the idiomatic Angular way to scope it to the component lifecycle."

**`providedIn: 'root'` vs. providing on a route.** This lab provides the store on the route, the resources feature does the same. The Pomodoro lab originally suggested `'root'`. Ask:

> "What's the practical difference between providing an NgRx signalStore at the route level versus `providedIn: 'root'`? Show me a case where one choice causes a bug the other prevents."

**`localStorage` + signals.** Looks innocuous, has gotchas.

> "I'm syncing an NgRx signalStore to `localStorage` inside `withHooks` using an `effect`. What could go wrong — race conditions, multiple tabs, malformed JSON, missing keys? For each one, tell me how I'd notice and what to do about it."

**Try it without help.** Build the timer once with no AI assistance. Then:

> "I built this Pomodoro timer myself \[paste it]. Review it as if you were a senior Angular developer. What's good? What's suspicious? Don't rewrite it — just explain."
