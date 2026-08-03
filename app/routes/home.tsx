import type { Route } from "./+types/home";
import { Link } from "react-router";
import { PublicLayout } from "~/components/layout/PublicLayout";
import { ProductCard } from "~/components/catalog/ProductCard";
import { getDb } from "~/lib/db/client";
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
 * Home de eventoarte.co — estilo premium inspirado en Vélez.
 * Sección 5.2 del Documento Técnico.
 *
 * Estructura: Barra anuncio → Header → Hero → Categorías (con imagen) →
 * Destacados → Banner CTA → Catálogo → Footer.
 */
export function meta(_: Route.MetaArgs) {
  return [
    {
      title: "eventoarte.co — Recordatorios personalizados para tus celebraciones",
    },
    {
      name: "description",
      content:
        "Morrales, loncheras, cartucheras, tulas y recordatorios personalizados para cumpleaños, baby shower, quinceaños, bautizos y más. Fabricación nacional. Cotiza por WhatsApp.",
    },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);

  let featured: SampleProduct[] = sampleProducts.filter((p) => p.featured);
  let catalog: SampleProduct[] = sampleProducts;
  let categories = sampleCategories;

  try {
    if (env.DB) {
      const db = getDb(env.DB);
      const [f, c, cats] = await Promise.all([
        getFeaturedProducts(db, 4),
        listProducts(db, { sort: "featured" }),
        getActiveCategories(db),
      ]);
      if (f.length) featured = f as any;
      if (c.length) catalog = c as any;
      if (cats.length) categories = cats as any;
    }
  } catch {
    // D1 no disponible todavía: usamos datos de muestra silenciosamente.
  }

  return { featured, catalog, categories, waNumber: env.WA_NUMBER, publicUrl: env.PUBLIC_URL };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { featured, catalog, categories, waNumber, publicUrl } = loaderData;

  return (
    <PublicLayout waNumber={waNumber}>
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-cream via-white to-brand-cream">
        <div className="container-page grid items-center gap-8 py-14 md:grid-cols-2 md:py-20">
          {/* Texto */}
          <div>
            <span className="inline-block rounded-pill bg-brand-coral/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-coral">
              ✨ Personalización para cada ocasión
            </span>
            <h1 className="mt-5 text-balance font-display text-4xl font-extrabold leading-tight text-brand-ink md:text-5xl">
              Recordatorios que celebran tus{" "}
              <span className="text-brand-coral">momentos</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-brand-ink-soft">
              Morrales, loncheras, tulas y recordatorios personalizados para
              cumpleaños, baby shower, quinceaños y todas tus celebraciones.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/catalogo"
                className="rounded-pill bg-brand-coral px-7 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:scale-105 hover:bg-brand-coral-dark"
              >
                Ver catálogo
              </Link>
              {waNumber ? (
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-pill border-2 border-whatsapp bg-white px-7 py-3.5 text-sm font-bold text-whatsapp transition-all hover:scale-105 hover:bg-whatsapp hover:text-white"
                >
                  💬 Cotizar por WhatsApp
                </a>
              ) : null}
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-brand-ink-soft">
              <span className="flex items-center gap-1.5">🇨🇴 Fabricación nacional</span>
              <span className="flex items-center gap-1.5">⚡ Cotización rápida</span>
              <span className="flex items-center gap-1.5">🎨 Diseño personalizado</span>
            </div>
          </div>

          {/* Collage visual */}
          <div className="relative hidden md:block">
            <div className="grid grid-cols-2 gap-4">
              <img
                src="/images/productos/morral-safari.svg"
                alt="Morral personalizado"
                className="aspect-3/4 w-full rounded-xl object-cover shadow-md"
                loading="eager"
              />
              <div className="grid gap-4">
                <img
                  src="/images/productos/lonchera.svg"
                  alt="Lonchera personalizada"
                  className="aspect-square w-full rounded-xl object-cover shadow-md"
                  loading="eager"
                />
                <img
                  src="/images/productos/recordatorio.svg"
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
            <Link
              key={cat.slug}
              to={`/categoria/${cat.slug}`}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 text-center transition-all hover:-translate-y-1 hover:border-brand-coral hover:shadow-md"
            >
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-brand-cream">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="font-display text-sm font-semibold text-brand-ink transition-colors group-hover:text-brand-coral">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===================== DESTACADOS ===================== */}
      {featured.length > 0 ? (
        <section className="bg-brand-cream py-14">
          <div className="container-page">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="font-display text-3xl font-bold text-brand-ink md:text-4xl">
                  Productos destacados
                </h2>
                <p className="mt-2 text-brand-ink-soft">Los favoritos de nuestros clientes</p>
              </div>
              <Link
                to="/catalogo"
                className="hidden text-sm font-bold text-brand-coral transition-colors hover:underline sm:block"
              >
                Ver todo →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {featured.map((p: any) => (
                <ProductCard key={p.id ?? p.code} product={p} waNumber={waNumber} publicUrl={publicUrl} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ===================== BANNER COTIZACIÓN ===================== */}
      <section className="container-page py-14">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-coral to-brand-mustard px-6 py-12 text-center text-white md:px-12 md:py-16">
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              ¿Organizando un evento?
            </h2>
            <p className="mt-3 text-lg text-white/90">
              Cuéntanos qué celebras y te ayudamos a crear los recordatorios
              perfectos. Cotización sin compromiso.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                to="/cotizar"
                className="rounded-pill bg-white px-7 py-3.5 text-sm font-bold text-brand-coral shadow-lg transition-transform hover:scale-105"
              >
                Solicitar cotización
              </Link>
              {waNumber ? (
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-pill bg-whatsapp px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
                >
                  💬 WhatsApp
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CATÁLOGO COMPLETO ===================== */}
      {catalog.length > 0 ? (
        <section className="container-page pb-16">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-bold text-brand-ink md:text-4xl">
              Todo el catálogo
            </h2>
            <p className="mt-2 text-brand-ink-soft">
              Explora nuestra colección completa de productos personalizados
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {catalog.map((p: any) => (
              <ProductCard key={p.id ?? p.code} product={p} waNumber={waNumber} publicUrl={publicUrl} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/catalogo"
              className="inline-block rounded-pill border-2 border-brand-ink px-8 py-3.5 text-sm font-bold text-brand-ink transition-all hover:bg-brand-ink hover:text-white"
            >
              Ver catálogo completo
            </Link>
          </div>
        </section>
      ) : null}
    </PublicLayout>
  );
}
