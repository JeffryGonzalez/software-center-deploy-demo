import { Router } from "express";
import { db, randomUUID } from "../db.js";

export const vendorsRouter = Router();

// ── Types ────────────────────────────────────────────────────────────────────

interface VendorRow {
  id: string;
  name: string;
  url: string;
  poc_name: string;
  poc_email: string;
  poc_phone: string;
}

interface ItemRow {
  id: string;
  title: string;
  version: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toVendorEntity(row: VendorRow) {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    pointOfContact: {
      name: row.poc_name,
      email: row.poc_email,
      phone: row.poc_phone,
    },
  };
}

// ── GET /api/vendors ─────────────────────────────────────────────────────────

vendorsRouter.get("/", (_req, res) => {
  const rows = db
    .prepare("SELECT * FROM vendors ORDER BY name")
    .all() as VendorRow[];
  res.json(rows.map(toVendorEntity));
});

// ── POST /api/vendors ────────────────────────────────────────────────────────

vendorsRouter.post("/", (req, res) => {
  const { name, url, pointOfContact } = req.body as {
    name?: string;
    url?: string;
    pointOfContact?: { name?: string; email?: string; phone?: string };
  };

  if (
    !name ||
    !url ||
    !pointOfContact?.name ||
    !pointOfContact?.email ||
    !pointOfContact?.phone
  ) {
    res.status(400).json({
      error:
        "name, url, and pointOfContact (name, email, phone) are all required",
    });
    return;
  }

  const id = randomUUID();
  db.prepare(
    "INSERT INTO vendors (id, name, url, poc_name, poc_email, poc_phone) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(
    id,
    name,
    url,
    pointOfContact.name,
    pointOfContact.email,
    pointOfContact.phone,
  );

  res.status(201).json({ id, name, url, pointOfContact });
});

// ── GET /api/vendors/:vendorId/items ─────────────────────────────────────────

vendorsRouter.get("/:vendorId/items", (req, res) => {
  const { vendorId } = req.params;
  const vendor = db
    .prepare("SELECT id FROM vendors WHERE id = ?")
    .get(vendorId);

  if (!vendor) {
    res.status(404).json({ error: "Vendor not found" });
    return;
  }

  const items = db
    .prepare(
      "SELECT id, title, version FROM vendor_items WHERE vendor_id = ? ORDER BY title",
    )
    .all(vendorId) as ItemRow[];

  res.json(items);
});

// ── POST /api/vendors/:vendorId/items ────────────────────────────────────────

vendorsRouter.post("/:vendorId/items", (req, res) => {
  const { vendorId } = req.params;
  const vendor = db
    .prepare("SELECT id FROM vendors WHERE id = ?")
    .get(vendorId);

  if (!vendor) {
    res.status(404).json({ error: "Vendor not found" });
    return;
  }

  const { title, version } = req.body as { title?: string; version?: string };

  if (!title || !version) {
    res.status(400).json({ error: "title and version are required" });
    return;
  }

  const id = randomUUID();
  db.prepare(
    "INSERT INTO vendor_items (id, vendor_id, title, version) VALUES (?, ?, ?, ?)",
  ).run(id, vendorId, title, version);

  res.status(201).json({ id, title, version });
});
