import type { Route } from "./+types/cotizar";
import { cloudflareContext } from "~/lib/cloudflare-context";
import { PublicLayout } from "~/components/layout/PublicLayout";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Solicitar cotización — eventoarte.co" },
    { name: "description", content: "Cuéntanos sobre tu evento y te enviamos una cotización a la medida." },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  return { waNumber: context.get(cloudflareContext).env.WA_NUMBER };
}

export default function Cotizar({ loaderData }: Route.ComponentProps) {
  const { waNumber } = loaderData;
  return (
    <PublicLayout waNumber={waNumber}>
      <section className="container-page py-12">
        <div className="mx-auto max-w-xl">
          <h1 className="text-3xl md:text-4xl">Solicita tu cotización</h1>
          <p className="mt-3 text-brand-ink-soft">
            Completa el formulario o escríbenos directo por WhatsApp. Te respondemos lo antes posible. 💬
          </p>

          <form method="post" action="/cotizar" className="mt-8 grid gap-4">
            <Field label="Nombre*" name="name" required />
            <Field label="Teléfono / WhatsApp*" name="phone" type="tel" required />
            <Field label="Correo" name="email" type="email" />
            <Field label="Cantidad aproximada" name="quantity" type="number" />
            <Field label="Fecha del evento" name="eventDate" type="date" />
            <Field label="Ocasión (cumpleaños, baby shower…)" name="occasion" />
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="message">Mensaje</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 focus:border-brand-coral focus:outline-none"
                placeholder="Cuéntanos el tema, colores y detalles que quieres personalizar."
              />
            </div>
            <button
              type="submit"
              className="rounded-pill bg-brand-coral px-6 py-3 font-semibold text-white shadow-md transition-transform hover:scale-105"
            >
              Enviar solicitud
            </button>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-md border border-border bg-surface px-3 py-2 focus:border-brand-coral focus:outline-none"
      />
    </div>
  );
}
