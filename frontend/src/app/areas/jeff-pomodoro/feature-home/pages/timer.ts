import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { PageHeader } from '../../../shared/ui-page-header/page-header';
import { pomodoroStore } from '../../data/store';

@Component({
  selector: 'app-pomodoro-timer',
  imports: [PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Pomodoro Timer" description="Focus, then rest. Repeat." />

    <div class="flex flex-col items-center gap-6 py-4">
      <div
        class="badge badge-lg"
        [class.badge-error]="mode() === 'work'"
        [class.badge-info]="mode() === 'break'"
      >
        {{ mode() === 'work' ? 'Focus' : 'Break' }}
      </div>

      <div
        class="radial-progress font-mono font-bold"
        [class.text-error]="mode() === 'work'"
        [class.text-info]="mode() === 'break'"
        [style.--value]="progressPercent()"
        [style.--size.rem]="12"
        [style.--thickness.px]="8"
        role="progressbar"
        [attr.aria-valuenow]="progressPercent()"
      >
        <span class="text-2xl">{{ formattedTime() }}</span>
      </div>

      <div class="flex gap-4">
        <button class="btn btn-primary w-24" (click)="toggleTimer()">{{ startLabel() }}</button>
        <button class="btn btn-ghost" (click)="reset()">Reset</button>
      </div>
    </div>
  `,
})
export class TimerPage {
  protected store = inject(pomodoroStore);
  private destroyRef = inject(DestroyRef);

  protected mode = signal<'work' | 'break'>('work');
  protected isRunning = signal(false);

  protected sessionDuration = computed(() =>
    this.mode() === 'work' ? this.store.workMinutes() * 60 : this.store.breakMinutes() * 60,
  );

  protected secondsRemaining = signal(this.store.workMinutes() * 60);

  protected formattedTime = computed(() => {
    const s = Math.max(0, this.secondsRemaining());
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  });

  protected progressPercent = computed(() => {
    const total = this.sessionDuration();
    if (!total) return 0;
    return Math.round(((total - this.secondsRemaining()) / total) * 100);
  });

  protected startLabel = computed(() => (this.isRunning() ? 'Pause' : 'Start'));

  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // When sessionDuration changes (user edited prefs) and we're not running, snap to new total.
    // `untracked` prevents this effect from re-firing when isRunning toggles — otherwise Pause
    // would also reset secondsRemaining.
    effect(() => {
      const dur = this.sessionDuration();
      if (!untracked(this.isRunning)) this.secondsRemaining.set(dur);
    });

    // Auto-flip mode when the timer hits zero.
    effect(() => {
      if (this.secondsRemaining() === 0 && this.isRunning()) {
        this.pause();
        this.mode.update((m) => (m === 'work' ? 'break' : 'work'));
        // sessionDuration is recomputed; the first effect above resets secondsRemaining.
      }
    });

    this.destroyRef.onDestroy(() => {
      if (this.intervalId !== null) clearInterval(this.intervalId);
    });
  }

  protected toggleTimer(): void {
    if (this.isRunning()) {
      this.pause();
    } else {
      this.start();
    }
  }

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
    this.secondsRemaining.set(this.sessionDuration());
  }
}
