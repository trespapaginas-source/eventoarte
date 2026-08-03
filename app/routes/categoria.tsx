import type { Route } from "./+types/categoria";
import { PublicLayout } from "~/components/layout/PublicLayout";
import { ProductCard } from "~/components/catalog/ProductCard";
import { FilterBar } from "~/components/catalog/FilterBar";
import { BrandLink } from "~/lib/brand-links";
import { canonicalUrl, isIndexedBrand, resolveBrand } from "~/lib/brand";
import { getDb } from "~/lib/db/client";
import { loadPublicData } from "~/lib/public-data";
import {
  sampleCategories,
  getProductsByCategory,
  getCategoryBySlug,
  applyFilters,
  type SortOption,
} from "~/lib/sample-data";
import { cloudflareContext } from "~/lib/cloudflare-context";

export function meta({ params }: Route.MetaArgs) {
  const cat = getCategoryBySlug(params.slug ?? "");
  const publicUrl = "https://recuerdos.store";
  const slug = params.slug ?? "";
  const noindex = !isIndexedBrand(resolveBrand(params.brand));
  const tags = [
    { title: `${cat?.name ?? "Categoría"} — recuerdos.store` },
    {
      name: "description",
      content: `Descubre nuestra colección de ${cat?.name?.toLowerCase() ?? "productos"} personalizados para eventos. Filtra por precio, niños o niñas.`,
    },
    { tagName: "link", rel: "canonical", href: canonicalUrl(publicUrl, `/categoria/${slug}`) },
    { property: "og:type", content: "website" },
    { property: "og:title", content: `${cat?.name ?? "Categoría"} — recuerdos.store` },
  ];
  if (noindex) tags.push({ name: "robots", content: "noindex, nofollow" });
  return tags;
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const db = env.DB ? getDb(env.DB) : null;
  const slug = params.slug ?? "";
  const url = new URL(request.url);

  const filters = {
    audience: url.searchParams.get("publico") ?? "",
    sort: (url.searchParams.get("orden") as SortOption) ?? "relevancia",
  };

  const [site] = await Promise.all([
    loadPublicData({ db, brandSlug: params.brand, publicUrl: env.PUBLIC_URL }),
  ]);

  const category = getCategoryBySlug(slug);
  const baseProducts = getProductsByCategory(slug);
  const products = applyFilters(baseProducts, filters);

  return {
    ...site,
    products,
    category,
    categories: sampleCategories,
  };
}

export default function Categoria({ loaderData }: Route.ComponentProps) {
  const { products, category, categories, brand, banner } = loaderData;
  const title = category?.name ?? "Categoría";

  return (
    <PublicLayout brand={brand} banner={banner}>
      <section className="border-b border-border bg-surface-off">
        <div className="container-page py-10 text-center">
          <nav className="mb-3 text-xs text-brand-ink-soft" aria-label="Migas de pan">
            <BrandLink to="/" className="hover:text-brand-ink">Inicio</BrandLink>
            <span className="mx-2">/</span>
            <BrandLink to="/catalogo" className="hover:text-brand-ink">Catálogo</BrandLink>
            <span className="mx-2">/</span>
            <span className="text-brand-ink">{title}</span>
          </nav>
          <h1 className="font-display text-3xl font-bold capitalize text-brand-ink md:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-brand-ink-soft">
            Personaliza cada {title.toLowerCase().slice(0, -1)} para tu celebración
          </p>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="container-page flex flex-wrap justify-center gap-2 py-4">
          <BrandLink
            to="/catalogo"
            className="border border-border bg-surface px-4 py-1.5 text-[11px] font-medium uppercase tracking-[1px] text-brand-ink-soft transition-colors hover:border-brand-ink hover:text-brand-ink"
          >
            Todas
          </BrandLink>
          {categories.map((cat: any) => (
            <BrandLink
              key={cat.slug}
              to={`/categoria/${cat.slug}`}
              className={`border px-4 py-1.5 text-[11px] font-medium uppercase tracking-[1px] transition-colors ${
                cat.slug === category?.slug
                  ? "border-brand-ink bg-brand-ink text-white"
                  : "border-border bg-surface text-brand-ink-soft hover:border-brand-ink"
              }`}
            >
              {cat.name}
            </BrandLink>
          ))}
        </div>
      </section>

      <FilterBar
        totalResults={products.length}
      />

      <section className="container-page py-10">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
            {products.map((p: any) => (
              <ProductCard key={p.id ?? p.code} product={p} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="mt-4 text-brand-ink-soft">No hay productos con esos filtros.</p>
            <BrandLink to={`/categoria/${category?.slug}`} className="mt-4 inline-block text-gradient-brand hover:underline">
              Limpiar filtros
            </BrandLink>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

