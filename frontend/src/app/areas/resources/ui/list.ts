import { Component, computed, inject, signal } from '@angular/core';
import { resourcesStore } from '../data/resources';

@Component({
  selector: 'app-resources-list',
  imports: [],
  template: `
    @if (allTags().length) {
      <div class="flex flex-wrap gap-2 mb-4">
        @for (tag of allTags(); track tag) {
          <button
            class="badge badge-sm cursor-pointer"
            [class.badge-secondary]="selectedTags().has(tag)"
            [class.badge-ghost]="!selectedTags().has(tag)"
            (click)="toggleTag(tag)"
          >
            {{ tag }}
          </button>
        }
      </div>
    }
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      @for (resource of filteredResources(); track resource.id) {
        <div class="card card-border bg-base-100">
          <div class="card-body">
            <a class="card-title" [href]="resource.url" target="_blank">
              <div class="flex flex-col">
                <h2 class="text-accent">
                  {{ resource.title }}
                </h2>
              </div>
            </a>
            <a
              class="text-xs opacity-70 font-mono mb-1 truncate"
              [href]="resource.url"
              target="_blank"
            >
              {{ resource.url }}
            </a>
            <p class="text-sm opacity-70 grow">{{ resource.description }}</p>
            <div class="card-actions mt-2">
              @for (tag of resource.tags; track tag) {
                <button
                  class="badge badge-sm cursor-pointer"
                  [class.badge-secondary]="selectedTags().has(tag)"
                  [class.badge-soft]="!selectedTags().has(tag)"
                  [class.badge-ghost]="!selectedTags().has(tag)"
                  (click)="toggleTag(tag)"
                >
                  {{ tag }}
                </button>
              }
            </div>
          </div>
        </div>
      } @empty {
        <p class="text-sm opacity-50 col-span-full">No resources found.</p>
      }
    </div>
  `,
  styles: ``,
})
export class List {
  protected readonly store = inject(resourcesStore);

  protected readonly selectedTags = signal<Set<string>>(new Set());

  protected readonly allTags = computed(() => {
    const tags = new Set<string>();
    for (const resource of this.store.entities()) {
      for (const tag of resource.tags) tags.add(tag);
    }
    return [...tags].sort();
  });

  protected readonly filteredResources = computed(() => {
    const selected = this.selectedTags();
    if (selected.size === 0) return this.store.entities();
    return this.store.entities().filter((r) => r.tags.some((t) => selected.has(t)));
  });

  protected toggleTag(tag: string) {
    this.selectedTags.update((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }
}
