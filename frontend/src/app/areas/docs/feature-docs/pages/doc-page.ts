import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { PageHeader } from '../../../shared/ui-page-header/page-header';
import { DocsService } from '../../data/docs-service';

@Component({
  selector: 'app-docs-doc',
  imports: [PageHeader],
  template: `
    <app-page-header [title]="title()" />
    @if (content(); as html) {
      <div
        class="prose max-w-none prose-h1:text-secondary prose-headings:text-primary"
        [innerHTML]="html"
      ></div>
    }
  `,
  styles: ``,
})
export class DocPage {
  private route = inject(ActivatedRoute);
  private docs = inject(DocsService);

  protected title = computed(() => {
    const nav = this.route.snapshot.data['nav'] as { label?: string } | undefined;
    return nav?.label ?? '';
  });

  private slug = this.route.snapshot.data['slug'] as string;
  protected content = toSignal(this.docs.load(this.slug));
}
