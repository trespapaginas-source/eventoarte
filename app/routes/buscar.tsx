import type { Route } from "./+types/buscar";
import type { MetaDescriptor } from "react-router";
import { cloudflareContext } from "~/lib/cloudflare-context";
import { PublicLayout } from "~/components/layout/PublicLayout";
import { ProductCard } from "~/components/catalog/ProductCard";
import { getDb } from "~/lib/db/client";
import { loadPublicData, normalizeProduct } from "~/lib/public-data";
import { isIndexedBrand, resolveBrand } from "~/lib/brand";
import { listProducts } from "~/lib/db/queries";
import { sampleProducts } from "~/lib/sample-data";

export function meta({ params }: Route.MetaArgs) {
  const noindex = !isIndexedBrand(resolveBrand(params.brand));
  const tags: MetaDescriptor[] = [{ title: "Buscar — recuerdos.store" }];
  if (noindex) tags.push({ name: "robots", content: "noindex, nofollow" });
  return tags;
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const env = context.get(cloudflareContext).env;
  const db = env.DB ? getDb(env.DB) : null;

  const site = await loadPublicData({ db, brandSlug: params.brand, publicUrl: env.PUBLIC_URL });

  let results: any[] = q
    ? sampleProducts.filter(
        (p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.code.toLowerCase().includes(q.toLowerCase()),
      )
    : [];

  try {
    if (db && q) {
      const r = await listProducts(db, { search: q });
      if (r.length) results = r.map(normalizeProduct) as any;
    }
  } catch {
    /* muestra */
  }
  return { ...site, q, results };
}

export default function Buscar({ loaderData }: Route.ComponentProps) {
  const { q, results, brand, banner } = loaderData;
  return (
    <PublicLayout brand={brand} banner={banner}>
      <section className="container-page py-10">
        <h1 className="mb-2 text-2xl md:text-3xl">
          {q ? `Resultados para "${q}"` : "Buscar productos"}
        </h1>
        {q && results.length === 0 ? (
          <p className="text-brand-ink-soft">No encontramos productos. Prueba con otro término o código.</p>
        ) : null}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.id ?? p.code} product={p} />
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
