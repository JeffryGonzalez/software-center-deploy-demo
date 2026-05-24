import { JsonPipe } from '@angular/common';
import { Component, inject, isDevMode, signal } from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  maxLength,
  minLength,
  required,
  validate,
} from '@angular/forms/signals';
import { validateUrl, VendorCreate } from '../data-catalog/types';
import { vendorsStore } from '../data-catalog/vendors-store';

@Component({
  selector: 'app-admin-vendor-add',
  imports: [FormField, FormRoot],
  template: `
    <form class="flex flex-col gap-4 max-w-lg p-8" [formRoot]="vendorForm">
      <div class="flex flex-col w-full">
        <label for="name">Name</label>
        <input
          [formField]="vendorForm.name"
          class="input w-full"
          id="name"
          placeholder="Company Name"
        />
        <div>
          @let nameField = vendorForm.name();
          @if (nameField.touched() && nameField.invalid()) {
            @for (error of nameField.errors(); track error.kind) {
              <span class="label text-error text-xs">{{ error.message }}</span>
            }
          }
        </div>
      </div>
      <div class="flex flex-col w-full">
        <label for="url">Url</label>
        <input [formField]="vendorForm.url" class="input w-full" id="url" placeholder="Url" />
      </div>
      <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend class="fieldset-legend">Point of Contact</legend>
        <div class="flex flex-col w-full">
          <label for="contact-name">Name</label>
          <input
            [formField]="vendorForm.pointOfContact.name"
            class="input w-full"
            id="name"
            placeholder="Name"
          />
        </div>
        <div class="flex flex-col w-full">
          <label for="contact-email">Email</label>
          <input
            [formField]="vendorForm.pointOfContact.email"
            class="input w-full"
            id="email"
            placeholder="email"
          />
        </div>
        <div class="flex flex-col w-full">
          <label for="contact-email">Phone</label>
          <input
            [formField]="vendorForm.pointOfContact.phone"
            class="input w-full"
            id="phone"
            placeholder="phone number"
          />
        </div>
        <div>
          @let poc = vendorForm.pointOfContact();
          @if (poc.touched() && poc.invalid()) {
            @for (error of poc.errors(); track error.kind) {
              <span class="label text-error text-xs">{{ error.message }}</span>
            }
          }
        </div>
      </fieldset>
      <button
        [attr.aria-disabled]="vendorForm().invalid()"
        type="submit"
        class="btn btn-accent aria-disabled:cursor-not-allowed"
      >
        Add Vendor
      </button>
    </form>
    <!-- @defer (when devMode()) {
      <pre>{{ model() | json }}</pre>
    } -->
  `,
  styles: ``,
})
export class VendorAdd {
  devMode = signal(isDevMode());
  store = inject(vendorsStore);
  model = signal<VendorCreate>({
    name: '',
    url: '',
    pointOfContact: {
      name: '',
      email: '',
      phone: '',
    },
  });

  vendorForm = form(
    this.model,
    (schema) => {
      required(schema.name, { message: 'Name is required' });
      minLength(schema.name, 10);
      maxLength(schema.name, 100);
      required(schema.url);
      validateUrl(schema.url, { message: 'COME ON!!!!' });
      required(schema.pointOfContact.name);
      validate(schema.name, ({ value }) => {
        const name = value().trim().toLocaleLowerCase();
        if (this.store.entities().some((e) => e.name.toLowerCase() === name)) {
          return { kind: 'in-use', message: 'We already have that vendor!' };
        } else {
          return;
        }
      });

      validate(schema.pointOfContact, ({ value }) => {
        if (value().email.trim() === '' && value().phone.trim() === '') {
          return {
            kind: 'required',
            message: 'You must provide either a phone or an email address',
          };
        }
        return undefined;
      });
    },
    {
      submission: {
        action: async (value) => {
          const payload = value().controlValue();

          await this.store.add(payload);
          this.vendorForm().reset();
          this.model.set({
            name: '',
            url: '',
            pointOfContact: {
              name: '',
              email: '',
              phone: '',
            },
          });
        },
      },
    },
  );
}
