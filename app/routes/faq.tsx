import type { Route } from "./+types/faq";
import { cloudflareContext } from "~/lib/cloudflare-context";
import { PublicLayout } from "~/components/layout/PublicLayout";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Preguntas frecuentes — recuerdos.store" },
    { name: "description", content: "Resolvemos tus dudas sobre pedidos, personalización y tiempos de entrega." },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  return { waNumber: context.get(cloudflareContext).env.WA_NUMBER };
}

const faqs = [
  { q: "¿Cuál es la cantidad mínima de pedido?", a: "Cada producto indica su cantidad mínima. Por lo general parte de 25 a 50 unidades, pero lo confirmamos en la cotización." },
  { q: "¿Cuánto tarda la fabricación?", a: "Depende del producto y la personalización; la mayoría entre 3 y 10 días hábiles. Lo verás en cada ficha." },
  { q: "¿Puedo personalizar colores y temática?", a: "Sí. La personalización es nuestra especialidad: colores, nombres, temáticas y tipo de estampado o bordado." },
  { q: "¿Cómo cotizo?", a: "Con el botón 'Cotizar por WhatsApp' en cada producto, o desde el formulario de cotización. Te respondemos con el precio y disponibilidad." },
  { q: "¿Hacen envíos?", a: "Sí, a todo Colombia. El costo depende del destino y se confirma al cotizar." },
];

export default function Faq({ loaderData }: Route.ComponentProps) {
  const { waNumber } = loaderData;
  return (
    <PublicLayout waNumber={waNumber}>
      <section className="container-page py-12">
        <h1 className="text-3xl md:text-4xl">Preguntas frecuentes</h1>
        <dl className="mt-8 max-w-2xl divide-y divide-border">
          {faqs.map((f) => (
            <div key={f.q} className="py-4">
              <dt className="font-display text-lg">{f.q}</dt>
              <dd className="mt-1 text-brand-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </PublicLayout>
  );
}
