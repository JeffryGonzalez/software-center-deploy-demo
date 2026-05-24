import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, minLength, required } from '@angular/forms/signals';
import { VendorCatalogItemCreate } from '../../data-catalog/catalog-api';
import { vendorCatalogItemStore } from '../../data-catalog/vendor-catalog-item-store';
import { vendorsStore } from '../../data-catalog/vendors-store';
import { PageHeader } from '../../../shared/ui-page-header/page-header';

@Component({
  selector: 'app-admin-add-item',
  imports: [PageHeader, FormField, FormRoot],
  template: `
    <app-page-header title="Add Catalog Item" description="Add a software item to a vendor" />
    <div class="prose max-w-none">
      <form class="flex flex-col gap-4 max-w-lg" [formRoot]="itemForm">
        <div class="flex flex-col w-full">
          <label for="vendor">Vendor</label>
          <select class="select w-full" id="vendor" (change)="onVendorChange($event)">
            <option value="">Select a vendor…</option>
            @for (vendor of vendorStore.entities(); track vendor.id) {
              <option [value]="vendor.id">{{ vendor.name }}</option>
            }
          </select>
        </div>

        <div class="flex flex-col w-full">
          <label for="title">Title</label>
          <input
            [formField]="itemForm.title"
            class="input w-full"
            id="title"
            placeholder="Software title"
          />
          <div>
            @let titleField = itemForm.title();
            @if (titleField.touched() && titleField.invalid()) {
              @for (error of titleField.errors(); track error.kind) {
                <span class="label text-error text-xs">{{ error.message }}</span>
              }
            }
          </div>
        </div>

        <div class="flex flex-col w-full">
          <label for="version">Version</label>
          <input
            [formField]="itemForm.version"
            class="input w-full"
            id="version"
            placeholder="e.g. 1.0.0"
          />
          <div>
            @let versionField = itemForm.version();
            @if (versionField.touched() && versionField.invalid()) {
              @for (error of versionField.errors(); track error.kind) {
                <span class="label text-error text-xs">{{ error.message }}</span>
              }
            }
          </div>
        </div>

        <button
          [attr.aria-disabled]="itemForm().invalid() || !selectedVendorId()"
          type="submit"
          class="btn btn-accent aria-disabled:cursor-not-allowed"
        >
          Add Item
        </button>
      </form>
    </div>
  `,
  styles: ``,
})
export class AddItemPage {
  vendorStore = inject(vendorsStore);
  itemStore = inject(vendorCatalogItemStore);
  selectedVendorId = signal('');

  model = signal<VendorCatalogItemCreate>({ title: '', version: '' });

  itemForm = form(
    this.model,
    (schema) => {
      required(schema.title, { message: 'Title is required' });
      minLength(schema.title, 2);
      required(schema.version, { message: 'Version is required' });
    },
    {
      submission: {
        action: async (value) => {
          const vendorId = this.selectedVendorId();
          if (!vendorId) return;
          await this.itemStore.addVendor({ vendorId, item: value().controlValue() });
          this.itemForm().reset();
          this.model.set({ title: '', version: '' });
        },
      },
    },
  );

  onVendorChange(event: Event) {
    this.selectedVendorId.set((event.target as HTMLSelectElement).value);
  }
}
