import type { Route } from "./+types/ocasion";
import { PublicLayout } from "~/components/layout/PublicLayout";
import { ProductCard } from "~/components/catalog/ProductCard";
import { sampleProducts } from "~/lib/sample-data";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `${params.slug} — eventoarte.co` }];
}

export async function loader({ context }: Route.LoaderArgs) {
  return { products: sampleProducts, waNumber: context.cloudflare.env.WA_NUMBER, publicUrl: context.cloudflare.env.PUBLIC_URL };
}

export default function Ocasion({ loaderData, params }: Route.ComponentProps) {
  const { products, waNumber, publicUrl } = loaderData;
  return (
    <PublicLayout waNumber={waNumber}>
      <section className="container-page py-10">
        <h1 className="mb-6 text-3xl capitalize">{params.slug?.replace(/-/g, " ")}</h1>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((p: any) => (
            <ProductCard key={p.id ?? p.code} product={p} waNumber={waNumber} publicUrl={publicUrl} />
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
