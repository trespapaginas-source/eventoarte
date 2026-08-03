/**
 * Helpers de SEO y metadatos.
 * Sección 12 del Documento Técnico.
 */

export interface SeoMeta {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: "website" | "product" | "article";
  noindex?: boolean;
}

export function buildMeta(m: SeoMeta) {
  const tags: Record<string, string> = {
    title: m.title,
    description: m.description,
    "og:title": m.title,
    "og:description": m.description,
    "og:type": m.type ?? "website",
    "twitter:card": m.image ? "summary_large_image" : "summary",
    "twitter:title": m.title,
    "twitter:description": m.description,
  };
  if (m.image) {
    tags["og:image"] = m.image;
    tags["twitter:image"] = m.image;
  }
  return tags;
}

/**
 * JSON-LD de Schema.org para una ficha de producto.
 */
export function productJsonLd(opts: {
  name: string;
  sku: string;
  description: string;
  image: string;
  price: number;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    sku: opts.sku,
    image: [opts.image],
    description: opts.description,
    brand: { "@type": "Brand", name: "recuerdos.store" },
    offers: {
      "@type": "Offer",
      priceCurrency: "COP",
      price: String(opts.price),
      availability: "https://schema.org/PreOrder",
      url: opts.url,
    },
  };
}

export function organizationJsonLd(publicUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "recuerdos.store",
    url: publicUrl,
    logo: `${publicUrl}/logo.png`,
    sameAs: ["https://instagram.com/recuerdos.store"],
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
