import { patchState, signalStore, withHooks, withMethods } from '@ngrx/signals';
import { addEntity, setEntities, withEntities } from '@ngrx/signals/entities';
import { VendorCreate, VendorEntity } from './types';
import { withStellarDevtools } from '@hypertheory-labs/stellar-ng-devtools';

export const vendorsStore = signalStore(
  withStellarDevtools('VendorsStore', {
    description: 'This store manages the vendors for our software center',
    sourceHint: `src\\app\\areas\\catalog\\data-catalog\\vendors-store.ts`,
  }),
  withEntities<VendorEntity>(),
  withMethods((store) => {
    return {
      add: async (item: VendorCreate) => {
        const response = await fetch('/api/vendors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });

        const newVendor = await response.json();
        patchState(store, addEntity(newVendor));
      },
      _load: async () => {
        const vendors = await fetch('/api/vendors')
          .then((v) => v.json())
          .then((v) => v as VendorEntity[]);

        patchState(store, setEntities(vendors));
      },
    };
  }),
  withHooks({
    onInit(store) {
      store._load();
    },
  }),
);
