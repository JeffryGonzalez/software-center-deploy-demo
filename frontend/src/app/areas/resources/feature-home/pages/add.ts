import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, required, validate } from '@angular/forms/signals';
import { PageHeader } from '../../../shared/ui-page-header/page-header';
import { resourcesStore } from '../../data/resources';
import { Resource } from '../../data/types';

const normalize = (t: string) =>
  t
    .trim()
    .toLocaleLowerCase()
    .replace(/[\s_-]+/g, '');

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1).fill(0).map((_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let curr = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const next = Math.min(curr + 1, prev[j] + 1, prev[j - 1] + cost);
      prev[j - 1] = curr;
      curr = next;
    }
    prev[b.length] = curr;
  }
  return prev[b.length];
}

@Component({
  selector: 'app-resources-add',
  imports: [PageHeader, FormField, FormRoot],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Add Resource" description="Share a resource with others" />

    <form class="flex flex-col gap-4 max-w-lg" [formRoot]="resourceForm">
      <div class="flex flex-col w-full">
        <label class="label" for="title">Title</label>
        <input
          class="input w-full"
          id="title"
          placeholder="Title"
          [formField]="resourceForm.title"
        />
        <div>
          @if (resourceForm.title().touched() && resourceForm.title().invalid()) {
            @for (error of resourceForm.title().errors(); track error.kind) {
              <span class="label text-error text-xs">{{ error.message }}</span>
            }
          }
        </div>
      </div>

      <div class="flex flex-col w-full">
        <label for="url">URL</label>

        <input
          class="input w-full"
          id="url"
          type="url"
          placeholder="URL"
          [formField]="resourceForm.url"
        />

        <div>
          @if (resourceForm.url().touched() && resourceForm.url().invalid()) {
            @for (error of resourceForm.url().errors(); track error.kind) {
              <span class="label text-error text-xs">{{ error.message }}</span>
            }
          }
        </div>
      </div>

      <div class="flex flex-col w-full">
        <label for="description">Description</label>
        <textarea
          class="textarea  w-full"
          placeholder="Description"
          [formField]="resourceForm.description"
        ></textarea>
        <div>
          @if (resourceForm.description().touched() && resourceForm.description().invalid()) {
            @for (error of resourceForm.description().errors(); track error.kind) {
              <span class="label text-error text-xs">{{ error.message }}</span>
            }
          }
        </div>
      </div>

      <div class="flex flex-col w-full">
        <label for="tags-input">Tags</label>

        @if (model().tags.length) {
          <ul class="flex flex-wrap gap-2 mb-2">
            @for (tag of model().tags; track tag) {
              <li class="badge badge-primary gap-1">
                {{ tag }}
                <button
                  type="button"
                  class="cursor-pointer"
                  aria-label="Remove tag"
                  (click)="removeTag(tag)"
                >
                  &times;
                </button>
              </li>
            }
          </ul>
        }

        <input
          class="input w-full"
          id="tags-input"
          list="known-tags"
          placeholder="Type a tag, press Enter or comma"
          [value]="draft()"
          (input)="onDraftInput($event)"
          (keydown)="onDraftKey($event)"
          (blur)="commitDraft()"
        />
        <datalist id="known-tags">
          @for (tag of availableTags(); track tag) {
            <option [value]="tag"></option>
          }
        </datalist>

        @if (suggestion(); as s) {
          <div class="alert alert-warning mt-2 py-2 text-sm">
            <span>
              Similar tag already exists: <strong>{{ s.existing }}</strong
              >. Use it instead of <em>{{ s.draft }}</em
              >?
            </span>
            <div class="flex gap-2">
              <button type="button" class="btn btn-xs btn-primary" (click)="acceptSuggestion()">
                Use "{{ s.existing }}"
              </button>
              <button type="button" class="btn btn-xs btn-ghost" (click)="keepDraft()">
                Keep "{{ s.draft }}"
              </button>
            </div>
          </div>
        }
      </div>

      <button
        class="btn btn-primary self-start aria-disabled:opacity-50 aria-disabled:cursor-not-allowed"
        type="submit"
        [attr.aria-disabled]="resourceForm().invalid() || null"
      >
        Add Resource
      </button>
    </form>
  `,
  styles: ``,
})
export class AddPage {
  protected readonly store = inject(resourcesStore);

  readonly model = signal<Omit<Resource, 'id'>>({
    title: '',
    url: '',
    description: '',
    tags: [],
  });

  protected readonly draft = signal('');
  protected readonly suggestion = signal<{ draft: string; existing: string } | null>(null);

  protected readonly availableTags = computed(() => {
    const already = new Set(this.model().tags.map(normalize));
    return this.store.tags().filter((t) => !already.has(normalize(t)));
  });

  protected onDraftInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (value.includes(',')) {
      const parts = value.split(',');
      for (const part of parts.slice(0, -1)) this.tryAdd(part);
      this.draft.set(parts[parts.length - 1]);
    } else {
      this.draft.set(value);
    }
    this.suggestion.set(null);
  }

  protected onDraftKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.commitDraft();
    } else if (event.key === 'Backspace' && !this.draft() && this.model().tags.length) {
      const tags = this.model().tags;
      this.removeTag(tags[tags.length - 1]);
    }
  }

  protected commitDraft() {
    const value = this.draft();
    if (value.trim()) this.tryAdd(value);
  }

  private tryAdd(raw: string) {
    const value = raw.trim();
    if (!value) {
      this.draft.set('');
      return;
    }
    const norm = normalize(value);
    const existingChips = this.model().tags;
    if (existingChips.some((t) => normalize(t) === norm)) {
      this.draft.set('');
      return;
    }
    const candidates = [...this.store.tags(), ...existingChips];
    const near = candidates.find((t) => {
      const n = normalize(t);
      if (n === norm) return true;
      const minLen = Math.min(n.length, norm.length);
      if (minLen < 4) return false;
      return levenshtein(n, norm) <= 2;
    });
    if (near && normalize(near) !== norm) {
      this.suggestion.set({ draft: value, existing: near });
      return;
    }
    this.addTag(value);
  }

  private addTag(value: string) {
    this.model.update((m) => ({ ...m, tags: [...m.tags, value] }));
    this.draft.set('');
    this.suggestion.set(null);
  }

  protected removeTag(tag: string) {
    this.model.update((m) => ({ ...m, tags: m.tags.filter((t) => t !== tag) }));
  }

  protected acceptSuggestion() {
    const s = this.suggestion();
    if (!s) return;
    const existingChips = this.model().tags;
    if (!existingChips.some((t) => normalize(t) === normalize(s.existing))) {
      this.addTag(s.existing);
    } else {
      this.draft.set('');
      this.suggestion.set(null);
    }
  }

  protected keepDraft() {
    const s = this.suggestion();
    if (!s) return;
    this.addTag(s.draft);
  }

  readonly resourceForm = form(
    this.model,
    (s) => {
      validate(s.url, ({ value }) => {
        let url = value();
        if (!/^https?:\/\//.test(url)) {
          url = 'https://' + url;
        }
        try {
          new URL(url);
        } catch {
          return { kind: 'invalid', message: 'Please enter a valid URL' };
        }
        if (this.store.links().some((r) => r === url)) {
          return { kind: 'duplicate', message: 'This URL has already been submitted' };
        }
        return null;
      });
      required(s.title, { message: 'Title is required' });

      required(s.description, { message: 'Description is required' });
    },
    {
      submission: {
        action: async (value) => {
          const payload = value().controlValue();
          if (payload.url && !/^https?:\/\//.test(payload.url)) {
            payload.url = 'https://' + payload.url;
          }
          const result = await this.store.add(payload);
          if (result === 'ok') {
            this.resourceForm().reset();
            this.model.set({ title: '', url: '', description: '', tags: [] });
          } else {
            alert('Failed to add resource: ' + result);
          }
        },
      },
    },
  );
}
