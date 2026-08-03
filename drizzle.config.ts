import { defineConfig } from "drizzle-kit";

// Drizzle Kit config para D1 (SQLite)
// Genera migraciones en ./drizzle/migrations aplicables con wrangler d1 migrations apply
export default defineConfig({
  schema: "./app/lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "sqlite",
  casing: "snake_case",
  verbose: true,
  strict: true,
});
