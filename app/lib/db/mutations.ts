import { eq, asc, desc, sql } from "drizzle-orm";
import type { Database } from "./client";
import {
  products,
  categories,
  productImages,
  productOccasions,
  quotes,
  settings,
  sessions,
} from "./schema";

/**
 * ============================================================
 * Capa de escritura (CRUD) para el CMS.
 * Todas las funciones son tipadas y parametrizadas (anti SQLi).
 * ============================================================
 */

const now = sql`(strftime('%s', 'now'))`;

/* ---------------- PRODUCTOS ---------------- */

export type ProductInput = {
  name: string;
  slug: string;
  code: string;
  categoryId: number | null;
  shortDesc: string | null;
  longDesc: string | null;
  price: number;
  priceType: "unitario" | "desde" | "por_cantidad";
  minQty: number;
  material: string | null;
  colors: string | null; // JSON
  dimensions: string | null;
  weight: string | null;
  leadTime: string | null;
  customization: string | null;
  active: boolean;
  featured: boolean;
  featuredOrder: number;
  seoTitle: string | null;
  seoDesc: string | null;
  ogImageKey: string | null;
};

export async function createProduct(db: Database, input: ProductInput) {
  const [created] = await db
    .insert(products)
    .values({ ...input })
    .returning();
  return created;
}

export async function updateProduct(
  db: Database,
  id: number,
  input: Partial<ProductInput>,
) {
  const [updated] = await db
    .update(products)
    .set({ ...input, updatedAt: now })
    .where(eq(products.id, id))
    .returning();
  return updated;
}

export async function deleteProduct(db: Database, id: number) {
  // onDelete cascade elimina imágenes y ocasiones asociadas automáticamente
  await db.delete(products).where(eq(products.id, id));
}

export async function toggleProductActive(db: Database, id: number, active: boolean) {
  const [updated] = await db
    .update(products)
    .set({ active, updatedAt: now })
    .where(eq(products.id, id))
    .returning();
  return updated;
}

export async function toggleProductFeatured(
  db: Database,
  id: number,
  featured: boolean,
) {
  const [updated] = await db
    .update(products)
    .set({ featured, updatedAt: now })
    .where(eq(products.id, id))
    .returning();
  return updated;
}

/** Duplica un producto (nombre con sufijo " (copia)"). */
export async function duplicateProduct(db: Database, id: number) {
  const original = await db.query.products.findFirst({
    where: eq(products.id, id),
  });
  if (!original) throw new Response("Producto no encontrado", { status: 404 });

  const {
    name,
    slug,
    code,
    price,
    priceType,
    minQty,
    categoryId,
    shortDesc,
    longDesc,
    material,
    colors,
    dimensions,
    weight,
    leadTime,
    customization,
    seoTitle,
    seoDesc,
  } = original;

  // Generar slug y código únicos
  const baseSlug = `${slug}-copia`;
  const baseCode = `${code}-C`;
  const uniqueSlug = await ensureUniqueSlug(db, baseSlug);
  const uniqueCode = await ensureUniqueCode(db, baseCode);

  const [created] = await db
    .insert(products)
    .values({
      name: `${name} (copia)`,
      slug: uniqueSlug,
      code: uniqueCode,
      categoryId,
      shortDesc,
      longDesc,
      price,
      priceType,
      minQty,
      material,
      colors,
      dimensions,
      weight,
      leadTime,
      customization,
      active: false, // la copia arranca inactiva
      featured: false,
      featuredOrder: 0,
      seoTitle,
      seoDesc,
      ogImageKey: null,
    })
    .returning();
  return created;
}

async function ensureUniqueSlug(db: Database, base: string): Promise<string> {
  let candidate = base;
  let i = 1;
  while (
    await db.query.products.findFirst({ where: eq(products.slug, candidate) })
  ) {
    candidate = `${base}-${i++}`;
  }
  return candidate;
}

async function ensureUniqueCode(db: Database, base: string): Promise<string> {
  let candidate = base;
  let i = 1;
  while (
    await db.query.products.findFirst({ where: eq(products.code, candidate) })
  ) {
    candidate = `${base}${i++}`;
  }
  return candidate;
}

/* ---------------- IMÁGENES DE PRODUCTO ---------------- */

export async function addProductImage(
  db: Database,
  productId: number,
  r2Key: string,
  altText: string | null = null,
) {
  // sortOrder = máximo actual + 1
  const existing = await db.query.productImages.findMany({
    where: eq(productImages.productId, productId),
  });
  const nextOrder = existing.reduce((max, img) => Math.max(max, img.sortOrder), -1) + 1;
  const [created] = await db
    .insert(productImages)
    .values({ productId, r2Key, altText, sortOrder: nextOrder })
    .returning();
  return created;
}

export async function deleteProductImage(db: Database, id: number) {
  await db.delete(productImages).where(eq(productImages.id, id));
}

export async function updateImageAlt(db: Database, id: number, altText: string | null) {
  const [updated] = await db
    .update(productImages)
    .set({ altText })
    .where(eq(productImages.id, id))
    .returning();
  return updated;
}

/** Reordena imágenes: recibe array de IDs en el orden deseado. */
export async function reorderProductImages(db: Database, orderedIds: number[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i];
    if (id == null) continue;
    await db
      .update(productImages)
      .set({ sortOrder: i })
      .where(eq(productImages.id, id));
  }
}

/* ---------------- OCASIONES DE PRODUCTO ---------------- */

export async function setProductOccasions(
  db: Database,
  productId: number,
  occasionIds: number[],
) {
  // Reemplazo total: borra existentes e inserta las nuevas
  await db.delete(productOccasions).where(eq(productOccasions.productId, productId));
  if (occasionIds.length > 0) {
    await db.insert(productOccasions).values(
      occasionIds.map((occasionId) => ({ productId, occasionId })),
    );
  }
}

/* ---------------- CATEGORÍAS ---------------- */

export type CategoryInput = {
  name: string;
  slug: string;
  description: string | null;
  imageKey: string | null;
  sortOrder: number;
  active: boolean;
  seoTitle: string | null;
  seoDesc: string | null;
};

export async function createCategory(db: Database, input: CategoryInput) {
  const [created] = await db.insert(categories).values(input).returning();
  return created;
}

export async function updateCategory(
  db: Database,
  id: number,
  input: Partial<CategoryInput>,
) {
  const [updated] = await db
    .update(categories)
    .set({ ...input, updatedAt: now })
    .where(eq(categories.id, id))
    .returning();
  return updated;
}

export async function deleteCategory(db: Database, id: number) {
  // Antes de borrar, desasociar productos (categoryId → null) para no romperlos
  await db
    .update(products)
    .set({ categoryId: null, updatedAt: now })
    .where(eq(products.categoryId, id));
  await db.delete(categories).where(eq(categories.id, id));
}

export async function countProductsInCategory(db: Database, categoryId: number) {
  const rows = await db.query.products.findMany({
    where: eq(products.categoryId, categoryId),
  });
  return rows.length;
}

/** Sube/baja la posición (sortOrder) de una categoría intercambiándola con la vecina. */
export async function moveCategory(db: Database, id: number, direction: "up" | "down") {
  const all = await db.query.categories.findMany({
    orderBy: [asc(categories.sortOrder), asc(categories.name)],
  });
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return;
  const swapWith = direction === "up" ? all[idx - 1] : all[idx + 1];
  if (!swapWith) return;
  await db
    .update(categories)
    .set({ sortOrder: swapWith.sortOrder, updatedAt: now })
    .where(eq(categories.id, id));
  await db
    .update(categories)
    .set({ sortOrder: all[idx]!.sortOrder, updatedAt: now })
    .where(eq(categories.id, swapWith.id));
}

/* ---------------- COTIZACIONES ---------------- */

export type QuoteInput = {
  productId: number | null;
  name: string;
  phone: string;
  email: string | null;
  quantity: number | null;
  eventDate: string | null;
  occasion: string | null;
  message: string | null;
  source: string | null;
};

export async function insertQuote(db: Database, input: QuoteInput) {
  const [created] = await db.insert(quotes).values(input).returning();
  return created;
}

export async function listQuotes(
  db: Database,
  filters: { status?: "nueva" | "atendida" | "cerrada" } = {},
) {
  const orderBy = [desc(quotes.createdAt)];
  if (filters.status) {
    return db.query.quotes.findMany({
      where: eq(quotes.status, filters.status),
      orderBy,
      with: { product: true },
    });
  }
  return db.query.quotes.findMany({ orderBy, with: { product: true } });
}

export async function updateQuoteStatus(
  db: Database,
  id: number,
  status: "nueva" | "atendida" | "cerrada",
) {
  const [updated] = await db
    .update(quotes)
    .set({ status })
    .where(eq(quotes.id, id))
    .returning();
  return updated;
}

export async function deleteQuote(db: Database, id: number) {
  await db.delete(quotes).where(eq(quotes.id, id));
}

export async function countQuotesByStatus(db: Database) {
  const all = await db.query.quotes.findMany();
  return {
    nueva: all.filter((q) => q.status === "nueva").length,
    atendida: all.filter((q) => q.status === "atendida").length,
    cerrada: all.filter((q) => q.status === "cerrada").length,
    total: all.length,
  };
}

/* ---------------- SETTINGS ---------------- */

export async function getSetting(db: Database, key: string): Promise<string | null> {
  const row = await db.query.settings.findFirst({ where: eq(settings.key, key) });
  return row?.value ?? null;
}

export async function getAllSettings(db: Database): Promise<Record<string, string>> {
  const rows = await db.query.settings.findMany();
  const out: Record<string, string> = {};
  for (const r of rows) if (r.value !== null) out[r.key] = r.value;
  return out;
}

export async function upsertSetting(db: Database, key: string, value: string) {
  // D1/SQLite: INSERT ... ON CONFLICT DO UPDATE
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } })
    .run();
}

export async function upsertManySettings(
  db: Database,
  entries: Record<string, string>,
) {
  for (const [key, value] of Object.entries(entries)) {
    await upsertSetting(db, key, value);
  }
}

/* ---------------- SESIONES ---------------- */

export async function createSession(db: Database, token: string, expiresAt: number) {
  // Admin único: userId fijo = 1 (registro simbólico en tabla users si hace falta)
  await db.insert(sessions).values({ id: token, userId: 1, expiresAt }).run();
}

export async function getSession(db: Database, token: string) {
  return db.query.sessions.findFirst({ where: eq(sessions.id, token) });
}

export async function deleteSession(db: Database, token: string) {
  await db.delete(sessions).where(eq(sessions.id, token));
}

export async function purgeExpiredSessions(db: Database) {
  const nowSec = Math.floor(Date.now() / 1000);
  await db.delete(sessions).where(sql`${sessions.expiresAt} < ${nowSec}`).run();
}
