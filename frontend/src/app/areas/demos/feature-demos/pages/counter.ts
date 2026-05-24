import { Component, inject } from '@angular/core';
import { PageHeader } from '../../../shared/ui-page-header/page-header';
import { signalCounterStore } from '../../data-counter/store';

@Component({
  selector: 'app-demos-counter',
  imports: [PageHeader],
  providers: [signalCounterStore],
  template: `
    <app-page-header title="Counter2" description="Electric Boogaloo" />
    <div class="prose max-w-none">
      <p>Current is {{ store.current() }}</p>
      <button (click)="store.decrement()" class="btn btn-circle btn-sm btn-primary">-</button>
      <button (click)="store.increment()" class="btn btn-circle btn-sm btn-primary">+</button>
    </div>
  `,
  styles: ``,
})
export class CounterPage {
  store = inject(signalCounterStore);

  constructor() {
    // this.store._secret();
  }

  //   reset() {
  //     this.store.current.set(0);
  //   }
}
