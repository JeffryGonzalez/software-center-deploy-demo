import { http, HttpHandler, HttpResponse, delay } from 'msw';
import activeScenarios from '../active-scenarios';

const ENDPOINT = '/api/vendors';

const typicalVendors = [
  {
    id: '1',
    name: 'Microsoft',
    url: 'https://microsoft.com',
    pointOfContact: { name: 'Alice Nguyen', email: 'alice@microsoft.com', phone: '555-0101' },
  },
  {
    id: '2',
    name: 'Adobe',
    url: 'https://adobe.com',
    pointOfContact: { name: 'Bob Chen', email: 'bob@adobe.com', phone: '555-0102' },
  },
  {
    id: '3',
    name: 'Salesforce',
    url: 'https://salesforce.com',
    pointOfContact: { name: 'Carol Smith', email: 'carol@salesforce.com', phone: '555-0103' },
  },
  {
    id: '4',
    name: 'GitHub',
    url: 'https://github.com',
    pointOfContact: { name: 'Dan Park', email: 'dan@github.com', phone: '555-0104' },
  },
  {
    id: '5',
    name: 'Docker',
    url: 'https://docker.com',
    pointOfContact: { name: 'Eva Torres', email: 'eva@docker.com', phone: '555-0105' },
  },
  {
    id: '6',
    name: 'AgileBits',
    url: 'https://1password.com',
    pointOfContact: { name: 'Frank Lee', email: 'frank@agilebits.com', phone: '555-0106' },
  },
];

const overloadedVendors = Array.from({ length: 40 }, (_, i) => ({
  id: String(i + 1),
  name: `Vendor ${i + 1}`,
  url: `https://vendor${i + 1}.example.com`,
  pointOfContact: {
    name: `Contact ${i + 1}`,
    email: `contact${i + 1}@vendor${i + 1}.example.com`,
    phone: `555-${String(i + 1).padStart(4, '0')}`,
  },
}));

export default [
  http.get(ENDPOINT, async () => {
    const scenario = activeScenarios[`GET ${ENDPOINT}`] ?? 'typical';

    switch (scenario) {
      case 'empty':
        return HttpResponse.json([]);

      case 'overloaded':
        return HttpResponse.json(overloadedVendors);

      case 'slow':
        await delay(2000);
        return HttpResponse.json(typicalVendors);

      case 'server-error':
        return new HttpResponse(null, { status: 500 });

      case 'typical':
      default:
        return HttpResponse.json(typicalVendors);
    }
  }),

  http.post(ENDPOINT, async ({ request }) => {
    const scenario = activeScenarios[`POST ${ENDPOINT}`] ?? 'success';

    switch (scenario) {
      case 'slow':
        await delay(1000);
        return HttpResponse.json(
          { ...((await request.json()) as object), id: crypto.randomUUID() },
          { status: 201 },
        );

      case 'server-error':
        return new HttpResponse(null, { status: 500 });

      case 'success':
      default:
        return HttpResponse.json(
          { ...((await request.json()) as object), id: crypto.randomUUID() },
          { status: 201 },
        );
    }
  }),
] as HttpHandler[];
