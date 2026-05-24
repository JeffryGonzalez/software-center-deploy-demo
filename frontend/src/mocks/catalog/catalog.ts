import { http, HttpHandler, HttpResponse, delay } from 'msw';
import activeScenarios from '../active-scenarios';

const ENDPOINT = '/api/catalog';

const typicalCatalog = [
  { id: '1', title: 'Microsoft 365', vendor: 'Microsoft' },
  { id: '2', title: 'Visual Studio Code', vendor: 'Microsoft' },
  { id: '3', title: 'Slack', vendor: 'Salesforce' },
  { id: '4', title: 'Zoom', vendor: 'Zoom Video Communications' },
  { id: '5', title: 'GitHub Enterprise', vendor: 'GitHub' },
  { id: '6', title: 'Docker Desktop', vendor: 'Docker' },
  { id: '7', title: 'Figma', vendor: 'Adobe' },
  { id: '8', title: '1Password', vendor: 'AgileBits' },
];

const malformedCatalog = [
  { id: '1', title: '', vendor: 'Microsoft' },
  { id: '2', title: 'Visual Studio Code' },
  { id: '3', vendor: 'Salesforce' },
  { id: '4', title: null, vendor: null },
];

const overloadedCatalog = Array.from({ length: 80 }, (_, i) => ({
  id: String(i + 1),
  title: `Approved Software ${i + 1}`,
  vendor: `Vendor ${(i % 10) + 1}`,
}));

export default [
  http.get(ENDPOINT, async () => {
    const scenario = activeScenarios[`GET ${ENDPOINT}`] ?? 'typical';

    switch (scenario) {
      case 'empty':
        return HttpResponse.json([]);

      case 'overloaded':
        return HttpResponse.json(overloadedCatalog);

      case 'slow':
        await delay(1000);
        return HttpResponse.json(typicalCatalog);

      case 'malformed-data':
        return HttpResponse.json(malformedCatalog);

      case 'server-error':
        return new HttpResponse(null, { status: 500 });

      case 'typical':
      default:
        return HttpResponse.json(typicalCatalog);
    }
  }),
] as HttpHandler[];
