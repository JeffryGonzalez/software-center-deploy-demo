import { Component, inject, signal } from '@angular/core';
import { PageHeader } from '../../../shared/ui-page-header/page-header';
import { counterStore } from '../../data-counter/store';
import { FizzBuzz } from '../../ui-counter/fizz-buzz';

@Component({
  selector: 'app-counter-page',
  imports: [PageHeader, FizzBuzz],
  template: `
    <app-page-header title="Counter Overview" description="The Counter" />
    <div class="prose max-w-none">
      <div>
        <button (click)="store.decrement()" class="btn btn-primary">-</button>
        <span class="p-2 text-lg">{{ store.current() }}</span>
        <button (click)="store.increment()" class="btn btn-primary">+</button>
      </div>
      <div>
        <button
          [aria-disabled]="store.resetDisabled()"
          [disabled]="store.resetDisabled()"
          (click)="store.reset()"
          class="btn btn-primary"
        >
          Reset Back To Zero
        </button>
      </div>
      @defer (on timer(3000ms)) {
        <app-counter-fizzbuzz />
      } @placeholder {
        <p>Chart is coming soon!</p>
      } @loading {
        <p>Loading your stuff</p>
      }
    </div>
  `,
  styles: ``,
})
export class OverviewPage {
  store = inject(counterStore);
  good = signal(true);
  // Fizzbuzz - if current is equally divisible by 3 it is 'fizz', 5 is 'buzz', 3 & 5 'fizzbuzz', otherwise, nothing.
}
