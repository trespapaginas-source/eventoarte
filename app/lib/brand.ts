/**
 * ============================================================
 * recuerdos.store — Configuración multi-marca
 * ============================================================
 * El negocio tiene marca paraguas "recuerdos.store" y dos sub-marcas
 * que sus hijas gestionan en Instagram:
 *   - Recordarte  → /recordarte
 *   - Bella Arte  → /bellaarte  (directorio por defecto / raíz)
 *
 * Ambas comparten el mismo catálogo; solo cambian el WhatsApp y el
 * Instagram de contacto. La marca se determina por el primer segmento
 * de la URL (:brand?), con fallback a Bella Arte.
 *
 * SEO: solo Bella Arte (raíz canónica) se indexa. /recordarte lleva
 * noindex para evitar contenido duplicado en Google.
 */

export type BrandSlug = "bellaarte" | "recordarte";

export interface BrandConfig {
  slug: BrandSlug;
  name: string;
  /** WhatsApp en formato internacional sin + ni espacios. */
  whatsapp: string;
  /** URL completa del Instagram de la marca. */
  instagram: string;
  /** URL completa del Facebook de la marca (opcional). */
  facebook: string | null;
  /** Clave R2 de la foto de perfil/avatar (opcional). */
  photo: string | null;
}

/** Marca por defecto = la que se sirve en la raíz (sin directorio). */
export const DEFAULT_BRAND: BrandSlug = "bellaarte";

/**
 * Config por DEFECTO de cada marca. La config real se sobreescribe desde
 * la tabla `settings` (editable en el CMS). Estos valores son el fallback
 * cuando la BD no está disponible o no se han editado.
 */
export const BRAND_DEFAULTS: Record<BrandSlug, BrandConfig> = {
  recordarte: {
    slug: "recordarte",
    name: "Recordarte",
    whatsapp: "573122737264",
    instagram: "https://instagram.com/recordartebq/",
    facebook: null,
    photo: null,
  },
  bellaarte: {
    slug: "bellaarte",
    name: "Bella Arte",
    whatsapp: "573102737264",
    instagram: "https://instagram.com/bellaarte.co/",
    facebook: null,
    photo: null,
  },
};

/** Alias por compatibilidad con código existente. */
export const BRANDS = BRAND_DEFAULTS;

/** Slugs válidos para validación rápida. */
const VALID_SLUGS = new Set<BrandSlug>(["bellaarte", "recordarte"]);

function isBrandSlug(value: unknown): value is BrandSlug {
  return typeof value === "string" && VALID_SLUGS.has(value as BrandSlug);
}

/**
 * Resuelve la marca a partir del segmento de URL.
 * - Si el slug es válido (recordarte|bellaarte) → esa marca.
 * - Si es undefined (raíz) o inválido → marca por defecto (Bella Arte).
 *
 * Devuelve la config por DEFECTO. Para la config real (editada desde el CMS),
 * usar applyBrandOverrides() con los settings de la BD.
 */
export function resolveBrand(slug?: string | null): BrandConfig {
  if (isBrandSlug(slug)) return BRANDS[slug];
  return BRANDS[DEFAULT_BRAND];
}

/**
 * Aplica los overrides editados desde el CMS (tabla settings) sobre la
 * config por defecto de una marca. Solo sobreescribe los campos que estén
 * presentes y no vacíos en settings.
 *
 * `settings` es un record clave→valor como el que devuelve getAllSettings().
 */
export function applyBrandOverrides(
  brand: BrandConfig,
  settings: Record<string, string>,
): BrandConfig {
  const p = `brand.${brand.slug}.`;
  const get = (k: string) => settings[p + k];
  return {
    ...brand,
    whatsapp: get("whatsapp") || brand.whatsapp,
    instagram: get("instagram") || brand.instagram,
    facebook: get("facebook") || null,
    photo: get("photo") || null,
  };
}

/**
 * ¿Esta marca debe indexarse en Google?
 * Solo la marca por defecto (Bella Arte / raíz) es indexable.
 * /recordarte NO se indexa (contenido duplicado).
 */
export function isIndexedBrand(brand: BrandConfig): boolean {
  return brand.slug === DEFAULT_BRAND;
}

/**
 * ¿Es el directorio "explícito" de la marca por defecto?
 * La raíz (/) y /bellaarte sirven lo mismo; ambas son la marca default.
 * Útil para decidir si un link debe llevar prefijo o ir a raíz.
 */
export function isExplicitDefaultDir(slug?: string | null): boolean {
  return slug === DEFAULT_BRAND;
}

/**
 * Construye la ruta interna con el prefijo de marca correcto.
 * - En la raíz (/): devuelve el path tal cual (sin prefijo).
 * - En /bellaarte o /recordarte: antepone el prefijo para mantener
 *   al usuario dentro del directorio activo.
 *
 * Ejemplos (brand = recordarte):  brandPath("/catalogo") → "/recordarte/catalogo"
 *                                 brandPath("/")        → "/recordarte/"
 * Ejemplos (brand = bellaarte):   brandPath("/catalogo") → "/catalogo"  (sin prefijo, raíz canónica)
 */
export function brandPath(path: string, brand: BrandConfig): string {
  // La marca por defecto vive en la raíz canónica → sin prefijo.
  if (brand.slug === DEFAULT_BRAND) return path;
  // Otras marcas (recordarte) antepone su slug.
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `/${brand.slug}${clean === "/" ? "" : clean}`;
}

/**
 * Construye la URL canónica absoluta (para SEO/canonical/og).
 * Siempre apunta a la versión raíz (Bella Arte), sin directorio,
 * para consolidar la indexación.
 */
export function canonicalUrl(publicUrl: string, path: string): string {
  const base = publicUrl.replace(/\/$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}`;
}
