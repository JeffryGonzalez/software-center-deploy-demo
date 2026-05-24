import { SchemaPath, validate } from '@angular/forms/signals';
import * as z from 'zod/mini';

export const CatalogListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  vendor: z.string(),
});

export const CatalogListItemsSchema = z.array(CatalogListItemSchema);

export type CatalogListItem = z.infer<typeof CatalogListItemSchema>;

export type CatalogListItems = z.infer<typeof CatalogListItemsSchema>;

export type VendorEntity = {
  id: string;
  name: string;
  url: string;
  pointOfContact: {
    name: string;
    email: string;
    phone: string;
  };
};

export type VendorCreate = Omit<VendorEntity, 'id'>;

export function validateUrl(path: SchemaPath<string>, options?: { message: string }) {
  return validate(path, ({ value }) => {
    try {
      new URL(value());
      return null;
    } catch {
      return {
        kind: 'url',
        message: options?.message || 'Enter a valid URL',
      };
    }
  });
}
