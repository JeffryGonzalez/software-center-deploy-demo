import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods } from '@ngrx/signals';
import { addEntity, setEntities, withEntities } from '@ngrx/signals/entities';
import { Resource } from './types';

export const resourcesStore = signalStore(
  withEntities<Resource>(),
  withMethods((store) => {
    return {
      _load: async () =>
        fetch('/api/resources')
          .then((res) => res.json())
          .then((resources) => patchState(store, setEntities(resources))),
      add: async (resource: Omit<Resource, 'id'>) => {
        try {
          const res = await fetch('/api/resources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resource),
          });
          const newResource = await res.json();
          patchState(store, addEntity(newResource));
          return 'ok';
        } catch (error) {
          return Promise.reject(error instanceof Error ? error.message : 'Unknown error');
        }
      },
    };
  }),
  withComputed((store) => ({
    links: computed(() => store.entities().map((r) => r.url.toLocaleLowerCase())),
    tags: computed(() => {
      const seen = new Map<string, string>();
      for (const r of store.entities()) {
        for (const t of r.tags) {
          const key = t.trim().toLocaleLowerCase();
          if (key && !seen.has(key)) seen.set(key, t.trim());
        }
      }
      return [...seen.values()].sort((a, b) => a.localeCompare(b));
    }),
  })),
  withHooks({
    onInit(store) {
      store._load();
    },
  }),
);
