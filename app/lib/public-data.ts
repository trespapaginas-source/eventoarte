/**
 * Carga de datos compartidos del sitio público (marca + banners) para los loaders.
 *
 * Centraliza la resolución de la marca activa y la lectura de los banners
 * editables (banner superior + cinta promocional) desde la tabla `settings`,
 * con fallback a valores por defecto cuando la BD no está disponible.
 */

import type { Database } from "./db/client";
import { getAllSettings } from "./db/mutations";
import { resolveBrand, type BrandConfig } from "./brand";

export interface PublicSiteData {
  brand: BrandConfig;
  /** URL pública base (de vars de Cloudflare). */
  publicUrl: string;
  /** Banner superior editable. */
  banner: { text: string; active: boolean; link?: string | null };
  /** Cinta promocional editable (home). */
  promo: { text: string; active: boolean };
}

const DEFAULT_BANNER = {
  text: "Fabricación Nacional · Personalización para cada celebración",
  active: true,
  link: null as string | null,
};

const DEFAULT_PROMO = { text: "", active: false };

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
      banner = {
        text: settings["banner.top.text"] ?? DEFAULT_BANNER.text,
        active: parseBool(settings["banner.top.active"], DEFAULT_BANNER.active),
        link: settings["banner.top.link"] || null,
      };
      promo = {
        text: settings["promo.text"] ?? "",
        active: parseBool(settings["promo.active"], false),
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
  };
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === "true" || value === "1" || value === "on";
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
