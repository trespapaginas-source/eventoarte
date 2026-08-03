import { and, eq, like, or, asc, desc, ne, gte, lte } from "drizzle-orm";
import type { Database } from "./client";
import { products, categories, occasions, productImages, banners } from "./schema";

/**
 * Consultas de catálogo (lado público).
 * Todas usan Drizzle (queries parametrizadas → anti SQLi).
 */

export async function getActiveCategories(db: Database) {
  return db.query.categories.findMany({
    where: eq(categories.active, true),
    orderBy: [asc(categories.sortOrder), asc(categories.name)],
  });
}

export async function getActiveOccasions(db: Database) {
  return db.query.occasions.findMany({
    where: eq(occasions.active, true),
    orderBy: [asc(occasions.sortOrder), asc(occasions.name)],
  });
}

export async function getFeaturedProducts(db: Database, limit = 8) {
  return db.query.products.findMany({
    where: and(eq(products.featured, true), eq(products.active, true)),
    orderBy: [asc(products.featuredOrder)],
    limit,
    with: { images: true },
  });
}

export async function getProductBySlug(db: Database, slug: string) {
  return db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.active, true)),
    with: {
      images: { orderBy: [asc(productImages.sortOrder)] },
      category: true,
      occasions: true,
    },
  });
}

/** Producto por ID para el CMS (incluye inactivos). */
export async function getProductById(db: Database, id: number) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      images: { orderBy: [asc(productImages.sortOrder)] },
      category: true,
      occasions: true,
    },
  });
}

export async function getRelatedProducts(
  db: Database,
  categoryId: number,
  excludeId: number,
  limit = 4,
) {
  return db.query.products.findMany({
    where: and(
      eq(products.categoryId, categoryId),
      eq(products.active, true),
      ne(products.id, excludeId),
    ),
    limit,
    with: { images: true },
  });
}

export type ProductListFilters = {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: "featured" | "price_asc" | "price_desc" | "name";
};

export async function listProducts(db: Database, filters: ProductListFilters = {}) {
  const conditions = [eq(products.active, true)];
  if (filters.categoryId) conditions.push(eq(products.categoryId, filters.categoryId));
  if (typeof filters.minPrice === "number") conditions.push(gte(products.price, filters.minPrice));
  if (typeof filters.maxPrice === "number") conditions.push(lte(products.price, filters.maxPrice));
  if (filters.search) {
    const q = `%${filters.search}%`;
    conditions.push(or(like(products.name, q), like(products.code, q))!);
  }

  const orderBy =
    filters.sort === "price_asc"
      ? [asc(products.price)]
      : filters.sort === "price_desc"
        ? [desc(products.price)]
        : filters.sort === "name"
          ? [asc(products.name)]
          : [desc(products.featured), asc(products.featuredOrder)];

  return db.query.products.findMany({
    where: and(...conditions),
    orderBy,
    with: { images: true },
  });
}

export async function getActiveBanners(db: Database) {
  return db.query.banners.findMany({
    where: eq(banners.active, true),
    orderBy: [asc(banners.sortOrder)],
  });
}
