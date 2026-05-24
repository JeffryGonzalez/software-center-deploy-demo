import { Component } from '@angular/core';
import { PageHeader } from '../../../shared/ui-page-header/page-header';

@Component({
  selector: 'app-demos-overview',
  imports: [PageHeader],
  template: `
    <app-page-header title="Various Demos" description="Instructor Demos" />
    <div class="prose max-w-none"></div>
  `,
  styles: ``,
})
export class OverviewPage {}
