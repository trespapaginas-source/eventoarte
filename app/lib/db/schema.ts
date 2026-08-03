import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * ============================================================
 * eventoarte.co — Esquema de base de datos (D1 / SQLite + Drizzle)
 * Sección 11 del Documento Técnico.
 * ============================================================
 * Tablas:
 *   categories, occasions, products, product_occasions,
 *   product_images, banners, quotes, settings, users, sessions
 *
 * Notas:
 *  - `active` se guarda como entero (0/1) por compatibilidad SQLite.
 *  - Los timestamps se guardan como INTEGER (Unix epoch, segundos).
 *  - `colors` y otros campos multivalor se guardan como JSON (TEXT).
 */

const now = sql`strftime('%s', 'now')`;

/* ---------- Categorías (por tipo de producto) ---------- */
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageKey: text("image_key"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  seoTitle: text("seo_title"),
  seoDesc: text("seo_desc"),
  createdAt: integer("created_at").notNull().default(now),
  updatedAt: integer("updated_at").notNull().default(now),
});

/* ---------- Ocasiones (cumpleaños, baby shower...) ---------- */
export const occasions = sqliteTable("occasions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const priceTypes = ["unitario", "desde", "por_cantidad"] as const;
export type PriceType = (typeof priceTypes)[number];

/* ---------- Productos ---------- */
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  code: text("code").notNull().unique(),

  categoryId: integer("category_id").references(() => categories.id),

  shortDesc: text("short_desc"),
  longDesc: text("long_desc"),

  // --- Precio ---
  price: real("price").notNull(),
  priceType: text("price_type", { enum: priceTypes })
    .notNull()
    .default("desde"),
  minQty: integer("min_qty").notNull().default(1),

  // --- Specs ---
  material: text("material"),
  colors: text("colors"), // JSON: ["Rojo","Azul"]
  dimensions: text("dimensions"),
  weight: text("weight"),
  leadTime: text("lead_time"),
  customization: text("customization"),

  // --- Estado ---
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  featuredOrder: integer("featured_order").notNull().default(0),

  // --- SEO ---
  seoTitle: text("seo_title"),
  seoDesc: text("seo_desc"),
  ogImageKey: text("og_image_key"),

  createdAt: integer("created_at").notNull().default(now),
  updatedAt: integer("updated_at").notNull().default(now),
});

/* ---------- Relación producto ↔ ocasión (N:M) ---------- */
export const productOccasions = sqliteTable(
  "product_occasions",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    occasionId: integer("occasion_id")
      .notNull()
      .references(() => occasions.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.productId, t.occasionId] }),
  }),
);

/* ---------- Imágenes de producto ---------- */
export const productImages = sqliteTable("product_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  r2Key: text("r2_key").notNull(),
  altText: text("alt_text"),
  sortOrder: integer("sort_order").notNull().default(0),
});

/* ---------- Banners del Home ---------- */
export const banners = sqliteTable("banners", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title"),
  subtitle: text("subtitle"),
  ctaText: text("cta_text"),
  ctaLink: text("cta_link"),
  imageKey: text("image_key"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const quoteStatus = ["nueva", "atendida", "cerrada"] as const;
export type QuoteStatus = (typeof quoteStatus)[number];

/* ---------- Solicitudes de cotización ---------- */
export const quotes = sqliteTable("quotes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  quantity: integer("quantity"),
  eventDate: text("event_date"),
  occasion: text("occasion"),
  message: text("message"),
  source: text("source"), // 'whatsapp' | 'form'
  status: text("status", { enum: quoteStatus }).notNull().default("nueva"),
  createdAt: integer("created_at").notNull().default(now),
});

/* ---------- Contenido global (key/value JSON) ---------- */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value"), // JSON según el key
});

export const userRoles = ["admin", "editor"] as const;
export type UserRole = (typeof userRoles)[number];

/* ---------- Usuarios del CMS ---------- */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: userRoles }).notNull().default("admin"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at").notNull().default(now),
});

/* ---------- Sesiones (cookie httpOnly) ---------- */
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(), // token aleatorio
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull().default(now),
});

/* ---------- Tipos derivados ---------- */
export type Category = typeof categories.$inferSelect;
export type Occasion = typeof occasions.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type Banner = typeof banners.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
