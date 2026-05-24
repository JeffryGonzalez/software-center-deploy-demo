import { Component, computed, linkedSignal, signal } from '@angular/core';
import { PageHeader } from '../../../shared/ui-page-header/page-header';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
type Product = {
  name: string;
  price: number;
  taxable: boolean;
};
@Component({
  selector: 'app-demos-linked',
  imports: [PageHeader, CurrencyPipe, FormsModule],
  template: `
    <app-page-header title="Linked Signals" description="Using Linked Signals" />
    <div class="prose max-w-none">
      <div class="grid grid-cols-4">
        @for (product of products(); track product.name) {
          <div class="card card-md">
            <div class="card-body">
              <p class="card-title">{{ product.name }}</p>
              <p>{{ product.price | currency }} {{ product.taxable ? 'Is' : 'Is not' }} taxable.</p>
              <div class="card-actions">
                <button
                  (click)="selected.set(product)"
                  class="btn btn-sm btn-accent"
                  [attr.aria-disabled]="selected() === product"
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        }
      </div>
      @if (selected() !== null) {
        <div>
          <p class="text-xl w-10">{{ selected()?.name }}</p>
          <input class="input" type="number" [(ngModel)]="qty" />
          <p>Price: {{ summary()?.price | currency }}</p>
          <p>Tax: {{ summary()?.tax | currency }}</p>
          <p>Total {{ summary()?.total | currency }}</p>
        </div>
      }
    </div>
  `,
  styles: ``,
})
export class LinkedPage {
  products = signal<Product[]>([
    { name: 'Eggs', price: 3.98, taxable: true },
    { name: 'Chips', price: 4.23, taxable: true },
    { name: 'Beer', price: 7.29, taxable: true },
    { name: 'Water', price: 1.98, taxable: false },
  ]);

  // setSelected(product:Product) {
  //   this.selected.set(product);
  //   this.qty.set(0);
  // }
  selected = signal<Product | null>(null);

  //qty = signal(1);
  qty = linkedSignal({
    source: this.selected,
    computation: () => 1,
  });

  summary = computed(() => {
    // this will recompute when either selected or qty change.
    const selected = this.selected();
    const qty = this.qty();
    if (selected !== null) {
      const price = selected.price * qty;
      const tax = selected.taxable ? selected.price * qty * 1.064 : 0;
      const total = price + tax;
      return {
        price,
        tax,
        total,
      };
    } else {
      return null;
    }
  });
}
