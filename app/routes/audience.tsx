import type { Route } from "./+types/audience";
import { Link } from "react-router";
import { PublicLayout } from "~/components/layout/PublicLayout";
import { ProductCard } from "~/components/catalog/ProductCard";
import {
  sampleProducts,
  sampleCategories,
  getProductsByAudience,
} from "~/lib/sample-data";
import { cloudflareContext } from "~/lib/cloudflare-context";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Niños y Niñas — eventoarte.co" },
    {
      name: "description",
      content: "Recordatorios y productos personalizados para niños y niñas: morrales, loncheras, cartucheras y más.",
    },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const pathname = new URL(request.url).pathname;
  const audience = pathname.includes("ninas") ? "ninas" : "ninos";
  const label = audience === "ninas" ? "Niñas" : "Niños";
  const products = getProductsByAudience(audience);

  return {
    products,
    categories: sampleCategories,
    audience,
    label,
    waNumber: env.WA_NUMBER,
    publicUrl: env.PUBLIC_URL,
  };
}

export default function Audience({ loaderData }: Route.ComponentProps) {
  const { products, categories, label, waNumber, publicUrl } = loaderData;
  const emoji = label === "Niñas" ? "🎀" : "🚀";

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
          <span className="text-5xl">{emoji}</span>
          <h1 className="mt-3 text-3xl font-bold text-brand-ink md:text-4xl">{label}</h1>
          <p className="mt-2 text-brand-ink-soft">
            {products.length} {products.length === 1 ? "producto personalizado" : "productos personalizados"} para {label.toLowerCase()}
          </p>
        </div>
      </section>

      {/* Selector alternar Niños/Niñas */}
      <section className="container-page py-6">
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            to="/ninos"
            className={`border px-5 py-2 text-[11px] font-medium uppercase tracking-[1.5px] transition-colors ${
              label === "Niños"
                ? "border-brand-ink bg-brand-ink text-white"
                : "border-border bg-surface text-brand-ink-soft hover:border-brand-ink hover:text-brand-ink"
            }`}
          >
            🚀 Niños
          </Link>
          <Link
            to="/ninas"
            className={`border px-5 py-2 text-[11px] font-medium uppercase tracking-[1.5px] transition-colors ${
              label === "Niñas"
                ? "border-brand-ink bg-brand-ink text-white"
                : "border-border bg-surface text-brand-ink-soft hover:border-brand-ink hover:text-brand-ink"
            }`}
          >
            🎀 Niñas
          </Link>
          <Link
            to="/catalogo"
            className="border border-border bg-surface px-5 py-2 text-[11px] font-medium uppercase tracking-[1.5px] text-brand-ink-soft transition-colors hover:border-brand-ink hover:text-brand-ink"
          >
            Ver todo
          </Link>
        </div>
      </section>

      {/* Productos */}
      <section className="container-page pb-16">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
            {products.map((p: any) => (
              <ProductCard key={p.id ?? p.code} product={p} waNumber={waNumber} publicUrl={publicUrl} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-5xl">{emoji}</p>
            <p className="mt-4 text-brand-ink-soft">Pronto tendremos más productos para {label.toLowerCase()}.</p>
            <Link to="/catalogo" className="mt-4 inline-block text-brand-coral hover:underline">
              Ver todo el catálogo
            </Link>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
