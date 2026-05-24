import { Routes } from '@angular/router';
import { Admin } from './admin';
import { OverviewPage } from './pages/overview';
import { VendorsPage } from './pages/vendors';
import { ItemsPage } from './pages/items';
import { AddItemPage } from './pages/add-item';
import { vendorsStore } from '../data-catalog/vendors-store';
import { vendorCatalogItemStore } from '../data-catalog/vendor-catalog-item-store';
import { CatalogApi } from '../data-catalog/catalog-api';

export const softwareAdminRoutes: Routes = [
  {
    path: '',
    component: Admin,
    providers: [vendorsStore, vendorCatalogItemStore, CatalogApi],
    data: { area: { label: 'Area Title' } },
    children: [
      {
        path: '',
        component: OverviewPage,
        data: { nav: { label: 'Overview' } },
      },
      {
        path: 'vendors',
        component: VendorsPage,
        data: { nav: { label: 'Vendors' } },
        children: [
          {
            path: ':id',
            component: ItemsPage,
          },
        ],
      },
      {
        path: 'add-item',
        component: AddItemPage,
        data: { nav: { label: 'Add Item' } },
      },
    ],
  },
];
