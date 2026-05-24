import { db } from "./db.js";

// Matches the vendor IDs and contact details from the frontend MSW mock (vendors.ts)
const vendors = [
  {
    id: "1",
    name: "Microsoft",
    url: "https://microsoft.com",
    poc_name: "Alice Nguyen",
    poc_email: "alice@microsoft.com",
    poc_phone: "555-0101",
  },
  {
    id: "2",
    name: "Adobe",
    url: "https://adobe.com",
    poc_name: "Bob Chen",
    poc_email: "bob@adobe.com",
    poc_phone: "555-0102",
  },
  {
    id: "3",
    name: "Salesforce",
    url: "https://salesforce.com",
    poc_name: "Carol Smith",
    poc_email: "carol@salesforce.com",
    poc_phone: "555-0103",
  },
  {
    id: "4",
    name: "GitHub",
    url: "https://github.com",
    poc_name: "Dan Park",
    poc_email: "dan@github.com",
    poc_phone: "555-0104",
  },
  {
    id: "5",
    name: "Docker",
    url: "https://docker.com",
    poc_name: "Eva Torres",
    poc_email: "eva@docker.com",
    poc_phone: "555-0105",
  },
  {
    id: "6",
    name: "AgileBits",
    url: "https://1password.com",
    poc_name: "Frank Lee",
    poc_email: "frank@agilebits.com",
    poc_phone: "555-0106",
  },
];

// Matches the per-vendor item data from the frontend MSW mock (vendor-items.ts)
const vendorItems = [
  { id: "ms-1", vendor_id: "1", title: "Microsoft 365", version: "2024" },
  {
    id: "ms-2",
    vendor_id: "1",
    title: "Visual Studio Code",
    version: "1.89.0",
  },
  { id: "ms-3", vendor_id: "1", title: "Azure DevOps", version: "2024.1" },
  { id: "ad-1", vendor_id: "2", title: "Adobe Acrobat", version: "24.0" },
  { id: "ad-2", vendor_id: "2", title: "Creative Cloud", version: "2024" },
  { id: "ad-3", vendor_id: "2", title: "Figma", version: "116.0" },
  {
    id: "sf-1",
    vendor_id: "3",
    title: "Salesforce CRM",
    version: "Spring '24",
  },
  { id: "sf-2", vendor_id: "3", title: "Slack", version: "4.38.0" },
  { id: "sf-3", vendor_id: "3", title: "Tableau", version: "2024.1" },
  { id: "gh-1", vendor_id: "4", title: "GitHub Enterprise", version: "3.12" },
  { id: "gh-2", vendor_id: "4", title: "GitHub Actions", version: "2.317.0" },
  { id: "gh-3", vendor_id: "4", title: "GitHub Copilot", version: "1.0" },
  { id: "dk-1", vendor_id: "5", title: "Docker Desktop", version: "4.30.0" },
  { id: "dk-2", vendor_id: "5", title: "Docker Hub Pro", version: "1.0" },
  { id: "ab-1", vendor_id: "6", title: "1Password Teams", version: "8.10.0" },
  { id: "ab-2", vendor_id: "6", title: "1Password CLI", version: "2.25.0" },
];

export function seedIfEmpty(): void {
  const { count } = db
    .prepare("SELECT COUNT(*) AS count FROM vendors")
    .get() as { count: number };

  if (count > 0) return;

  const insertVendor = db.prepare(
    "INSERT INTO vendors (id, name, url, poc_name, poc_email, poc_phone) VALUES (?, ?, ?, ?, ?, ?)",
  );
  const insertItem = db.prepare(
    "INSERT INTO vendor_items (id, vendor_id, title, version) VALUES (?, ?, ?, ?)",
  );

  db.exec("BEGIN");
  try {
    for (const v of vendors) {
      insertVendor.run(
        v.id,
        v.name,
        v.url,
        v.poc_name,
        v.poc_email,
        v.poc_phone,
      );
    }
    for (const item of vendorItems) {
      insertItem.run(item.id, item.vendor_id, item.title, item.version);
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }

  console.log(
    `  Seeded ${vendors.length} vendors and ${vendorItems.length} catalog items.`,
  );
}
