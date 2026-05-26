import { Component, inject } from '@angular/core';
import { PageHeader } from '../../../shared/ui-page-header/page-header';
import { vendorsStore } from '../../data-catalog/vendors-store';
import { VendorList } from '../../ui-vendors/vendor-list';
import { VendorAdd } from '../../ui-vendors/vendor-add';
import { RouterOutlet } from '@angular/router';
import { authStore } from '../../../shared/util-auth/store';

@Component({
  selector: 'app-admin-vendors',
  imports: [PageHeader, VendorList, VendorAdd, RouterOutlet],
  template: `
    <app-page-header title="Vendors" description="Vendor Management" />
    <div class="prose max-w-none">
      @if (store.loadError(); as error) {
        <div class="alert alert-error mb-4 flex items-center justify-between gap-3">
          <span>{{ error }}</span>
          <button class="btn btn-sm" type="button" (click)="store.reload()">Retry</button>
        </div>
      }

      <app-admin-vendor-add />

      @if (store.isLoading()) {
        <div class="mb-4 flex gap-2">
          <span class="loading loading-spinner text-primary"></span>
          <span class="loading loading-spinner text-secondary"></span>
          <span class="loading loading-spinner text-accent"></span>
        </div>
      }

      <div class="flex flex-row gap-4 w-full">
        <div class="w-1/2">
          <app-vendors-list [vendors]="store.entities()" />
        </div>
        <div class="w-1/2">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class VendorsPage {
  auth = inject(authStore);
  store = inject(vendorsStore);
}
