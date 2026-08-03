import type { Route } from "./+types/categoria";
import { Link } from "react-router";
import { PublicLayout } from "~/components/layout/PublicLayout";
import { ProductCard } from "~/components/catalog/ProductCard";
import {
  sampleProducts,
  sampleCategories,
  getProductsByCategory,
  getCategoryBySlug,
} from "~/lib/sample-data";
import { cloudflareContext } from "~/lib/cloudflare-context";

export function meta({ params }: Route.MetaArgs) {
  const cat = getCategoryBySlug(params.slug ?? "");
  return [
    { title: `${cat?.name ?? "Categoría"} — eventoarte.co` },
    {
      name: "description",
      content: `Descubre nuestra colección de ${cat?.name?.toLowerCase() ?? "productos"} personalizados para eventos.`,
    },
  ];
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const slug = params.slug ?? "";
  const category = getCategoryBySlug(slug);
  const products = getProductsByCategory(slug);

  return {
    products: products.length ? products : sampleProducts,
    category,
    categories: sampleCategories,
    waNumber: env.WA_NUMBER,
    publicUrl: env.PUBLIC_URL,
  };
}

export default function Categoria({ loaderData }: Route.ComponentProps) {
  const { products, category, categories, waNumber, publicUrl } = loaderData;
  const title = category?.name ?? "Categoría";

  return (
    <PublicLayout waNumber={waNumber}>
      <section className="border-b border-border bg-brand-cream">
        <div className="container-page py-10 text-center">
          <nav className="mb-3 text-xs text-brand-ink-soft" aria-label="Migas de pan">
            <Link to="/" className="hover:text-brand-coral">Inicio</Link>
            <span className="mx-2">/</span>
            <Link to="/catalogo" className="hover:text-brand-coral">Catálogo</Link>
            <span className="mx-2">/</span>
            <span className="text-brand-ink">{title}</span>
          </nav>
          <h1 className="font-display text-3xl font-bold capitalize text-brand-ink md:text-4xl">
            {title}
          </h1>
          {category?.icon ? <span className="mt-2 text-4xl">{category.icon}</span> : null}
          <p className="mt-2 text-brand-ink-soft">
            {products.length} {products.length === 1 ? "producto" : "productos"} en esta categoría
          </p>
        </div>
      </section>

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
              className={`rounded-pill border px-4 py-2 text-sm font-medium transition-colors ${
                cat.slug === category?.slug
                  ? "border-brand-coral bg-brand-coral text-white"
                  : "border-border bg-surface text-brand-ink-soft hover:border-brand-coral hover:text-brand-coral"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {products.map((p: any) => (
              <ProductCard key={p.id ?? p.code} product={p} waNumber={waNumber} publicUrl={publicUrl} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-5xl">🔍</p>
            <p className="mt-4 text-brand-ink-soft">No hay productos en esta categoría todavía.</p>
            <Link to="/catalogo" className="mt-4 inline-block text-brand-coral hover:underline">
              Ver todo el catálogo
            </Link>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
