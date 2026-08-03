import type { Route } from "./+types/catalogo";
import { Link } from "react-router";
import { PublicLayout } from "~/components/layout/PublicLayout";
import { ProductCard } from "~/components/catalog/ProductCard";
import { FilterBar } from "~/components/catalog/FilterBar";
import { getDb } from "~/lib/db/client";
import { listProducts } from "~/lib/db/queries";
import {
  sampleProducts,
  sampleCategories,
  applyFilters,
  getPriceRange,
  type SortOption,
} from "~/lib/sample-data";
import { cloudflareContext } from "~/lib/cloudflare-context";

export function meta(_: Route.MetaArgs) {
  const publicUrl = "https://eventoarte.co";
  return [
    { title: "Catálogo — eventoarte.co" },
    {
      name: "description",
      content:
        "Explora y filtra nuestros recordatorios personalizados: por precio, más vendidos, novedades, niños o niñas.",
    },
    { tagName: "link", rel: "canonical", href: `${publicUrl}/catalogo` },
    { property: "og:type", content: "website" },
    { property: "og:title", content: "Catálogo — eventoarte.co" },
    {
      property: "og:description",
      content:
        "Explora y filtra nuestros recordatorios personalizados: por precio, más vendidos, novedades, niños o niñas.",
    },
    { property: "og:url", content: `${publicUrl}/catalogo` },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const { env } = context.get(cloudflareContext);

  // Leer filtros de la URL
  const filters = {
    audience: url.searchParams.get("publico") ?? "",
    category: url.searchParams.get("categoria") ?? "",
    minPrice: url.searchParams.get("min") ? Number(url.searchParams.get("min")) : undefined,
    maxPrice: url.searchParams.get("max") ? Number(url.searchParams.get("max")) : undefined,
    sort: (url.searchParams.get("orden") as SortOption) ?? "relevancia",
  };

  let baseProducts = sampleProducts;
  try {
    if (env.DB) {
      const db = getDb(env.DB);
      const result = await listProducts(db, { sort: filters.sort as any });
      if (result.length) baseProducts = result as any;
    }
  } catch {
    /* muestra */
  }

  // Aplicar filtros
  const products = applyFilters(baseProducts, filters);
  const priceRange = getPriceRange();

  return {
    products,
    categories: sampleCategories,
    priceRange,
    activeCategory: filters.category,
    waNumber: env.WA_NUMBER,
    publicUrl: env.PUBLIC_URL,
  };
}

export default function Catalogo({ loaderData }: Route.ComponentProps) {
  const { products, categories, priceRange, activeCategory, waNumber, publicUrl } = loaderData;

  return (
    <PublicLayout waNumber={waNumber}>
      {/* Encabezado */}
      <section className="border-b border-border bg-surface-off">
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
            Filtra por público, precio o categoría para encontrar el recuerdo perfecto
          </p>
        </div>
      </section>

      {/* Barra de filtros */}
      <FilterBar
        priceMin={priceRange.min}
        priceMax={priceRange.max}
        showCategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        totalResults={products.length}
      />

      {/* Grid de productos */}
      <section className="container-page py-10">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
            {products.map((p: any) => (
              <ProductCard key={p.id ?? p.code} product={p} waNumber={waNumber} publicUrl={publicUrl} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="mt-4 text-brand-ink-soft">
              No encontramos productos con esos filtros.
            </p>
            <Link to="/catalogo" className="mt-4 inline-block text-brand-coral hover:underline">
              Limpiar filtros y ver todo
            </Link>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
