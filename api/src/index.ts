import cors from "cors";
import express from "express";
import { catalogRouter } from "./routes/catalog.js";
import { vendorsRouter } from "./routes/vendors.js";
import { seedIfEmpty } from "./seed.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/vendors", vendorsRouter);
app.use("/api/catalog", catalogRouter);

// ── Seed + Start ─────────────────────────────────────────────────────────────
seedIfEmpty();

app.listen(PORT, () => {
  console.log(`\nCatalog API → http://localhost:${PORT}\n`);
  console.log("  GET    /api/vendors");
  console.log("  POST   /api/vendors");
  console.log("  GET    /api/vendors/:vendorId/items");
  console.log("  POST   /api/vendors/:vendorId/items");
  console.log("  GET    /api/catalog");
  console.log();
});
