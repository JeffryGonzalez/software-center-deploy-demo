import { Component } from '@angular/core';
import { PageHeader } from '../../../shared/ui-page-header/page-header';

@Component({
  selector: 'app-admin-overview',
  imports: [PageHeader],
  template: `
    <app-page-header title="Admin" description="Overview of Admin Stuff" />
    <div class="prose max-w-none"></div>
  `,
  styles: ``,
})
export class OverviewPage {}
