import type { Route } from "./+types/sobre-nosotros";
import { PublicLayout } from "~/components/layout/PublicLayout";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Sobre nosotros — eventoarte.co" },
    { name: "description", content: "Fabricación nacional de recordatorios personalizados para eventos en Colombia." },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  return { waNumber: context.cloudflare.env.WA_NUMBER };
}

export default function SobreNosotros({ loaderData }: Route.ComponentProps) {
  const { waNumber } = loaderData;
  return (
    <PublicLayout waNumber={waNumber}>
      <section className="container-page py-12">
        <h1 className="text-3xl md:text-4xl">Sobre eventoarte.co</h1>
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
          <p>🎉 <strong>Hecho en Colombia, para celebrar contigo.</strong></p>
        </div>
      </section>
    </PublicLayout>
  );
}
