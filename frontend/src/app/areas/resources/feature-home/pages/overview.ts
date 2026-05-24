import { Component } from '@angular/core';
import { PageHeader } from '../../../shared/ui-page-header/page-header';
import { List } from '../../ui/list';

@Component({
  selector: 'app-features-overview',
  imports: [PageHeader, List],
  template: `
    <app-page-header title="List" description="Resources For Developers" />
    <div class="prose max-w-none"></div>
    <app-resources-list />
  `,
  styles: ``,
})
export class OverviewPage {}
