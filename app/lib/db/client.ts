import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

/**
 * Crea una instancia tipada de Drizzle sobre el binding D1 de Cloudflare.
 * Uso en loaders/actions: `const db = getDb(context.cloudflare.env.DB);`
 */
export function getDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type Database = ReturnType<typeof getDb>;
export { schema };
