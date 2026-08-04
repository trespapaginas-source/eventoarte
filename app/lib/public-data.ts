/**
 * Carga de datos compartidos del sitio público (marca + banners) para los loaders.
 *
 * Centraliza la resolución de la marca activa y la lectura de los banners
 * editables (banner superior + cinta promocional) desde la tabla `settings`,
 * con fallback a valores por defecto cuando la BD no está disponible.
 */

import type { Database } from "./db/client";
import { getAllSettings } from "./db/mutations";
import { getActiveCategories } from "./db/queries";
import { resolveBrand, applyBrandOverrides, type BrandConfig, type BrandSlug } from "./brand";
import { sampleCategories } from "./sample-data";

export interface PublicSiteData {
  brand: BrandConfig;
  /** URL pública base (de vars de Cloudflare). */
  publicUrl: string;
  /** Banner superior editable. */
  banner: { text: string; active: boolean; link?: string | null };
  /** Cinta promocional editable (home). */
  promo: { text: string; active: boolean };
  /** Imágenes del hero (hasta 4). Rutas listas para <img src>. */
  heroImages: string[];
}

const DEFAULT_BANNER = {
  text: "Fabricación Nacional · Personalización para cada celebración",
  active: true,
  link: null as string | null,
};

const DEFAULT_PROMO = { text: "", active: false };

/** Fotos del hero por defecto (assets estáticos del repo). */
const DEFAULT_HERO_IMAGES = [
  "/images/productos/fotos/morral-safari.jpg",
  "/images/productos/fotos/lonchera.jpg",
  "/images/productos/fotos/recordatorio.jpg",
  "/images/productos/fotos/tula.jpg",
];

/**
 * Resuelve los datos del sitio público para una ruta.
 * Lee la marca del segmento :brand? y los banners de settings (si hay BD).
 */
export async function loadPublicData(opts: {
  db?: Database | null;
  brandSlug?: string | null;
  publicUrl: string;
}): Promise<PublicSiteData> {
  const brand = resolveBrand(opts.brandSlug);

  let banner = DEFAULT_BANNER;
  let promo = DEFAULT_PROMO;

  if (opts.db) {
    try {
      const settings = await getAllSettings(opts.db);
      // Si el admin cambió la marca por defecto, y estamos en la raíz,
      // servir esa marca en vez de la default hardcodeada.
      let effectiveSlug: BrandSlug | undefined = undefined;
      const dbDefault = settings["brand.default"];
      if (dbDefault === "recordarte" || dbDefault === "bellaarte") {
        effectiveSlug = dbDefault;
      }
      // Resuelve la marca base (default si no hay slug en URL)
      const baseBrand = resolveBrand(opts.brandSlug ?? effectiveSlug);
      // Aplica overrides editados (whatsapp, instagram, facebook, photo)
      const finalBrand = applyBrandOverrides(baseBrand, settings);
      banner = {
        text: settings["banner.top.text"] ?? DEFAULT_BANNER.text,
        active: parseBool(settings["banner.top.active"], DEFAULT_BANNER.active),
        link: settings["banner.top.link"] || null,
      };
      promo = {
        text: settings["promo.text"] ?? "",
        active: parseBool(settings["promo.active"], false),
      };
      // Hero images: JSON array de claves R2 o rutas. Resuelve a URLs.
      const heroImages = resolveHeroImages(settings["hero.images"]);
      return {
        brand: finalBrand,
        publicUrl: opts.publicUrl.replace(/\/$/, ""),
        banner,
        promo,
        heroImages,
      };
    } catch {
      // BD caída: usamos defaults
    }
  }

  return {
    brand,
    publicUrl: opts.publicUrl.replace(/\/$/, ""),
    banner,
    promo,
    heroImages: DEFAULT_HERO_IMAGES,
  };
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === "true" || value === "1" || value === "on";
}

/**
 * Resuelve las imágenes del hero desde el valor guardado en settings.
 * El valor es un JSON array de strings (claves R2 o rutas absolutas).
 * - Claves R2 (ej: "hero/foto.png") → "/media/hero/foto.png"
 * - Rutas que empiezan con "/" o "http" → se usan tal cual
 * Si está vacío o inválido, devuelve los defaults.
 */
function resolveHeroImages(stored: string | undefined): string[] {
  if (!stored) return DEFAULT_HERO_IMAGES;
  try {
    const arr = JSON.parse(stored);
    if (!Array.isArray(arr)) return DEFAULT_HERO_IMAGES;
    const resolved = arr
      .map(String)
      .filter(Boolean)
      .map((s) => (s.startsWith("/") || s.startsWith("http") ? s : `/media/${s}`));
    return resolved.length > 0 ? resolved.slice(0, 4) : DEFAULT_HERO_IMAGES;
  } catch {
    return DEFAULT_HERO_IMAGES;
  }
}

/* ============================================================
   Normalizadores de entidades de BD → formato que espera la UI.
   La UI pública usa campos como `image` (ruta lista para <img src>).
   Las entidades de BD tienen `imageKey` (clave R2 servida vía /media/).
   Estos helpers unifican ambos orígenes para que la UI no distinga.
   ============================================================ */

/**
 * Normaliza una categoría de BD: deriva `image` desde `imageKey`.
 * Si ya trae `image` (datos de muestra), la respeta.
 */
export function normalizeCategory(cat: any): any {
  if (!cat) return cat;
  if (cat.image) return cat;
  return { ...cat, image: cat.imageKey ? `/media/${cat.imageKey}` : null };
}

/**
 * Normaliza un producto de BD: deriva `image` y `gallery` desde sus
 * relaciones `images` (array de { r2Key, sortOrder }).
 */
export function normalizeProduct(product: any): any {
  if (!product) return product;
  // Si ya tiene image/gallery (datos de muestra), respetar.
  if (product.image) return product;
  const imgs: any[] = Array.isArray(product.images) ? product.images : [];
  if (imgs.length === 0) return { ...product, image: null, gallery: [] };
  const sorted = [...imgs].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
  const gallery = sorted.map((i) => `/media/${i.r2Key}`);
  return { ...product, image: gallery[0] ?? null, gallery };
}

/**
 * ÚNICA fuente de verdad para categorías en el sitio público.
 *
 * - Lee las categorías activas desde la BD (getActiveCategories), que respeta
 *   el sortOrder editable por drag & drop en el CMS.
 * - Normaliza cada categoría: deriva `image` desde `imageKey` (R2).
 * - Si no hay BD o está vacía, usa sampleCategories como fallback.
 *
 * Usar este helper en TODAS las rutas públicas que muestren categorías
 * (home, catálogo) para garantizar consistencia total.
 */
export async function loadCategories(db: Database | null): Promise<any[]> {
  if (!db) return sampleCategories;
  try {
    const cats = await getActiveCategories(db);
    if (cats.length === 0) return sampleCategories;
    return cats.map(normalizeCategory);
  } catch {
    return sampleCategories;
  }
}
