import { Component } from '@angular/core';
import { PageHeader } from '../../../shared/ui-page-header/page-header';

@Component({
  selector: 'app-home-overview',
  imports: [PageHeader],
  template: `
    <app-page-header title="Overview" description="This Course"> </app-page-header>
    <div class="prose max-w-none">
      <p>
        This course is designed to help developers that have learned their way around Angular to
        deepen their understanding and build more complex applications.
      </p>
    </div>
  `,
  styles: ``,
})
export class OverviewPage {}
