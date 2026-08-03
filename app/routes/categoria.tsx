import type { Route } from "./+types/categoria";
import { Link } from "react-router";
import { PublicLayout } from "~/components/layout/PublicLayout";
import { ProductCard } from "~/components/catalog/ProductCard";
import { FilterBar } from "~/components/catalog/FilterBar";
import {
  sampleCategories,
  getProductsByCategory,
  getCategoryBySlug,
  applyFilters,
  getPriceRange,
  type SortOption,
} from "~/lib/sample-data";
import { cloudflareContext } from "~/lib/cloudflare-context";

export function meta({ params }: Route.MetaArgs) {
  const cat = getCategoryBySlug(params.slug ?? "");
  return [
    { title: `${cat?.name ?? "Categoría"} — eventoarte.co` },
    {
      name: "description",
      content: `Descubre nuestra colección de ${cat?.name?.toLowerCase() ?? "productos"} personalizados para eventos. Filtra por precio, niños o niñas.`,
    },
  ];
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const slug = params.slug ?? "";
  const url = new URL(request.url);

  const filters = {
    audience: url.searchParams.get("publico") ?? "",
    minPrice: url.searchParams.get("min") ? Number(url.searchParams.get("min")) : undefined,
    maxPrice: url.searchParams.get("max") ? Number(url.searchParams.get("max")) : undefined,
    sort: (url.searchParams.get("orden") as SortOption) ?? "relevancia",
  };

  const category = getCategoryBySlug(slug);
  const baseProducts = getProductsByCategory(slug);
  const products = applyFilters(baseProducts, filters);
  const priceRange = getPriceRange(baseProducts.length ? baseProducts : undefined);

  return {
    products,
    category,
    categories: sampleCategories,
    priceRange,
    waNumber: env.WA_NUMBER,
    publicUrl: env.PUBLIC_URL,
  };
}

export default function Categoria({ loaderData }: Route.ComponentProps) {
  const { products, category, categories, priceRange, waNumber, publicUrl } = loaderData;
  const title = category?.name ?? "Categoría";

  return (
    <PublicLayout waNumber={waNumber}>
      <section className="border-b border-border bg-surface-off">
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
          {category?.icon ? <span className="mt-2 block text-4xl">{category.icon}</span> : null}
          <p className="mt-2 text-brand-ink-soft">
            Personaliza cada {title.toLowerCase().slice(0, -1)} para tu celebración
          </p>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="container-page flex flex-wrap justify-center gap-2 py-4">
          <Link
            to="/catalogo"
            className="border border-border bg-surface px-4 py-1.5 text-[11px] font-medium uppercase tracking-[1px] text-brand-ink-soft transition-colors hover:border-brand-ink hover:text-brand-ink"
          >
            Todas
          </Link>
          {categories.map((cat: any) => (
            <Link
              key={cat.slug}
              to={`/categoria/${cat.slug}`}
              className={`border px-4 py-1.5 text-[11px] font-medium uppercase tracking-[1px] transition-colors ${
                cat.slug === category?.slug
                  ? "border-brand-ink bg-brand-ink text-white"
                  : "border-border bg-surface text-brand-ink-soft hover:border-brand-ink"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      <FilterBar
        priceMin={priceRange.min}
        priceMax={priceRange.max}
        totalResults={products.length}
      />

      <section className="container-page py-10">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
            {products.map((p: any) => (
              <ProductCard key={p.id ?? p.code} product={p} waNumber={waNumber} publicUrl={publicUrl} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-5xl">🔍</p>
            <p className="mt-4 text-brand-ink-soft">No hay productos con esos filtros.</p>
            <Link to={`/categoria/${category?.slug}`} className="mt-4 inline-block text-brand-coral hover:underline">
              Limpiar filtros
            </Link>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
