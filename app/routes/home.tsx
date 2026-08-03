import type { Route } from "./+types/home";
import { cloudflareContext } from "~/lib/cloudflare-context";
import { Link } from "react-router";
import { PublicLayout } from "~/components/layout/PublicLayout";
import { ProductCard } from "~/components/catalog/ProductCard";
import { getDb } from "~/lib/db/client";
import {
  getActiveCategories,
  getFeaturedProducts,
  listProducts,
} from "~/lib/db/queries";
import { sampleProducts, sampleOccasions } from "~/lib/sample-data";

/**
 * Home de eventoarte.co — Sección 5.2 del Documento Técnico.
 * Estructura: Header → Banner → Ocasiones → Destacados → Catálogo → Formulario → Footer.
 *
 * Intenta leer de D1; si no hay datos (o D1 no está configurado todavía),
 * cae con elegancia a datos de muestra para poder previsualizar el diseño.
 */
export function meta(_: Route.MetaArgs) {
  return [
    { title: "eventoarte.co — Recordatorios y productos personalizados para eventos" },
    {
      name: "description",
      content:
        "Morrales, loncheras, kits y recordatorios personalizados para cumpleaños, baby shower, quinceaños y celebraciones. Cotiza por WhatsApp. Hecho en Colombia.",
    },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const waNumber = env.WA_NUMBER;
  const publicUrl = env.PUBLIC_URL;

  let featured = sampleProducts.slice(0, 4);
  let catalog = sampleProducts.slice(4);
  let categories = sampleOccasions;

  try {
    if (env.DB) {
      const db = getDb(env.DB);
      const [f, c, cats] = await Promise.all([
        getFeaturedProducts(db, 4),
        listProducts(db, { sort: "featured" }),
        getActiveCategories(db),
      ]);
      if (f.length) featured = f as any;
      if (c.length) catalog = c.slice(4) as any;
      if (cats.length) categories = cats as any;
    }
  } catch {
    // D1 no disponible todavía: usamos datos de muestra silenciosamente.
  }

  return { featured, catalog, categories, waNumber, publicUrl };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { featured, catalog, categories, waNumber, publicUrl } = loaderData;

  return (
    <PublicLayout waNumber={waNumber}>
      {/* ---------- Banner principal compacto ---------- */}
      <section className="bg-gradient-to-br from-brand-coral to-brand-mustard text-white">
        <div className="container-page py-12 md:py-20">
          <h1 className="max-w-2xl text-balance text-4xl md:text-5xl">
            Recordatorios que celebran tus momentos
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/90">
            Morrales, loncheras, kits y recordatorios personalizados para cumpleaños, baby
            shower, quinceaños y más. Fabricación nacional. 🎉
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/catalogo"
              className="rounded-pill bg-white px-6 py-3 font-semibold text-brand-coral shadow-md transition-transform hover:scale-105"
            >
              Ver catálogo
            </Link>
            {waNumber ? (
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-pill bg-whatsapp px-6 py-3 font-semibold text-white shadow-md transition-transform hover:scale-105"
              >
                💬 Cotizar por WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {/* ---------- Explora por ocasión ---------- */}
      <section className="container-page py-12">
        <h2 className="mb-6 text-2xl md:text-3xl">Explora por ocasión</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((cat: any) => (
            <Link
              key={cat.slug}
              to={cat.to ?? `/ocasion/${cat.slug}`}
              className="group flex flex-col items-center gap-3 rounded-lg border border-border bg-brand-cream p-6 text-center transition-shadow hover:shadow-md"
            >
              <span className="text-4xl">{cat.icon ?? "🎉"}</span>
              <span className="font-display font-semibold group-hover:text-brand-coral">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Destacados ---------- */}
      <section className="container-page py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl">Destacados</h2>
          <Link to="/catalogo" className="text-sm font-semibold text-brand-coral hover:underline">
            Ver todo →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {featured.map((p: any) => (
            <ProductCard key={p.id ?? p.code} product={p} waNumber={waNumber} publicUrl={publicUrl} />
          ))}
        </div>
      </section>

      {/* ---------- Catálogo completo (lazy) ---------- */}
      {catalog.length > 0 ? (
        <section className="container-page py-12">
          <h2 className="mb-6 text-2xl md:text-3xl">Catálogo completo</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {catalog.map((p: any) => (
              <ProductCard key={p.id ?? p.code} product={p} waNumber={waNumber} publicUrl={publicUrl} />
            ))}
          </div>
        </section>
      ) : null}

      {/* ---------- CTA formulario ---------- */}
      <section className="bg-brand-cream py-16">
        <div className="container-page mx-auto max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl">¿Organizando un evento?</h2>
          <p className="mt-3 text-brand-ink-soft">
            Cuéntanos qué celebras y te ayudamos a personalizar los recordatorios perfectos.
          </p>
          <Link
            to="/cotizar"
            className="mt-6 inline-block rounded-pill bg-brand-coral px-8 py-3 font-semibold text-white shadow-md transition-transform hover:scale-105"
          >
            Solicitar cotización
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
