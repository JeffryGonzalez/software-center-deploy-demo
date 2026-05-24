import { http, HttpHandler, HttpResponse, delay } from 'msw';
import activeScenarios from '../active-scenarios';

const ENDPOINT = '/api/vendors/:vendorId/items';

type VendorCatalogItem = {
  id: string;
  title: string;
  version: string;
};

const itemsByVendor: Record<string, VendorCatalogItem[]> = {
  '1': [
    { id: 'ms-1', title: 'Microsoft 365', version: '2024' },
    { id: 'ms-2', title: 'Visual Studio Code', version: '1.89.0' },
    { id: 'ms-3', title: 'Azure DevOps', version: '2024.1' },
  ],
  '2': [
    { id: 'ad-1', title: 'Adobe Acrobat', version: '24.0' },
    { id: 'ad-2', title: 'Creative Cloud', version: '2024' },
    { id: 'ad-3', title: 'Figma', version: '116.0' },
  ],
  '3': [
    { id: 'sf-1', title: 'Salesforce CRM', version: "Spring '24" },
    { id: 'sf-2', title: 'Slack', version: '4.38.0' },
    { id: 'sf-3', title: 'Tableau', version: '2024.1' },
  ],
  '4': [
    { id: 'gh-1', title: 'GitHub Enterprise', version: '3.12' },
    { id: 'gh-2', title: 'GitHub Actions', version: '2.317.0' },
    { id: 'gh-3', title: 'GitHub Copilot', version: '1.0' },
  ],
  '5': [
    { id: 'dk-1', title: 'Docker Desktop', version: '4.30.0' },
    { id: 'dk-2', title: 'Docker Hub Pro', version: '1.0' },
  ],
  '6': [
    { id: 'ab-1', title: '1Password Teams', version: '8.10.0' },
    { id: 'ab-2', title: '1Password CLI', version: '2.25.0' },
  ],
};

const overloadedItems: VendorCatalogItem[] = Array.from({ length: 30 }, (_, i) => ({
  id: `item-${i + 1}`,
  title: `Catalog Item ${i + 1}`,
  version: `${Math.floor(i / 10) + 1}.${i % 10}.0`,
}));

export default [
  http.get(ENDPOINT, async ({ params }) => {
    const vendorId = params['vendorId'] as string;
    const scenario = activeScenarios[`GET ${ENDPOINT}`] ?? 'typical';

    switch (scenario) {
      case 'empty':
        return HttpResponse.json([]);

      case 'overloaded':
        return HttpResponse.json(overloadedItems);

      case 'slow':
        await delay(2000);
        return HttpResponse.json(itemsByVendor[vendorId] ?? []);

      case 'unknown-vendor':
        return new HttpResponse(null, { status: 404 });

      case 'server-error':
        return new HttpResponse(null, { status: 500 });

      case 'typical':
      default:
        return HttpResponse.json(itemsByVendor[vendorId] ?? []);
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
