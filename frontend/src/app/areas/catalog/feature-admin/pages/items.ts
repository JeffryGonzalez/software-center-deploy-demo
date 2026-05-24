import { Component, effect, inject, input } from '@angular/core';
import { PageHeader } from '../../../shared/ui-page-header/page-header';
import { vendorCatalogItemStore } from '../../data-catalog/vendor-catalog-item-store';

@Component({
  selector: 'app-admin-items-items',
  imports: [PageHeader],
  template: `
    <app-page-header title="Catalog Items" description="View Catalog Items" />
    <div class="prose max-w-none">
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Title</th>
              <th>Version</th>
            </tr>
          </thead>
          <tbody>
            @for (item of store.entities(); track item.id) {
              <tr>
                <td>{{ item.title }}</td>
                <td>{{ item.version }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="2">No catalog items for this vendor</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: ``,
})
export class ItemsPage {
  id = input.required<string>(); // from the route parameter
  store = inject(vendorCatalogItemStore);

  constructor() {
    effect(() => {
      const id = this.id();
      this.store.getForVendor(id);
    });
  }
}
