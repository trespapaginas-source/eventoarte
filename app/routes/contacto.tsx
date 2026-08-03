import type { Route } from "./+types/contacto";
import { PublicLayout } from "~/components/layout/PublicLayout";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Contacto — eventoarte.co" }];
}

export async function loader({ context }: Route.LoaderArgs) {
  return { waNumber: context.cloudflare.env.WA_NUMBER };
}

export default function Contacto({ loaderData }: Route.ComponentProps) {
  const { waNumber } = loaderData;
  return (
    <PublicLayout waNumber={waNumber}>
      <section className="container-page py-12">
        <h1 className="text-3xl md:text-4xl">Contáctanos</h1>
        <p className="mt-3 max-w-xl text-brand-ink-soft">
          Estamos para ayudarte a celebrar tus momentos. Escríbenos por WhatsApp y te
          responderemos a la brevedad.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          {waNumber ? (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
              className="rounded-pill bg-whatsapp px-6 py-3 font-semibold text-white">
              💬 WhatsApp
            </a>
          ) : null}
          <a href="https://instagram.com/eventoarte.co" target="_blank" rel="noreferrer"
            className="rounded-pill border border-brand-ink px-6 py-3 font-semibold">
            📷 Instagram
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}
