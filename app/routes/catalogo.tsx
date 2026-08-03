import type { Route } from "./+types/catalogo";
import { cloudflareContext } from "~/lib/cloudflare-context";
import { PublicLayout } from "~/components/layout/PublicLayout";
import { ProductCard } from "~/components/catalog/ProductCard";
import { getDb } from "~/lib/db/client";
import { listProducts } from "~/lib/db/queries";
import { sampleProducts } from "~/lib/sample-data";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Catálogo — eventoarte.co" },
    { name: "description", content: "Explora todos nuestros recordatorios y productos personalizados para eventos." },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const sort = (url.searchParams.get("sort") as any) ?? "featured";
  const env = context.get(cloudflareContext).env;

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
  return { products, waNumber: env.WA_NUMBER, publicUrl: env.PUBLIC_URL };
}

export default function Catalogo({ loaderData }: Route.ComponentProps) {
  const { products, waNumber, publicUrl } = loaderData;
  return (
    <PublicLayout waNumber={waNumber}>
      <section className="container-page py-10">
        <h1 className="mb-6 text-3xl md:text-4xl">Catálogo</h1>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((p: any) => (
            <ProductCard key={p.id ?? p.code} product={p} waNumber={waNumber} publicUrl={publicUrl} />
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
