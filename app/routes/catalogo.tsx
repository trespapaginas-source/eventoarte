import type { Route } from "./+types/catalogo";
import { Link } from "react-router";
import { PublicLayout } from "~/components/layout/PublicLayout";
import { ProductCard } from "~/components/catalog/ProductCard";
import { getDb } from "~/lib/db/client";
import { listProducts } from "~/lib/db/queries";
import { sampleProducts, sampleCategories } from "~/lib/sample-data";
import { cloudflareContext } from "~/lib/cloudflare-context";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Catálogo — eventoarte.co" },
    {
      name: "description",
      content:
        "Explora todos nuestros recordatorios y productos personalizados para eventos: morrales, loncheras, cartucheras, tulas y más.",
    },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const sort = (url.searchParams.get("sort") as any) ?? "featured";
  const { env } = context.get(cloudflareContext);

  let products = sampleProducts;
  try {
    if (env.DB) {
      const db = getDb(env.DB);
      const result = await listProducts(db, { sort });
      if (result.length) products = result as any;
    }
  } catch {
    /* muestra */
  }
  return {
    products,
    categories: sampleCategories,
    waNumber: env.WA_NUMBER,
    publicUrl: env.PUBLIC_URL,
  };
}

export default function Catalogo({ loaderData }: Route.ComponentProps) {
  const { products, categories, waNumber, publicUrl } = loaderData;
  return (
    <PublicLayout waNumber={waNumber}>
      {/* Encabezado */}
      <section className="border-b border-border bg-brand-cream">
        <div className="container-page py-10 text-center">
          <nav className="mb-3 text-xs text-brand-ink-soft" aria-label="Migas de pan">
            <Link to="/" className="hover:text-brand-coral">Inicio</Link>
            <span className="mx-2">/</span>
            <span className="text-brand-ink">Catálogo</span>
          </nav>
          <h1 className="font-display text-3xl font-bold text-brand-ink md:text-4xl">
            Catálogo completo
          </h1>
          <p className="mt-2 text-brand-ink-soft">
            {products.length} productos personalizados para tus celebraciones
          </p>
        </div>
      </section>

      {/* Chips de categorías */}
      <section className="container-page py-6">
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            to="/catalogo"
            className="rounded-pill border border-border bg-surface px-4 py-2 text-sm font-medium text-brand-ink-soft transition-colors hover:border-brand-coral hover:text-brand-coral"
          >
            Todos
          </Link>
          {categories.map((cat: any) => (
            <Link
              key={cat.slug}
              to={`/categoria/${cat.slug}`}
              className="rounded-pill border border-border bg-surface px-4 py-2 text-sm font-medium text-brand-ink-soft transition-colors hover:border-brand-coral hover:text-brand-coral"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Grid de productos */}
      <section className="container-page pb-16">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {products.map((p: any) => (
            <ProductCard key={p.id ?? p.code} product={p} waNumber={waNumber} publicUrl={publicUrl} />
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
