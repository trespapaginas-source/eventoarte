import type { Route } from "./+types/ajustes";
import { Form } from "react-router";
import { AdminShell } from "~/components/admin/AdminShell";
import { Button } from "~/components/ui/Toggle";
import { Field, TextInput, TextArea } from "~/components/ui/Field";
import { cloudflareContext } from "~/lib/cloudflare-context";
import { requireAdmin } from "~/lib/auth";
import { getDb } from "~/lib/db/client";
import { getAllSettings, upsertManySettings } from "~/lib/db/mutations";

export function meta() {
  return [
    { title: "Ajustes — Admin recuerdos.store" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  await requireAdmin({ context, request });
  const { env } = context.get(cloudflareContext);
  if (!env.DB) return { settings: {} };
  const db = getDb(env.DB);
  const settings = await getAllSettings(db);
  return { settings };
}

export async function action({ context, request }: Route.ActionArgs) {
  await requireAdmin({ context, request });
  const { env } = context.get(cloudflareContext);
  if (!env.DB) return { error: "DB no disponible" };
  const db = getDb(env.DB);

  const form = await request.formData();
  const entries: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    const v = String(value).trim();
    if (v) entries[key] = v;
  }
  await upsertManySettings(db, entries);
  return { ok: true };
}

export default function AdminAjustes({ loaderData, actionData }: Route.ComponentProps) {
  const { settings } = loaderData as { settings: Record<string, string> };
  const saved = (actionData as { ok?: boolean } | null)?.ok;

  const get = (key: string, fallback = "") => settings[key] ?? fallback;

  return (
    <AdminShell>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-brand-ink">Ajustes del sitio</h1>
        <p className="mt-1 text-sm text-brand-ink-soft">
          Información de contacto, redes y SEO global
        </p>
      </header>

      {saved ? (
        <p className="mb-4 border border-success bg-success/5 px-3 py-2 text-xs text-success">
          Ajustes guardados correctamente.
        </p>
      ) : null}

      <Form method="post" className="space-y-6 pb-20 md:pb-6">
        {/* Contacto */}
        <Section title="Contacto y redes">
          <Field label="Número de WhatsApp" name="site.whatsapp" hint="Formato internacional sin +, ej: 573001234567">
            <TextInput name="site.whatsapp" defaultValue={get("site.whatsapp")} placeholder="573001234567" />
          </Field>
          <Field label="Usuario de Instagram" name="site.instagram">
            <TextInput name="site.instagram" defaultValue={get("site.instagram")} placeholder="recuerdos.store" />
          </Field>
          <Field label="URL pública del sitio" name="site.public_url">
            <TextInput name="site.public_url" defaultValue={get("site.public_url")} placeholder="https://recuerdos.store" />
          </Field>
        </Section>

        {/* SEO */}
        <Section title="SEO global">
          <Field label="Título por defecto" name="seo.default_title">
            <TextInput name="seo.default_title" defaultValue={get("seo.default_title")} />
          </Field>
          <Field label="Descripción por defecto" name="seo.default_desc">
            <TextArea name="seo.default_desc" defaultValue={get("seo.default_desc")} rows={2} />
          </Field>
        </Section>

        {/* Footer */}
        <Section title="Footer">
          <Field label="Texto del footer" name="footer.text">
            <TextArea name="footer.text" defaultValue={get("footer.text")} rows={2} />
          </Field>
        </Section>

        <div className="flex justify-end">
          <Button type="submit">Guardar ajustes</Button>
        </div>
      </Form>
    </AdminShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-border bg-surface p-4 md:p-6">
      <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[1.5px] text-brand-ink">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
