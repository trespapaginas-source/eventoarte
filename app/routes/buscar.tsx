import type { Route } from "./+types/buscar";
import { cloudflareContext } from "~/lib/cloudflare-context";
import { PublicLayout } from "~/components/layout/PublicLayout";
import { ProductCard } from "~/components/catalog/ProductCard";
import { getDb } from "~/lib/db/client";
import { listProducts } from "~/lib/db/queries";
import { sampleProducts } from "~/lib/sample-data";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Buscar — recuerdos.store" }];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const env = context.get(cloudflareContext).env;

  let results: any[] = q
    ? sampleProducts.filter(
        (p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.code.toLowerCase().includes(q.toLowerCase()),
      )
    : [];

  try {
    if (env.DB && q) {
      const db = getDb(env.DB);
      const r = await listProducts(db, { search: q });
      if (r.length) results = r as any;
    }
  } catch {
    /* muestra */
  }
  return { q, results, waNumber: env.WA_NUMBER, publicUrl: env.PUBLIC_URL };
}

export default function Buscar({ loaderData }: Route.ComponentProps) {
  const { q, results, waNumber, publicUrl } = loaderData;
  return (
    <PublicLayout waNumber={waNumber}>
      <section className="container-page py-10">
        <h1 className="mb-2 text-2xl md:text-3xl">
          {q ? `Resultados para "${q}"` : "Buscar productos"}
        </h1>
        {q && results.length === 0 ? (
          <p className="text-brand-ink-soft">No encontramos productos. Prueba con otro término o código.</p>
        ) : null}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.id ?? p.code} product={p} waNumber={waNumber} publicUrl={publicUrl} />
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
