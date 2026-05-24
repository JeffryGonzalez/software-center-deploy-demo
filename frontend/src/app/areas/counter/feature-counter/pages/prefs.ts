import { Component, inject } from '@angular/core';
import { PageHeader } from '../../../shared/ui-page-header/page-header';
import { counterStore } from '../../data-counter/store';

@Component({
  selector: 'app-counter-prefs',
  imports: [PageHeader],
  template: `
    <app-page-header title="Preferences" description="Set Preferences For the Counter" />
    <div class="prose max-w-none">
      <div class="join">
        @for (val of store.countByVals; track val) {
          <button [disabled]="store.by() === val" (click)="store.setBy(val)" class="btn join-item">
            {{ val }}
          </button>
        }
      </div>
    </div>
  `,
  styles: ``,
})
export class PrefsPage {
  // We no longer do "constructor injection"
  store = inject(counterStore);
}
