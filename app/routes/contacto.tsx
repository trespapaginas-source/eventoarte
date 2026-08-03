import type { Route } from "./+types/contacto";
import { Link } from "react-router";
import { MessageCircle, Camera, Mail, MapPin, ArrowRight } from "lucide-react";
import { PublicLayout } from "~/components/layout/PublicLayout";
import { cloudflareContext } from "~/lib/cloudflare-context";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Contacto — eventoarte.co" },
    {
      name: "description",
      content:
        "Contáctanos para personalizar los recordatorios perfectos para tu evento. WhatsApp, Instagram y formulario de cotización.",
    },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  return { waNumber: env.WA_NUMBER, publicUrl: env.PUBLIC_URL };
}

export default function Contacto({ loaderData }: Route.ComponentProps) {
  const { waNumber, publicUrl } = loaderData;

  return (
    <PublicLayout waNumber={waNumber}>
      {/* Encabezado */}
      <section className="border-b border-border bg-surface-off">
        <div className="container-page py-12 text-center">
          <nav className="mb-3 text-xs text-brand-ink-soft" aria-label="Migas de pan">
            <Link to="/" className="hover:text-brand-ink">Inicio</Link>
            <span className="mx-2">/</span>
            <span className="text-brand-ink">Contacto</span>
          </nav>
          <h1 className="mt-3 text-3xl font-bold text-brand-ink md:text-4xl">
            Hablemos de tu evento
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-brand-ink-soft">
            Estamos para ayudarte a crear recordatorios inolvidables. Escríbenos
            por el canal que prefieras o completa el formulario.
          </p>
        </div>
      </section>

      <section className="container-page grid gap-10 py-14 md:grid-cols-2">
        {/* ===== Columna izquierda: Canales de contacto ===== */}
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-brand-ink-light">
            Canales de atención
          </h2>

          <div className="mt-5 space-y-3">
            {waNumber ? (
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-4 border border-border bg-surface p-4 transition-colors hover:border-brand-ink"
              >
                <span className="flex h-11 w-11 items-center justify-center bg-brand-ink text-white">
                  <MessageCircle size={18} strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[1.5px] text-brand-ink-light">WhatsApp</p>
                  <p className="text-sm font-medium text-brand-ink">+{waNumber} · Respuesta rápida</p>
                </div>
                <ArrowRight size={16} strokeWidth={1.5} className="ml-auto text-brand-ink-light transition-transform group-hover:translate-x-1" />
              </a>
            ) : null}

            <a
              href="https://instagram.com/eventoarte.co"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 border border-border bg-surface p-4 transition-colors hover:border-brand-ink"
            >
              <span className="flex h-11 w-11 items-center justify-center bg-brand-ink text-white">
                <Camera size={18} strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[1.5px] text-brand-ink-light">Instagram</p>
                <p className="text-sm font-medium text-brand-ink">@eventoarte.co</p>
              </div>
              <ArrowRight size={16} strokeWidth={1.5} className="ml-auto text-brand-ink-light transition-transform group-hover:translate-x-1" />
            </a>

            <a
              href="mailto:hola@eventoarte.co"
              className="group flex items-center gap-4 border border-border bg-surface p-4 transition-colors hover:border-brand-ink"
            >
              <span className="flex h-11 w-11 items-center justify-center bg-brand-ink text-white">
                <Mail size={18} strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[1.5px] text-brand-ink-light">Correo</p>
                <p className="text-sm font-medium text-brand-ink">hola@eventoarte.co</p>
              </div>
              <ArrowRight size={16} strokeWidth={1.5} className="ml-auto text-brand-ink-light transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* Horarios */}
          <div className="mt-8">
            <h3 className="text-[11px] font-bold uppercase tracking-[2px] text-brand-ink-light">
              Horario de atención
            </h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between border-b border-border pb-2">
                <dt className="text-brand-ink-soft">Lunes a Viernes</dt>
                <dd className="font-medium text-brand-ink">8:00 a.m. — 6:00 p.m.</dd>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <dt className="text-brand-ink-soft">Sábados</dt>
                <dd className="font-medium text-brand-ink">9:00 a.m. — 2:00 p.m.</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-ink-soft">Domingos y festivos</dt>
                <dd className="font-medium text-brand-ink-light">Cerrado</dd>
              </div>
            </dl>
          </div>

          {/* Cobertura */}
          <div className="mt-8 border border-border bg-surface-off p-5">
            <p className="flex items-center gap-2 text-sm font-medium text-brand-ink">
              <MapPin size={16} strokeWidth={1.5} />
              Cobertura nacional
            </p>
            <p className="mt-1 text-sm text-brand-ink-soft">
              Fabricamos y enviamos a todo Colombia. El costo de envío se confirma
              según destino y cantidad.
            </p>
          </div>
        </div>

        {/* ===== Columna derecha: Formulario ===== */}
        <div className="border border-border bg-surface p-6 md:p-8">
          <h2 className="text-lg font-bold text-brand-ink">Solicita tu cotización</h2>
          <p className="mt-1 text-sm text-brand-ink-soft">
            Completa el formulario y te contactaremos a la brevedad.
          </p>

          <form method="post" action="/cotizar" className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Nombre" name="name" required />
              <FormField label="Teléfono / WhatsApp" name="phone" type="tel" required />
            </div>
            <FormField label="Correo electrónico" name="email" type="email" />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Fecha del evento" name="eventDate" type="date" />
              <FormField label="Cantidad aprox." name="quantity" type="number" />
            </div>

            {/* Tipo de evento */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[1.5px] text-brand-ink-soft" htmlFor="occasion">
                Tipo de evento
              </label>
              <select
                id="occasion"
                name="occasion"
                className="w-full border border-border bg-surface px-3 py-2.5 text-sm text-brand-ink focus:border-brand-ink focus:outline-none"
              >
                <option value="">Selecciona una opción…</option>
                <option>Cumpleaños infantil</option>
                <option>Quinceaños</option>
                <option>Baby shower</option>
                <option>Bautizo / Primera comunión</option>
                <option>Boda</option>
                <option>Otro</option>
              </select>
            </div>

            {/* Mensaje */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[1.5px] text-brand-ink-soft" htmlFor="message">
                Cuéntanos sobre tu evento
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full border border-border bg-surface px-3 py-2.5 text-sm text-brand-ink focus:border-brand-ink focus:outline-none"
                placeholder="Tema, colores, productos de interés, detalles de personalización…"
              />
            </div>

            <button
              type="submit"
              className="w-full border border-brand-ink bg-brand-ink py-3 text-xs font-medium uppercase tracking-[1.5px] text-white transition-all hover:bg-transparent hover:text-brand-ink"
            >
              Enviar solicitud
            </button>
            <p className="text-center text-[11px] text-brand-ink-light">
              Te responderemos en menos de 24 horas hábiles.
            </p>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}

function FormField({
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
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[1.5px] text-brand-ink-soft" htmlFor={name}>
        {label}{required ? " *" : ""}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full border border-border bg-surface px-3 py-2.5 text-sm text-brand-ink focus:border-brand-ink focus:outline-none"
      />
    </div>
  );
}
