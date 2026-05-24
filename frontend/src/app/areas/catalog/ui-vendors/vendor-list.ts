import { Component, input } from '@angular/core';
import { VendorEntity } from '../data-catalog/types';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-vendors-list',
  imports: [RouterLink],
  template: `
    <div class="flex flex-col gap-4">
      @for (vendor of vendors(); track vendor.id) {
        <div class="card card-border bg-base-100">
          <div class="card-body">
            <a [routerLink]="[vendor.id]" class="card-title">{{ vendor.name }}</a>
            <p>{{ vendor.url }}</p>
            <p>Contact {{ vendor.pointOfContact.name }} at {{ vendor.pointOfContact.email }}</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: ``,
})
export class VendorList {
  vendors = input.required<VendorEntity[]>();
}
