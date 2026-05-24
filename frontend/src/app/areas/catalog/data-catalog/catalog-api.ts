import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

export type VendorCatalogItem = {
  id: string;
  title: string;
  version: string;
};

export type VendorCatalogItemCreate = Omit<VendorCatalogItem, 'id'>;
export class CatalogApi {
  // get all the catalog items.
  #http = inject(HttpClient);

  getCatalogItems(vendorId: string) {
    return this.#http.get<VendorCatalogItem[]>(`/api/vendors/${vendorId}/items`);
  }

  addCatalogItemToVendor(vendorId: string, item: VendorCatalogItemCreate) {
    return this.#http.post<VendorCatalogItem>(`/api/vendors/${vendorId}/items`, item);
  }
}
