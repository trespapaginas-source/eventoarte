import type { Route } from "./+types/ocasion";
import type { MetaDescriptor } from "react-router";
import { cloudflareContext } from "~/lib/cloudflare-context";
import { PublicLayout } from "~/components/layout/PublicLayout";
import { ProductCard } from "~/components/catalog/ProductCard";
import { getDb } from "~/lib/db/client";
import { loadPublicData } from "~/lib/public-data";
import { isIndexedBrand, resolveBrand } from "~/lib/brand";
import { sampleProducts } from "~/lib/sample-data";

export function meta({ params }: Route.MetaArgs) {
  const noindex = !isIndexedBrand(resolveBrand(params.brand));
  const tags: MetaDescriptor[] = [{ title: `${params.slug} — recuerdos.store` }];
  if (noindex) tags.push({ name: "robots", content: "noindex, nofollow" });
  return tags;
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const env = context.get(cloudflareContext).env;
  const db = env.DB ? getDb(env.DB) : null;
  const site = await loadPublicData({ db, brandSlug: params.brand, publicUrl: env.PUBLIC_URL });
  return { ...site, products: sampleProducts };
}

export default function Ocasion({ loaderData, params }: Route.ComponentProps) {
  const { products, brand, banner } = loaderData;
  return (
    <PublicLayout brand={brand} banner={banner}>
      <section className="container-page py-10">
        <h1 className="mb-6 text-3xl capitalize">{params.slug?.replace(/-/g, " ")}</h1>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((p: any) => (
            <ProductCard key={p.id ?? p.code} product={p} />
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
