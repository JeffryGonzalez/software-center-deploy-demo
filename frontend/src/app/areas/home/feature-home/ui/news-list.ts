import { Component, input } from '@angular/core';
import { NewsItem } from '../data/types';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home-news-list',
  imports: [DatePipe],
  template: `
    <!--  @for replaces *ngFor, @if replaces *ngIf, etc.-->
    @for (item of news(); track item.id) {
      <div>
        <p class="text-xl text-secondary">{{ item.title }}</p>
        <p>{{ item.body }}</p>
        <p>{{ item.published | date }}</p>
      </div>
    }
  `,
  styles: ``,
})
export class NewsList {
  news = input.required<NewsItem[]>();
}
