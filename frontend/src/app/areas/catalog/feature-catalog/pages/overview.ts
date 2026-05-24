import { Component, computed, signal } from '@angular/core';
import { PageHeader } from '../../../shared/ui-page-header/page-header';
import { httpResource } from '@angular/common/http';
import {
  CatalogListItem,
  CatalogListItems,
  CatalogListItemsSchema,
} from '../../data-catalog/types';

type Sortkeys = keyof Pick<CatalogListItem, 'title' | 'vendor'>;

@Component({
  selector: 'app-catalog-overview',
  imports: [PageHeader],
  template: `
    <app-page-header title="Catalog" description="The Software Catalog" />
    <div class="prose max-w-none">
      @if (catalogResource.hasValue()) {
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <!-- head -->
            <thead>
              <tr>
                <th>
                  <button
                    [disabled]="sortingBy() === 'title'"
                    class="btn btn-ghost btn-sm"
                    (click)="sortingBy.set('title')"
                  >
                    Title
                  </button>
                </th>
                <th>
                  <button
                    [disabled]="sortingBy() === 'vendor'"
                    class="btn btn-ghost btn-sm"
                    (click)="sortingBy.set('vendor')"
                  >
                    Vendor
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              @for (item of catalogSorted(); track item.id) {
                <tr>
                  <td>{{ item.title }}</td>
                  <td>{{ item.vendor }}</td>
                </tr>
              } @empty {
                <tr>
                  <td>No currently supported software</td>
                  <td></td>
                </tr>
              }
              <!-- row 2 -->
            </tbody>
          </table>
        </div>
      }
      @if (catalogResource.isLoading()) {
        <span class="loading loading-spinner text-primary"></span>
        <span class="loading loading-spinner text-secondary"></span>
        <span class="loading loading-spinner text-accent"></span>
        <span class="loading loading-spinner text-neutral"></span>
        <span class="loading loading-spinner text-info"></span>
        <span class="loading loading-spinner text-success"></span>
        <span class="loading loading-spinner text-warning"></span>
        <span class="loading loading-spinner text-error"></span>
      }
      @if (catalogResource.error()) {
        <div class="alert alert-error">Bummer - can't load the catalog right now.</div>
      }
    </div>
  `,
  styles: ``,
})
export class OverviewPage {
  catalogResource = httpResource<CatalogListItems>(() => '/api/catalog', {
    parse: CatalogListItemsSchema.parse,
  });

  sortingBy = signal<Sortkeys>('title');
  catalogSorted = computed(() => {
    const sortingBy = this.sortingBy();
    const items = this.catalogResource.hasValue() ? this.catalogResource.value() : [];
    // sort these by title
    return items.toSorted((a, b) => a[sortingBy].localeCompare(b[sortingBy]));
  });
}
