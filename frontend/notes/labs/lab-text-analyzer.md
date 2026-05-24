# Text Analyzer Lab

> **Advanced Track** — This lab assumes you're comfortable with Angular fundamentals and the project's feature pattern. Instructions are less prescriptive than the [Pomodoro lab](./lab-pomodoro.md) — you're expected to figure out the wiring yourself.

You'll build a real-time text analysis tool that computes statistics about any text the user pastes in. This teaches:

- `computed()` chaining — multiple derived signals that depend on each other
- Complex data transformations inside `computed()`
- NgRx Signal Store introduced early (Sprint 5) as the natural home for shared settings
- History management: storing complex objects in store state
- `localStorage` persistence via `withHooks`

---

## Sprint 1 — Scaffold

There is no scaffolding schematic in this project. Create the feature by hand, following the `resources` feature as a reference:

```
src/app/areas/text-analyzer/
└── feature-home/
    ├── text-analyzer.routes.ts
    ├── home.ts
    └── pages/
        └── analyzer.ts
```

Wire it into `src/app/app.routes.ts`:

```typescript
{
  path: 'text-analyzer',
  data: { nav: { label: 'Text Analyzer', icon: 'solarDocument' } },
  loadChildren: () =>
    import('./areas/text-analyzer/feature-home/text-analyzer.routes').then(
      (m) => m.textAnalyzerRoutes,
    ),
},
```

`solarDocument` is already registered in `src/app/areas/shared/util-icons/icons.ts`.

Verify the nav link and the `/text-analyzer` route work before proceeding.

---

## Sprint 2 — Text Input + Basic Stats

Create `pages/analyzer.ts` with an `AnalyzerPage` component, and add it as a child route in `text-analyzer.routes.ts` with `data: { nav: { label: 'Analyze' } }` so it shows up in `<app-area-nav />`.

### The Core Signal

The entire analysis derives from a single `signal`:

```typescript
protected text = signal('');
```

Bind a `<textarea>` to it. Since the rest of the app already uses signal-based forms, the simplest binding is direct:

```html
<textarea
  class="textarea textarea-bordered w-full min-h-40"
  [value]="text()"
  (input)="text.set($any($event.target).value)"
  placeholder="Paste or type text to analyze…"
></textarea>
```

### Computed Chaining

The key insight for this lab is that you can build a chain of computed signals where each one feeds into the next:

```typescript
private words = computed(() => this.text().toLowerCase().match(/\b[a-z']+\b/g) ?? []);

protected wordCount = computed(() => this.words().length);
protected charCount = computed(() => this.text().length);
protected charCountNoSpaces = computed(() => this.text().replace(/\s/g, '').length);
```

Display the stats using [DaisyUI's `stats` component](https://daisyui.com/components/stat/):

```html
<div class="stats stats-horizontal shadow">
  <div class="stat">
    <div class="stat-title">Words</div>
    <div class="stat-value text-primary">{{ wordCount() }}</div>
  </div>
  <!-- chars and others -->
</div>
```

> **Tip**: Wrap the stats in `@if (wordCount() > 0) { ... }` so the page isn't cluttered when the textarea is empty.

### Check Your Work

Paste a paragraph. Word count and character count update in real time.

---

## Sprint 3 — Advanced Stats

Add more computed signals.

### Sentence Count

```typescript
protected sentenceCount = computed(() => {
  const matches = this.text().match(/[^.!?]+[.!?]+/g);
  return matches ? matches.length : this.text().trim().length > 0 ? 1 : 0;
});
```

### Paragraph Count

```typescript
protected paragraphCount = computed(() => {
  const paras = this.text().split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  return paras.length || (this.text().trim().length > 0 ? 1 : 0);
});
```

### Average Word Length and Longest Word

Both derive from the `words()` array — implement them using `Array.reduce`.

### Average Words Per Sentence

```typescript
protected avgWordsPerSentence = computed(() => {
  const sentences = this.sentenceCount();
  if (sentences === 0) return '0';
  return (this.wordCount() / sentences).toFixed(1);
});
```

### Reading Time

Add a placeholder `wpm` signal for now — it will come from the store in Sprint 5:

```typescript
private wpm = signal(200);

private readingTimeSecs = computed(() =>
  Math.ceil((this.wordCount() / this.wpm()) * 60),
);

protected readingTimeFormatted = computed(() => {
  const secs = this.readingTimeSecs();
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return rem > 0 ? `${mins}m ${rem}s` : `${mins}m`;
});
```

### Check Your Work

Paste a multi-paragraph text. Notice changing one signal (`text`) cascades through everything without manual wiring.

---

## Sprint 4 — Keyword Frequency

### Word Frequency Map

```typescript
private wordFrequency = computed(() => {
  const freq = new Map<string, number>();
  for (const word of this.words()) {
    freq.set(word, (freq.get(word) ?? 0) + 1);
  }
  return freq;
});
```

### Top Keywords

```typescript
protected topKeywords = computed(() =>
  [...this.wordFrequency().entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count })),
);
```

```html
@for (kw of topKeywords(); track kw.word) {
  <div class="badge badge-outline gap-1">
    <span class="font-semibold">{{ kw.word }}</span>
    <span class="opacity-50">×{{ kw.count }}</span>
  </div>
}
```

### Problem: Stop Words

The top 10 is probably full of "the", "and", "is", etc. Sprint 5 will make the stop-word list configurable. For now, hardcode a small set to demonstrate the issue:

```typescript
private STOP_WORDS = new Set(['the', 'a', 'an', 'and', 'or', 'is', 'are', 'in', 'of', 'to']);

private wordFrequency = computed(() => {
  const freq = new Map<string, number>();
  for (const word of this.words()) {
    if (this.STOP_WORDS.has(word)) continue;
    freq.set(word, (freq.get(word) ?? 0) + 1);
  }
  return freq;
});
```

### Check Your Work

Paste a technical article. Top keywords should reflect the actual subject matter.

---

## Sprint 5 — Settings Page + Signal Store

`wpm` and stop-word exclusions need to be configurable and shared across pages. Time for a store.

### Create the Store

`src/app/areas/text-analyzer/data/store.ts`:

```typescript
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

const DEFAULT_STOP_WORDS = [
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'it', 'its', 'this', 'that', 'i', 'you', 'he', 'she', 'we',
  'they', 'not', 'so', 'if', 'as', 'what', 'which', 'who',
];

export const textAnalyzerStore = signalStore(
  withState({
    wpm: 200,
    minWordLength: 3,
    excludedWords: DEFAULT_STOP_WORDS,
  }),
  withMethods((store) => ({
    setWpm(wpm: number): void {
      patchState(store, { wpm: Math.max(50, Math.min(600, wpm)) });
    },
    setMinWordLength(length: number): void {
      patchState(store, { minWordLength: Math.max(1, Math.min(10, length)) });
    },
  })),
);
```

Provide it on the feature route (so both Analyzer and Settings share one instance — see how `resources.routes.ts` does this):

```typescript
{
  path: '',
  component: Home,
  providers: [textAnalyzerStore],
  // ...
}
```

### Update the Analyzer Page

Replace the local `wpm = signal(200)` and the hardcoded stop words with store values:

```typescript
protected store = inject(textAnalyzerStore);

private readingTimeSecs = computed(() =>
  Math.ceil((this.wordCount() / this.store.wpm()) * 60),
);

private wordFrequency = computed(() => {
  const excluded = new Set(this.store.excludedWords());
  const minLen = this.store.minWordLength();
  const freq = new Map<string, number>();
  for (const word of this.words()) {
    if (word.length < minLen || excluded.has(word)) continue;
    freq.set(word, (freq.get(word) ?? 0) + 1);
  }
  return freq;
});
```

### Create the Settings Page

Create `pages/settings.ts`. Inject `textAnalyzerStore` and add:

- A `range` slider for WPM (50–600)
- A `range` slider for minimum keyword length (1–10)
- A note about how many stop words are excluded

Add the settings route with `data: { nav: { label: 'Settings' } }`.

### Check Your Work

1. Paste text in the Analyzer. Note the reading time.
2. Go to Settings, drag WPM way up.
3. Return to Analyzer — reading time updated reactively without your touching the text.

---

## Sprint 6 — History

### Extend the Store

```typescript
export type AnalysisSnapshot = {
  id: string;
  savedAt: string;
  excerpt: string;
  wordCount: number;
  charCount: number;
  readingTimeSecs: number;
  topKeywords: Array<{ word: string; count: number }>;
};
```

Add `history: AnalysisSnapshot[]` to `withState`. Add methods:

```typescript
addToHistory(snapshot: AnalysisSnapshot): void {
  patchState(store, { history: [snapshot, ...store.history()].slice(0, 20) });
},
clearHistory(): void {
  patchState(store, { history: [] });
},
```

### Save Button in Analyzer

```typescript
protected saveToHistory(): void {
  const snapshot: AnalysisSnapshot = {
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
    excerpt: this.text().slice(0, 200) + (this.text().length > 200 ? '…' : ''),
    wordCount: this.wordCount(),
    charCount: this.charCount(),
    readingTimeSecs: this.readingTimeSecs(),
    topKeywords: this.topKeywords().slice(0, 5),
  };
  this.store.addToHistory(snapshot);
}
```

### Create the History Page

`pages/history.ts`. Display `store.history()` as a list with excerpt, stats, top keywords. Add a "Clear All" button.

> Tip: Use `DatePipe` from `@angular/common` to format `savedAt`.

### Check Your Work

1. Paste several texts, save each one.
2. History tab shows them.
3. "Clear All" empties the list.
4. (Sprint 7 will make this survive a reload.)

---

## Sprint 7 — Persistence

Use `withHooks` + `effect` to persist the entire store state to `localStorage`.

The pattern mirrors the Pomodoro lab's Sprint 7:

```typescript
import { effect } from '@angular/core';
import { withHooks } from '@ngrx/signals';

withHooks({
  onInit(store) {
    const saved = localStorage.getItem('text-analyzer-state');
    if (saved) patchState(store, JSON.parse(saved));
    effect(() => {
      localStorage.setItem(
        'text-analyzer-state',
        JSON.stringify({
          wpm: store.wpm(),
          minWordLength: store.minWordLength(),
          excludedWords: store.excludedWords(),
          history: store.history(),
        }),
      );
    });
  },
}),
```

### Check Your Work

1. Save analyses, reload, history still there.
2. WPM preference preserved.

---

## Finished?

Stretch goals:

- **Unique word ratio**: `computed(() => (uniqueWordCount() / wordCount() * 100).toFixed(1) + '%')`
- **Readability score**: Implement [Flesch Reading Ease](https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests).
- **Compare mode**: Save two analyses, display side-by-side.
- **Export**: Copy stats as formatted text using `navigator.clipboard.writeText()`.
- **Custom stop words**: Text input in Settings to add/remove words.

---

## To Learn More About…

> _Use your AI coding assistant as a learning tool — not just a code generator. The prompts below are starting points; rewrite them in your own voice._

**The cost of `computed`.** When does it become a performance problem?

> "I have eight `computed()` signals chained together in an Angular component, all keyed off a single `text` signal. The user is typing in a textarea, so the source signal updates on every keystroke. Walk me through what _actually_ happens on each keystroke — what gets re-evaluated, what gets memoized, where the cost is. When would I need to worry about it?"

**Working with `Map` and `Set` reactively.** Subtle gotcha.

> "I'm returning a `Map` from a `computed()` signal in Angular. If I `.set()` a key on it later, do dependent signals re-run? Why or why not? What's the idiomatic way to update map-like state with signals?"

**Regex over user input.** This lab uses regex a lot.

> "The text analyzer uses regex to extract words, sentences, and paragraphs. Where are the edge cases hiding? Give me five inputs that would produce technically-correct-but-surprising results, and explain why for each one."

**Stores vs. component state.** Why move things out of the component at all?

> "I had `wpm` as a local signal in my Analyzer component. Then I moved it to a signalStore. From the user's perspective, what changed? From a maintainability perspective, what changed? When would moving it to the store be the _wrong_ call?"

**Persistence pitfalls.** `JSON.stringify` is more fragile than it looks.

> "I'm persisting an NgRx signalStore to `localStorage` with `JSON.stringify` and reading it back with `JSON.parse`. Show me what breaks when (a) I add a new field to the state, (b) I rename a field, (c) a user has stale data from an old version. What's a migration strategy that doesn't suck?"

**Compare and contrast.** Once you finish the lab:

> "Here's my text analyzer \[paste it]. Also write your own version solving the same problem. Don't tell me yours yet — first explain three things you'd do differently and why. Then show me yours so I can compare."
