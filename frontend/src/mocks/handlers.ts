import { HttpHandler } from 'msw';

import catalogHandler from './catalog/catalog';
import recipesHandler from './recipes/recipes';
import vendorsHandler from './vendors/vendors';
import vendorItemsHandler from './vendors/vendor-items';
import bypassed from './bypassed-endpoints';

const all: HttpHandler[] = [
  ...catalogHandler,
  ...recipesHandler,
  ...vendorsHandler,
  ...vendorItemsHandler,
];

export const handlers: HttpHandler[] = all.filter((h) => {
  const { method, path } = h.info;
  if (typeof method !== 'string' || typeof path !== 'string') return true;
  return !bypassed.has(`${method} ${path}`);
});
