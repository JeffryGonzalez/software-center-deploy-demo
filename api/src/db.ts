import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "..", "catalog.db");

export const db = new DatabaseSync(DB_PATH);

db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS vendors (
    id        TEXT PRIMARY KEY,
    name      TEXT NOT NULL,
    url       TEXT NOT NULL,
    poc_name  TEXT NOT NULL,
    poc_email TEXT NOT NULL,
    poc_phone TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS vendor_items (
    id        TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    title     TEXT NOT NULL,
    version   TEXT NOT NULL
  );
`);

export { randomUUID };
