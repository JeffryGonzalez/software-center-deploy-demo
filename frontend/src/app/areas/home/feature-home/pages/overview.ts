import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-overview',
  imports: [RouterLink],
  template: `
    <div class="max-w-2xl">
      <h2 class="text-3xl font-bold mb-2">Software Center</h2>
      <p class="text-base-content/70 mb-8">
        Manage your organization's software catalog — track vendors, versions, and approved
        software.
      </p>
      <div class="flex gap-4">
        <a routerLink="/catalog" class="btn btn-primary">View Catalog</a>
        <a routerLink="/admin" class="btn btn-outline">Admin</a>
      </div>
    </div>
  `,
})
export class OverviewPage {}
