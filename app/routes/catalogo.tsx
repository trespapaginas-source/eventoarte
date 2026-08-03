import type { Route } from "./+types/catalogo";
import { PublicLayout } from "~/components/layout/PublicLayout";
import { ProductCard } from "~/components/catalog/ProductCard";
import { FilterBar } from "~/components/catalog/FilterBar";
import { BrandLink } from "~/lib/brand-links";
import { canonicalUrl, isIndexedBrand, resolveBrand } from "~/lib/brand";
import { getDb } from "~/lib/db/client";
import { loadPublicData } from "~/lib/public-data";
import { listProducts } from "~/lib/db/queries";
import {
  sampleProducts,
  sampleCategories,
  applyFilters,
  type SortOption,
} from "~/lib/sample-data";
import { cloudflareContext } from "~/lib/cloudflare-context";

export function meta({ params }: Route.MetaArgs) {
  const publicUrl = "https://recuerdos.store";
  const noindex = !isIndexedBrand(resolveBrand(params.brand));
  const tags = [
    { title: "Catálogo — recuerdos.store" },
    {
      name: "description",
      content:
        "Explora y filtra nuestros recordatorios personalizados: por precio, más vendidos, novedades, niños o niñas.",
    },
    { tagName: "link", rel: "canonical", href: canonicalUrl(publicUrl, "/catalogo") },
    { property: "og:type", content: "website" },
    { property: "og:title", content: "Catálogo — recuerdos.store" },
    {
      property: "og:description",
      content:
        "Explora y filtra nuestros recordatorios personalizados: por precio, más vendidos, novedades, niños o niñas.",
    },
    { property: "og:url", content: canonicalUrl(publicUrl, "/catalogo") },
  ];
  if (noindex) tags.push({ name: "robots", content: "noindex, nofollow" });
  return tags;
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const { env } = context.get(cloudflareContext);
  const db = env.DB ? getDb(env.DB) : null;

  // Leer filtros de la URL
  const filters = {
    audience: url.searchParams.get("publico") ?? "",
    category: url.searchParams.get("categoria") ?? "",
    sort: (url.searchParams.get("orden") as SortOption) ?? "relevancia",
  };

  const [site, baseProducts] = await Promise.all([
    loadPublicData({ db, brandSlug: params.brand, publicUrl: env.PUBLIC_URL }),
    (async () => {
      let p = sampleProducts;
      try {
        if (db) {
          const r = await listProducts(db, { sort: filters.sort as any });
          if (r.length) p = r as any;
        }
      } catch {}
      return p;
    })(),
  ]);

  // Aplicar filtros
  const products = applyFilters(baseProducts, filters);

  return {
    ...site,
    products,
    categories: sampleCategories,
    activeCategory: filters.category,
  };
}

export default function Catalogo({ loaderData }: Route.ComponentProps) {
  const { products, categories, activeCategory, brand, banner } = loaderData;

  return (
    <PublicLayout brand={brand} banner={banner}>
      {/* Encabezado */}
      <section className="border-b border-border bg-surface-off">
        <div className="container-page py-10 text-center">
          <nav className="mb-3 text-xs text-brand-ink-soft" aria-label="Migas de pan">
            <BrandLink to="/" className="hover:text-brand-ink">Inicio</BrandLink>
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
              <ProductCard key={p.id ?? p.code} product={p} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="mt-4 text-brand-ink-soft">
              No encontramos productos con esos filtros.
            </p>
            <BrandLink to="/catalogo" className="mt-4 inline-block text-gradient-brand hover:underline">
              Limpiar filtros y ver todo
            </BrandLink>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

