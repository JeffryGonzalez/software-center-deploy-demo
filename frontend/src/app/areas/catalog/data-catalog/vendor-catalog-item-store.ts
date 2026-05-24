import { inject } from '@angular/core';
import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { addEntity, removeAllEntities, setEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { CatalogApi, VendorCatalogItem, VendorCatalogItemCreate } from './catalog-api';

import { mergeMap, pipe, switchMap, tap } from 'rxjs';
type CatalogItemRequest = {
  vendorId: string;
  item: VendorCatalogItemCreate;
};
export const vendorCatalogItemStore = signalStore(
  withEntities<VendorCatalogItem>(),
  withMethods((store) => {
    const apiService = inject(CatalogApi);
    return {
      addVendor: rxMethod<CatalogItemRequest>(
        pipe(
          mergeMap((v) =>
            apiService
              .addCatalogItemToVendor(v.vendorId, v.item)
              .pipe(tap((v) => patchState(store, addEntity(v)))),
          ),
        ),
      ),
      getForVendor: rxMethod<string>(
        pipe(
          tap((_) => patchState(store, removeAllEntities())),
          switchMap((id) =>
            apiService
              .getCatalogItems(id)
              .pipe(tap((items) => patchState(store, setEntities(items)))),
          ),
        ),
      ),
    };
  }),
);
