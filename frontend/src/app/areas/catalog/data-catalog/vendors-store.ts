import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { addEntity, setEntities, withEntities } from '@ngrx/signals/entities';
import { VendorCreate, VendorEntity } from './types';
import { withStellarDevtools } from '@hypertheory-labs/stellar-ng-devtools';

type VendorsStoreState = {
  isLoading: boolean;
  isAdding: boolean;
  loadError: string | null;
  addError: string | null;
};

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message;
  }

  return fallback;
}

function mergeLoadedVendors(loaded: VendorEntity[], current: VendorEntity[]) {
  const currentById = new Map(current.map((vendor) => [vendor.id, vendor]));

  const merged = loaded.map((vendor) => currentById.get(vendor.id) ?? vendor);
  const localOnly = current.filter(
    (vendor) => !loaded.some((loadedVendor) => loadedVendor.id === vendor.id),
  );

  return [...merged, ...localOnly];
}

export const vendorsStore = signalStore(
  withStellarDevtools('VendorsStore', {
    description: 'This store manages the vendors for our software center',
    sourceHint: `src\\app\\areas\\catalog\\data-catalog\\vendors-store.ts`,
  }),
  withEntities<VendorEntity>(),
  withState<VendorsStoreState>({
    isLoading: false,
    isAdding: false,
    loadError: null,
    addError: null,
  }),
  withMethods((store) => {
    let latestLoadRequestId = 0;
    let successfulAddCount = 0;

    const loadVendors = async () => {
      const requestId = ++latestLoadRequestId;
      const successfulAddCountAtStart = successfulAddCount;

      patchState(store, { isLoading: true, loadError: null });

      try {
        const response = await fetch('/api/vendors');
        if (!response.ok) {
          throw new Error(`Could not load vendors (${response.status})`);
        }

        const vendors = (await response.json()) as VendorEntity[];
        if (requestId !== latestLoadRequestId) {
          return;
        }

        const nextVendors =
          successfulAddCountAtStart === successfulAddCount
            ? vendors
            : mergeLoadedVendors(vendors, store.entities());

        patchState(store, setEntities(nextVendors));
      } catch (error) {
        if (requestId !== latestLoadRequestId) {
          return;
        }

        patchState(store, {
          loadError: toErrorMessage(error, 'Could not load vendors.'),
        });
      } finally {
        if (requestId === latestLoadRequestId) {
          patchState(store, { isLoading: false });
        }
      }
    };

    return {
      add: async (item: VendorCreate) => {
        if (store.isAdding()) {
          return null;
        }

        patchState(store, { isAdding: true, addError: null });

        try {
          const response = await fetch('/api/vendors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          });

          if (!response.ok) {
            throw new Error(`Could not add vendor (${response.status})`);
          }

          const newVendor = (await response.json()) as VendorEntity;
          patchState(store, addEntity(newVendor));
          successfulAddCount += 1;

          return newVendor;
        } catch (error) {
          patchState(store, {
            addError: toErrorMessage(error, 'Could not add vendor.'),
          });

          return null;
        } finally {
          patchState(store, { isAdding: false });
        }
      },
      _load: loadVendors,
      reload: loadVendors,
    };
  }),
  withHooks({
    onInit(store) {
      void store.reload();
    },
  }),
);
