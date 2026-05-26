import { http, HttpHandler, HttpResponse, delay } from 'msw';
import activeScenarios from '../active-scenarios';

const ENDPOINT = 'https://recipes.com/api/my-recipes';

type Recipe = {
  id: string;
  name: string;
  longNarrative: string;
  steps: string[];
};

const typicalRecipes: Recipe[] = [
  {
    id: 'r-1',
    name: 'Spicy Tomato Pasta',
    longNarrative: 'A fast weeknight pasta with tomato, garlic, and chili flakes.',
    steps: ['Boil pasta', 'Simmer sauce', 'Combine and serve'],
  },
  {
    id: 'r-2',
    name: 'Sheet Pan Chicken and Veg',
    longNarrative: 'A one-pan dinner that roasts quickly with minimal cleanup.',
    steps: ['Prep vegetables', 'Season chicken', 'Roast until done'],
  },
  {
    id: 'r-3',
    name: 'Overnight Oats',
    longNarrative: 'A make-ahead breakfast with fruit and seeds for busy mornings.',
    steps: ['Mix oats and milk', 'Chill overnight', 'Top and eat'],
  },
];

const largeRecipes: Recipe[] = Array.from({ length: 300 }, (_, i) => ({
  id: `r-large-${i + 1}`,
  name: `Recipe ${i + 1}`,
  longNarrative: `Long-form narrative for recipe ${i + 1}. This stresses rendering in the JSON <pre> view when many items are returned.`,
  steps: ['Prep ingredients', 'Cook according to recipe', 'Plate and serve'],
}));

const malformedRecipes = [
  {
    id: 'bad-1',
    name: null,
    longNarrative: 'Narrative present but name is null to test fallback rendering.',
    steps: ['Step exists'],
  },
  {
    id: 'bad-2',
    longNarrative: null,
    steps: null,
  },
] as unknown as Recipe[];

const duplicateIdRecipes: Recipe[] = [
  {
    id: 'dup-1',
    name: 'First Duplicate',
    longNarrative: 'Used to test @for tracking collisions.',
    steps: ['A', 'B'],
  },
  {
    id: 'dup-1',
    name: 'Second Duplicate',
    longNarrative: 'Same id as first item to test row stability.',
    steps: ['C', 'D'],
  },
];

export default [
  http.get(ENDPOINT, async () => {
    const scenario = activeScenarios[`GET ${ENDPOINT}`] ?? 'typical';

    switch (scenario) {
      case 'large':
        return HttpResponse.json(largeRecipes);

      case 'empty':
        return HttpResponse.json([]);

      case 'null-body':
        return HttpResponse.json(null);

      case 'malformed-data':
        return HttpResponse.json(malformedRecipes);

      case 'duplicate-ids':
        return HttpResponse.json(duplicateIdRecipes);

      case 'unauthorized':
        return new HttpResponse(null, { status: 401 });

      case 'server-error':
        return new HttpResponse(null, { status: 500 });

      case 'slow':
        await delay('real');
        return HttpResponse.json(typicalRecipes);

      case 'timeout':
        await delay('infinite');
        return HttpResponse.json(typicalRecipes);

      case 'typical':
      default:
        return HttpResponse.json(typicalRecipes);
    }
  }),
] as HttpHandler[];
