import { z } from "zod";

/**
 * Esquemas de validación Zod por entidad.
 * Usados en los actions de las rutas admin y en el form público de cotización.
 */

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const productSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  slug: z.string().regex(slugRegex, "Solo minúsculas, números y guiones"),
  code: z.string().min(2, "El código es muy corto"),
  categoryId: z.coerce.number().int().positive().nullable().optional(),
  shortDesc: z.string().nullable().optional(),
  longDesc: z.string().nullable().optional(),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  priceType: z.enum(["unitario", "desde", "por_cantidad"]),
  minQty: z.coerce.number().int().min(1, "Mínimo 1 unidad"),
  material: z.string().nullable().optional(),
  colors: z.string().nullable().optional(),
  dimensions: z.string().nullable().optional(),
  weight: z.string().nullable().optional(),
  leadTime: z.string().nullable().optional(),
  customization: z.string().nullable().optional(),
  active: z.coerce.boolean().default(true),
  featured: z.coerce.boolean().default(false),
  featuredOrder: z.coerce.number().int().default(0),
  seoTitle: z.string().nullable().optional(),
  seoDesc: z.string().nullable().optional(),
  ogImageKey: z.string().nullable().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  slug: z.string().regex(slugRegex, "Solo minúsculas, números y guiones"),
  description: z.string().nullable().optional(),
  imageKey: z.string().nullable().optional(),
  sortOrder: z.preprocess((v) => (v === undefined || v === "" ? 0 : v), z.coerce.number().int()),
  active: z.coerce.boolean().default(true),
  seoTitle: z.string().nullable().optional(),
  seoDesc: z.string().nullable().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const quoteInsertSchema = z.object({
  productId: z.coerce.number().int().positive().nullable().optional(),
  name: z.string().min(2, "Tu nombre es muy corto"),
  phone: z.string().min(6, "Teléfono inválido"),
  email: z.string().email("Correo inválido").nullable().or(z.literal("")),
  quantity: z.coerce.number().int().positive().nullable().optional(),
  eventDate: z.string().nullable().optional(),
  occasion: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
});

export type QuoteFormValues = z.infer<typeof quoteInsertSchema>;

/**
 * Ajustes del sitio: validación flexible (clave-valor).
 * El form envía pares key/value; aquí se normalizan.
 */
export const settingsSchema = z.record(z.string(), z.string());

/** Genera un slug a partir de un texto (para autocompletar en el editor). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
