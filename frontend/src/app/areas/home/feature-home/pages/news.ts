import { Component } from '@angular/core';
import { PageHeader } from '../../../shared/ui-page-header/page-header';
import { NewsList } from '../ui/news-list';
import { NewsItem } from '../data/types';
import { httpResource } from '@angular/common/http';

@Component({
  selector: 'app-home-news',
  imports: [PageHeader, NewsList],
  template: `
    <app-page-header title="Angular News" description="Recent News About Angular" />
    <div class="prose max-w-none">
      @if (newsResource.hasValue()) {
        <app-home-news-list [news]="newsResource.value()" />
      }
    </div>
  `,
  styles: ``,
})
export class NewsPage {
  newsResource = httpResource<NewsItem[]>(() => 'https://news.hypertheory.com/angular');
}
