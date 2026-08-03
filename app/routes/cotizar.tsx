import type { Route } from "./+types/cotizar";
import { cloudflareContext } from "~/lib/cloudflare-context";
import { PublicLayout } from "~/components/layout/PublicLayout";
import { getDb } from "~/lib/db/client";
import { insertQuote } from "~/lib/db/mutations";
import { quoteInsertSchema } from "~/lib/validation";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Solicitar cotización — recuerdos.store" },
    { name: "description", content: "Cuéntanos sobre tu evento y te enviamos una cotización a la medida." },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  return { waNumber: context.get(cloudflareContext).env.WA_NUMBER };
}

/** Procesa el form público de cotización → inserta en tabla quotes. */
export async function action({ context, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const form = await request.formData();
  const raw = Object.fromEntries(form.entries());

  const parsed = quoteInsertSchema.safeParse({
    ...raw,
    productId: raw.productId ? Number(raw.productId) : null,
    quantity: raw.quantity ? Number(raw.quantity) : null,
    email: raw.email === "" ? null : raw.email,
    source: "form",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  if (env.DB) {
    try {
      const db = getDb(env.DB);
      await insertQuote(db, parsed.data as any);
    } catch {
      // Si la BD falla, no bloqueamos al usuario: seguimos al gracias
    }
  }

  // Redirige a página de agradecimiento (data.success lo activa)
  return { success: true };
}

export default function Cotizar({ loaderData, actionData }: Route.ComponentProps) {
  const { waNumber } = loaderData;
  const success = (actionData as { success?: boolean } | null)?.success;
  const error = (actionData as { error?: string } | null)?.error;

  return (
    <PublicLayout waNumber={waNumber}>
      <section className="container-page py-12">
        <div className="mx-auto max-w-xl">
          {success ? (
            <div className="border border-success bg-success/5 p-8 text-center">
              <h1 className="text-2xl font-bold text-brand-ink">¡Solicitud enviada!</h1>
              <p className="mt-3 text-sm text-brand-ink-soft">
                Gracias por escribirnos. Te contactaremos en menos de 24 horas hábiles.
              </p>
              <a
                href="/"
                className="mt-6 inline-block border border-brand-ink bg-brand-ink px-5 py-2.5 text-xs font-medium uppercase tracking-[1.5px] text-white transition-all hover:bg-transparent hover:text-brand-ink"
              >
                Volver al inicio
              </a>
            </div>
          ) : (
            <>
              <h1 className="text-3xl md:text-4xl">Solicita tu cotización</h1>
              <p className="mt-3 text-brand-ink-soft">
                Completa el formulario o escríbenos directo por WhatsApp. Te respondemos lo antes posible.
              </p>

              {error ? (
                <p className="mt-4 border border-error bg-error/5 px-3 py-2 text-xs text-error">
                  {error}
                </p>
              ) : null}

              <form method="post" className="mt-8 grid gap-4">
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
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 focus:border-brand-ink focus:outline-none"
                    placeholder="Cuéntanos el tema, colores y detalles que quieres personalizar."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full border border-brand-ink bg-brand-ink py-3 text-xs font-medium uppercase tracking-[1.5px] text-white transition-all hover:bg-transparent hover:text-brand-ink"
                >
                  Enviar solicitud
                </button>
              </form>
            </>
          )}
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
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 focus:border-brand focus:outline-none"
      />
    </div>
  );
}
