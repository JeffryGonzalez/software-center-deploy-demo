import { Component } from '@angular/core';
import { PageHeader } from '../../../shared/ui-page-header/page-header';
import { httpResource } from '@angular/common/http';
import { JsonPipe } from '@angular/common';

export type Recipe = {
  id: string;
  name: string;
  longNarrative: string;
  steps: string[];
};

@Component({
  selector: 'app-home-recipes',
  imports: [PageHeader, JsonPipe],
  template: `
    <app-page-header title="Page Title" description="Page description." />
    <div class="prose max-w-none">
      <ul>
        @for (r of recipeResource.value(); track r.id) {
          <li>
            <pre> {{ r | json }}</pre>
          </li>
        }
      </ul>
    </div>
  `,
  styles: ``,
})
export class RecipesPage {
  recipeResource = httpResource<Recipe[]>(() => 'https://recipes.com/api/my-recipes');
}
