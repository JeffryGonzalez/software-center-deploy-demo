import { signalStoreFeature, watchState, withHooks } from '@ngrx/signals';

export function withLogging(name: string) {
  return signalStoreFeature(
    withHooks({
      onInit(store) {
        // this is an injection scope
        watchState(store, (state) => {
          console.log(`Store with name ${name} changed state to ${JSON.stringify(state)}`);
        });
      },
    }),
  );
}
