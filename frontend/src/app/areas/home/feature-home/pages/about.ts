import { Component } from '@angular/core';
import { PageHeader } from '../../../shared/ui-page-header/page-header';

@Component({
  selector: 'app-home-about',
  imports: [PageHeader],
  template: `
    <app-page-header title="About" description="About this application." />
    <div class="prose max-w-none">
      <p>
        This is a starter application for learning Angular. It provides a foundation for building
        more complex applications and understanding Angular's core concepts.
      </p>
    </div>
  `,
  styles: ``,
})
export class AboutPage {}
