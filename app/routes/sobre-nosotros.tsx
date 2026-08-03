import type { Route } from "./+types/sobre-nosotros";
import { cloudflareContext } from "~/lib/cloudflare-context";
import { PublicLayout } from "~/components/layout/PublicLayout";
import { getDb } from "~/lib/db/client";
import { loadPublicData } from "~/lib/public-data";
import { isIndexedBrand, resolveBrand } from "~/lib/brand";

export function meta({ params }: Route.MetaArgs) {
  const noindex = !isIndexedBrand(resolveBrand(params.brand));
  const tags = [
    { title: "Sobre nosotros — recuerdos.store" },
    { name: "description", content: "Fabricación nacional de recordatorios personalizados para eventos en Colombia." },
  ];
  if (noindex) tags.push({ name: "robots", content: "noindex, nofollow" });
  return tags;
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const env = context.get(cloudflareContext).env;
  const db = env.DB ? getDb(env.DB) : null;
  return loadPublicData({ db, brandSlug: params.brand, publicUrl: env.PUBLIC_URL });
}

export default function SobreNosotros({ loaderData }: Route.ComponentProps) {
  const { brand, banner } = loaderData;
  return (
    <PublicLayout brand={brand} banner={banner}>
      <section className="container-page py-12">
        <h1 className="text-3xl md:text-4xl">Sobre recuerdos.store</h1>
        <div className="mt-6 max-w-2xl space-y-4 text-brand-ink-soft">
          <p>
            Somos una empresa colombiana dedicada a la fabricación y personalización de
            recordatorios y productos para celebrar los momentos más importantes: cumpleaños,
            baby showers, quinceaños, bautizos y más.
          </p>
          <p>
            Cada producto se personaliza pensando en tu evento: colores, temáticas, nombres y
            detalles que hacen único cada recuerdo. Trabajamos con materiales de calidad y tiempos
            de entrega confiables.
          </p>
          <p><strong>Hecho en Colombia, para celebrar contigo.</strong></p>
        </div>
      </section>
    </PublicLayout>
  );
}
