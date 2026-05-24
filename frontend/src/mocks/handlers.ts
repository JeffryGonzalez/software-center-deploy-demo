import { HttpHandler } from 'msw';

import resourcesHandler from './resources/resources';
import booksHandler from './books/books';
import newsHandler from './news/news';
import catalogHandler from './catalog/catalog';
import vendorsHandler from './vendors/vendors';
import vendorItemsHandler from './vendors/vendor-items';
import bypassed from './bypassed-endpoints';

const all: HttpHandler[] = [
  ...resourcesHandler,
  ...booksHandler,
  ...newsHandler,
  ...catalogHandler,
  ...vendorsHandler,
  ...vendorItemsHandler,
];

export const handlers: HttpHandler[] = all.filter((h) => {
  const { method, path } = h.info;
  if (typeof method !== 'string' || typeof path !== 'string') return true;
  return !bypassed.has(`${method} ${path}`);
});
