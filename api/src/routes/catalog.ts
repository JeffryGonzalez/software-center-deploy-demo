import { Router } from "express";
import { db } from "../db.js";

export const catalogRouter = Router();

// ── GET /api/catalog ─────────────────────────────────────────────────────────
// Returns all vendor items flattened with the vendor's name — matches the
// CatalogListItem shape { id, title, vendor } used by the frontend.

catalogRouter.get("/", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT vi.id, vi.title, v.name AS vendor
       FROM vendor_items vi
       JOIN vendors v ON vi.vendor_id = v.id
       ORDER BY vi.title`,
    )
    .all();

  res.json(rows);
});
