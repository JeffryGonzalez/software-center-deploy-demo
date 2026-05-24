import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageHeader } from '../../../shared/ui-page-header/page-header';
import { pomodoroStore } from '../../data/store';

@Component({
  selector: 'app-pomodoro-prefs',
  imports: [PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Timer Settings" description="Stored in your browser" />

    <div class="flex flex-col gap-6 max-w-md">
      <label class="flex flex-col gap-1">
        <span class="flex justify-between font-semibold">
          <span>Focus Duration</span>
          <span class="opacity-60 font-mono">{{ store.workMinutes() }} min</span>
        </span>
        <input
          type="range"
          class="range range-error"
          min="1"
          max="60"
          step="1"
          [value]="store.workMinutes()"
          (input)="store.setWorkMinutes(toNumber($event))"
        />
      </label>

      <label class="flex flex-col gap-1">
        <span class="flex justify-between font-semibold">
          <span>Break Duration</span>
          <span class="opacity-60 font-mono">{{ store.breakMinutes() }} min</span>
        </span>
        <input
          type="range"
          class="range range-info"
          min="1"
          max="30"
          step="1"
          [value]="store.breakMinutes()"
          (input)="store.setBreakMinutes(toNumber($event))"
        />
      </label>
    </div>
  `,
})
export class PrefsPage {
  protected store = inject(pomodoroStore);

  protected toNumber(event: Event): number {
    return Number((event.target as HTMLInputElement).value);
  }
}
