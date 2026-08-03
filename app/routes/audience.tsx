import type { Route } from "./+types/audience";
import { Link } from "react-router";
import { PublicLayout } from "~/components/layout/PublicLayout";
import { ProductCard } from "~/components/catalog/ProductCard";
import { FilterBar } from "~/components/catalog/FilterBar";
import {
  sampleCategories,
  getProductsByAudience,
  applyFilters,
  getPriceRange,
  type SortOption,
} from "~/lib/sample-data";
import { cloudflareContext } from "~/lib/cloudflare-context";

export function meta({ location }: Route.MetaArgs) {
  // Resolvemos público desde la URL (rutas planas /ninos, /ninas — sin params).
  const isNinas = location.pathname.includes("ninas");
  const label = isNinas ? "Niñas" : "Niños";
  const slug = isNinas ? "ninas" : "ninos";
  const publicUrl = "https://eventoarte.co";
  const title = `${label} — Recordatorios personalizados | eventoarte.co`;
  return [
    { title },
    {
      name: "description",
      content: `Recordatorios y productos personalizados para ${label.toLowerCase()}: morrales, loncheras, cartucheras, tulas y más.`,
    },
    { tagName: "link", rel: "canonical", href: `${publicUrl}/${slug}` },
    { property: "og:type", content: "website" },
    { property: "og:title", content: `${label} — eventoarte.co` },
    {
      property: "og:description",
      content: `Recordatorios personalizados para ${label.toLowerCase()}.`,
    },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const pathname = new URL(request.url).pathname;
  const url = new URL(request.url);
  const audience = pathname.includes("ninas") ? "ninas" : "ninos";
  const label = audience === "ninas" ? "Niñas" : "Niños";

  const filters = {
    minPrice: url.searchParams.get("min") ? Number(url.searchParams.get("min")) : undefined,
    maxPrice: url.searchParams.get("max") ? Number(url.searchParams.get("max")) : undefined,
    category: url.searchParams.get("categoria") ?? "",
    sort: (url.searchParams.get("orden") as SortOption) ?? "relevancia",
  };

  const baseProducts = getProductsByAudience(audience);
  const products = applyFilters(baseProducts, filters);
  const priceRange = getPriceRange(baseProducts);

  return {
    products,
    categories: sampleCategories,
    audience,
    label,
    priceRange,
    activeCategory: filters.category,
    waNumber: env.WA_NUMBER,
    publicUrl: env.PUBLIC_URL,
  };
}

export default function Audience({ loaderData }: Route.ComponentProps) {
  const { products, categories, label, priceRange, activeCategory, waNumber, publicUrl } = loaderData;

  return (
    <PublicLayout waNumber={waNumber}>
      {/* Encabezado */}
      <section className="border-b border-border bg-surface-off">
        <div className="container-page py-12 text-center">
          <nav className="mb-3 text-xs text-brand-ink-soft" aria-label="Migas de pan">
            <Link to="/" className="hover:text-brand-coral">Inicio</Link>
            <span className="mx-2">/</span>
            <span className="text-brand-ink">{label}</span>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight text-brand-ink md:text-4xl">{label}</h1>
          <p className="mt-2 text-brand-ink-soft">
            Recordatorios personalizados para {label.toLowerCase()}
          </p>
        </div>
      </section>

      {/* Selector alternar Niños/Niñas */}
      <section className="border-b border-border">
        <div className="container-page flex flex-wrap justify-center gap-2 py-4">
          <Link
            to="/ninos"
            className={`border px-5 py-2 text-[11px] font-medium uppercase tracking-[1.5px] transition-colors ${
              label === "Niños"
                ? "border-brand-ink bg-brand-ink text-white"
                : "border-border bg-surface text-brand-ink-soft hover:border-brand-ink"
            }`}
          >
            🚀 Niños
          </Link>
          <Link
            to="/ninas"
            className={`border px-5 py-2 text-[11px] font-medium uppercase tracking-[1.5px] transition-colors ${
              label === "Niñas"
                ? "border-brand-ink bg-brand-ink text-white"
                : "border-border bg-surface text-brand-ink-soft hover:border-brand-ink"
            }`}
          >
            🎀 Niñas
          </Link>
          {/* (los emojis son sutiles, mantienen el tono festivo-controlado) */}
          <Link
            to="/catalogo"
            className="border border-border bg-surface px-5 py-2 text-[11px] font-medium uppercase tracking-[1.5px] text-brand-ink-soft transition-colors hover:border-brand-ink hover:text-brand-ink"
          >
            Ver todo
          </Link>
        </div>
      </section>

      {/* Filtros (precio + orden + categoría) */}
      <FilterBar
        priceMin={priceRange.min}
        priceMax={priceRange.max}
        showCategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        totalResults={products.length}
      />

      {/* Productos */}
      <section className="container-page py-10">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
            {products.map((p: any) => (
              <ProductCard key={p.id ?? p.code} product={p} waNumber={waNumber} publicUrl={publicUrl} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="mt-4 text-brand-ink-soft">No hay productos con esos filtros.</p>
            <Link to={label === "Niñas" ? "/ninas" : "/ninos"} className="mt-4 inline-block text-brand-coral hover:underline">
              Limpiar filtros
            </Link>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
