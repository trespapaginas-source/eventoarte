import type { Route } from "./+types/home";
import { MessageCircle, Sparkles, Zap, Palette } from "lucide-react";
import { PublicLayout } from "~/components/layout/PublicLayout";
import { ProductCard } from "~/components/catalog/ProductCard";
import { BrandLink } from "~/lib/brand-links";
import { buildWhatsAppSimpleLink, buildWhatsAppGeneralLink } from "~/lib/whatsapp";
import { canonicalUrl, isIndexedBrand, resolveBrand } from "~/lib/brand";
import { getDb } from "~/lib/db/client";
import { loadPublicData, normalizeCategory, normalizeProduct } from "~/lib/public-data";
import {
  getActiveCategories,
  getFeaturedProducts,
  listProducts,
} from "~/lib/db/queries";
import {
  sampleProducts,
  sampleCategories,
  type SampleProduct,
} from "~/lib/sample-data";
import { cloudflareContext } from "~/lib/cloudflare-context";

/**
 * Home de recuerdos.store — estilo premium inspirado en Vélez.
 *
 * Estructura: Barra anuncio → Header → Hero → Categorías →
 * Cinta promocional (editable) → Destacados → Banner CTA → Catálogo → Footer.
 */
export function meta({ params }: Route.MetaArgs) {
  const publicUrl = "https://recuerdos.store";
  const brand = resolveBrand(params.brand);
  const noindex = !isIndexedBrand(brand);
  const tags = [
    {
      title: "recuerdos.store — Recordatorios personalizados para tus celebraciones",
    },
    {
      name: "description",
      content:
        "Morrales, loncheras, cartucheras, tulas y recordatorios personalizados para cumpleaños, baby shower, quinceaños, bautizos y más. Fabricación nacional. Cotiza por WhatsApp.",
    },
    { tagName: "link", rel: "canonical", href: canonicalUrl(publicUrl, "/") },
    { property: "og:type", content: "website" },
    { property: "og:title", content: "recuerdos.store — Recordatorios personalizados" },
    {
      property: "og:description",
      content:
        "Morrales, loncheras, tulas y recordatorios personalizados para tus celebraciones. Cotiza por WhatsApp.",
    },
    { property: "og:url", content: canonicalUrl(publicUrl, "/") },
    {
      property: "og:image",
      content: `${publicUrl}/images/productos/fotos/morral-safari.jpg`,
    },
    { name: "twitter:card", content: "summary_large_image" },
  ];
  if (noindex) {
    tags.push({ name: "robots", content: "noindex, nofollow" });
  }
  return tags;
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const db = env.DB ? getDb(env.DB) : null;

  const [site, featured, catalog, categories] = await Promise.all([
    loadPublicData({ db, brandSlug: params.brand, publicUrl: env.PUBLIC_URL }),
    (async () => {
      let f: SampleProduct[] = sampleProducts.filter((p) => p.featured);
      try {
        if (db) {
          const r = await getFeaturedProducts(db, 4);
          if (r.length) f = r.map(normalizeProduct) as any;
        }
      } catch {}
      return f;
    })(),
    (async () => {
      let c: SampleProduct[] = sampleProducts;
      try {
        if (db) {
          const r = await listProducts(db, { sort: "featured" });
          if (r.length) c = r.map(normalizeProduct) as any;
        }
      } catch {}
      return c;
    })(),
    (async () => {
      let cats = sampleCategories;
      try {
        if (db) {
          const r = await getActiveCategories(db);
          if (r.length) cats = r.map(normalizeCategory);
        }
      } catch {}
      return cats;
    })(),
  ]);

  return { ...site, featured, catalog, categories };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { featured, catalog, categories, brand, publicUrl, banner, promo } = loaderData;

  const waSimple = buildWhatsAppSimpleLink(brand);
  const waGeneral = buildWhatsAppGeneralLink(brand);

  // En el home mostramos "destacados" y luego "más productos" (sin duplicar).
  const featuredIds = new Set(featured.map((p: any) => p.id ?? p.code));
  const restOfCatalog = catalog.filter((p: any) => !featuredIds.has(p.id ?? p.code));

  return (
    <PublicLayout brand={brand} banner={banner}>
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="container-page grid items-center gap-8 py-14 md:grid-cols-2 md:py-20">
          {/* Texto */}
          <div>
            <span className="inline-flex items-center gap-1.5 border border-border bg-surface-off px-4 py-1.5 text-[11px] font-bold uppercase tracking-[2px] text-brand-ink">
              <Sparkles size={12} strokeWidth={1.5} />
              Personalización para cada ocasión
            </span>
            <h1 className="mt-5 text-balance font-display text-4xl font-extrabold leading-tight text-brand-ink md:text-5xl">
              Recordatorios que celebran tus{" "}
              <span className="italic font-light">momentos</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-brand-ink-soft">
              Morrales, loncheras, tulas y recordatorios personalizados para
              cumpleaños, baby shower, quinceaños y todas tus celebraciones.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <BrandLink
                to="/catalogo"
                className="inline-flex items-center border border-brand-ink bg-brand-ink px-5 py-2.5 text-xs font-medium uppercase tracking-[1.5px] text-white transition-all hover:bg-transparent hover:text-brand-ink"
              >
                Ver catálogo
              </BrandLink>
              <a
                href={waSimple}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-brand-ink px-5 py-2.5 text-xs font-medium uppercase tracking-[1.5px] text-brand-ink transition-all hover:bg-brand-ink hover:text-white"
              >
                <MessageCircle size={14} strokeWidth={1.5} />
                WhatsApp
              </a>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-brand-ink-soft">
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} strokeWidth={1.5} />
                Fabricación nacional
              </span>
              <span className="flex items-center gap-1.5">
                <Zap size={13} strokeWidth={1.5} />
                Cotización rápida
              </span>
              <span className="flex items-center gap-1.5">
                <Palette size={13} strokeWidth={1.5} />
                Diseño personalizado
              </span>
            </div>
          </div>

          {/* Collage visual — fotos reales */}
          <div className="relative hidden md:block">
            <div className="grid grid-cols-2 gap-4">
              <img
                src="/images/productos/fotos/morral-safari.jpg"
                alt="Morral personalizado"
                className="aspect-3/4 w-full rounded-xl object-cover shadow-md"
                loading="eager"
              />
              <div className="grid gap-4">
                <img
                  src="/images/productos/fotos/lonchera.jpg"
                  alt="Lonchera personalizada"
                  className="aspect-square w-full rounded-xl object-cover shadow-md"
                  loading="eager"
                />
                <img
                  src="/images/productos/fotos/recordatorio.jpg"
                  alt="Recordatorio premium"
                  className="aspect-square w-full rounded-xl object-cover shadow-md"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CATEGORÍAS ===================== */}
      <section className="container-page py-14">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl font-bold text-brand-ink md:text-4xl">
            Explora por categoría
          </h2>
          <p className="mt-2 text-brand-ink-soft">
            Encuentra el recuerdo perfecto para tu celebración
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {categories.map((cat: any) => (
            <BrandLink
              key={cat.slug}
              to={`/categoria/${cat.slug}`}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 text-center transition-all hover:-translate-y-1 hover:border-brand-ink hover:shadow-md"
            >
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-surface-off">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="font-display text-sm font-semibold text-brand-ink transition-opacity group-hover:opacity-70">
                {cat.name}
              </span>
            </BrandLink>
          ))}
        </div>
      </section>

      {/* ===================== CINTA PROMOCIONAL (editable) ===================== */}
      {promo.active && promo.text ? (
        <section aria-label="Promoción">
          <div className="relative overflow-hidden bg-gradient-brand">
            {/* Capa decorativa para sensación de profundidad/movimiento */}
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.25) 0%, transparent 50%)",
              }}
            />
            <div className="container-page relative z-10 py-4 text-center md:py-5">
              <p className="text-sm font-semibold uppercase tracking-[2px] text-white md:text-base">
                {promo.text}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* ===================== DESTACADOS ===================== */}
      {featured.length > 0 ? (
        <section className="border-y border-border bg-surface-off py-14">
          <div className="container-page">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="font-display text-3xl font-bold text-brand-ink md:text-4xl">
                  Productos destacados
                </h2>
                <p className="mt-2 text-brand-ink-soft">Los favoritos de nuestros clientes</p>
              </div>
              <BrandLink
                to="/catalogo"
                className="hidden items-center gap-1 text-sm font-bold text-brand-ink transition-opacity hover:opacity-70 sm:flex"
              >
                Ver todo
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </BrandLink>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6">
              {featured.map((p: any) => (
                <ProductCard key={p.id ?? p.code} product={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ===================== BANNER COTIZACIÓN ===================== */}
      <section className="container-page py-14">
        <div className="relative overflow-hidden border border-border bg-surface-off px-6 py-14 text-center md:px-12 md:py-20">
          <div className="relative z-10 mx-auto max-w-2xl">
            <span className="mb-4 inline-block text-[11px] font-bold uppercase tracking-[3px] text-brand-ink-light">
              Cotización a la medida
            </span>
            <h2 className="text-3xl font-bold text-brand-ink md:text-4xl">
              ¿Organizando un evento?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-brand-ink-soft">
              Cuéntanos qué celebras y te ayudamos a crear los recordatorios
              perfectos. Cotización sin compromiso.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <BrandLink
                to="/cotizar"
                className="inline-flex items-center border border-brand-ink bg-brand-ink px-5 py-2.5 text-xs font-medium uppercase tracking-[1.5px] text-white transition-all hover:bg-transparent hover:text-brand-ink"
              >
                Solicitar cotización
              </BrandLink>
              <a
                href={waGeneral}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-brand-ink px-5 py-2.5 text-xs font-medium uppercase tracking-[1.5px] text-brand-ink transition-all hover:bg-brand-ink hover:text-white"
              >
                <MessageCircle size={14} strokeWidth={1.5} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== MÁS PRODUCTOS ===================== */}
      {restOfCatalog.length > 0 ? (
        <section className="container-page pb-16">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-bold text-brand-ink md:text-4xl">
              Más para celebrar
            </h2>
            <p className="mt-2 text-brand-ink-soft">
              Sigue explorando nuestra colección de productos personalizados
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6">
            {restOfCatalog.map((p: any) => (
              <ProductCard key={p.id ?? p.code} product={p} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <BrandLink
              to="/catalogo"
              className="inline-block border border-brand-ink px-6 py-2.5 text-xs font-medium uppercase tracking-[1.5px] text-brand-ink transition-all hover:bg-brand-ink hover:text-white"
            >
              Ver catálogo completo
            </BrandLink>
          </div>
        </section>
      ) : null}
    </PublicLayout>
  );
}
