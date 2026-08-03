import type { Route } from "./+types/ajustes";
import { Form } from "react-router";
import { AdminShell } from "~/components/admin/AdminShell";
import { Button } from "~/components/ui/Toggle";
import { Field, TextInput, TextArea, Select } from "~/components/ui/Field";
import { SingleImageUploader } from "~/components/admin/SingleImageUploader";
import { cloudflareContext } from "~/lib/cloudflare-context";
import { requireUser } from "~/lib/auth";
import { getDb } from "~/lib/db/client";
import { getAllSettings, upsertManySettings, upsertSetting } from "~/lib/db/mutations";
import { BRAND_DEFAULTS, type BrandSlug } from "~/lib/brand";

export function meta() {
  return [
    { title: "Ajustes — Admin recuerdos.store" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const user = await requireUser({ context, request });
  const { env } = context.get(cloudflareContext);
  const isAdmin = user.role === "admin";
  const scope = user.role === "admin" ? null : (user.role as BrandSlug);
  if (!env.DB) return { settings: {}, isAdmin, scope };
  const db = getDb(env.DB);
  const all = await getAllSettings(db);
  // Filtrar: si no es admin, solo exponer las claves de SU marca
  const settings: Record<string, string> = {};
  if (scope) {
    const prefix = `brand.${scope}.`;
    for (const [k, v] of Object.entries(all)) {
      if (k.startsWith(prefix)) settings[k] = v;
    }
  } else {
    Object.assign(settings, all);
  }
  return { settings, isAdmin, scope };
}

export async function action({ context, request }: Route.ActionArgs) {
  const user = await requireUser({ context, request });
  const { env } = context.get(cloudflareContext);
  if (!env.DB) return { error: "DB no disponible" };
  const db = getDb(env.DB);
  const isAdmin = user.role === "admin";
  const scope = user.role === "admin" ? null : (user.role as BrandSlug);

  const form = await request.formData();
  const entries: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    const v = String(value).trim();
    if (v) entries[key] = v;
  }

  // SEGURIDAD: una marca solo puede escribir sus propias claves.
  // Filtramos cualquier clave que no empiece con brand.<scope>.
  if (scope) {
    const prefix = `brand.${scope}.`;
    for (const key of Object.keys(entries)) {
      if (!key.startsWith(prefix)) {
        return { error: "No tienes permiso para modificar esa configuración." };
      }
    }
  }

  await upsertManySettings(db, entries);

  // brand.default solo lo puede cambiar el admin (ya validado por scope=null)
  return { ok: true };
}

export default function AdminAjustes({ loaderData, actionData }: Route.ComponentProps) {
  const { settings, isAdmin, scope } = loaderData as {
    settings: Record<string, string>;
    isAdmin: boolean;
    scope: BrandSlug | null;
  };
  const saved = (actionData as { ok?: boolean } | null)?.ok;
  const error = (actionData as { error?: string } | null)?.error;
  const get = (key: string, fallback = "") => settings[key] ?? fallback;

  return (
    <AdminShell>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-brand-ink">
          {isAdmin ? "Ajustes del sitio" : "Mi marca"}
        </h1>
        <p className="mt-1 text-sm text-brand-ink-soft">
          {isAdmin
            ? "Configuración global, marcas y contenido del sitio"
            : "Configura los datos de contacto de tu marca"}
        </p>
      </header>

      {error ? (
        <p className="mb-4 border border-error bg-error/5 px-3 py-2 text-xs text-error">{error}</p>
      ) : null}
      {saved ? (
        <p className="mb-4 border border-success bg-success/5 px-3 py-2 text-xs text-success">
          Ajustes guardados correctamente.
        </p>
      ) : null}

      <Form method="post" className="space-y-6 pb-20 md:pb-6">
        {/* ===== Bloques de marca ===== */}
        {/* Admin ve ambas marcas; una marca solo la suya */}
        {(isAdmin ? (["bellaarte", "recordarte"] as BrandSlug[]) : [scope!]).map((slug) => (
          <BrandSection
            key={slug}
            slug={slug}
            name={BRAND_DEFAULTS[slug].name}
            get={get}
            prefix={`brand.${slug}.`}
          />
        ))}

        {/* ===== Solo admin: config global ===== */}
        {isAdmin ? (
          <>
            {/* Marca por defecto */}
            <Section title="Marca por defecto">
              <Field label="Marca que se sirve en la raíz (recuerdos.store)" name="brand.default">
                <Select name="brand.default" defaultValue={get("brand.default", "bellaarte")}>
                  <option value="bellaarte">Bella Arte</option>
                  <option value="recordarte">Recordarte</option>
                </Select>
              </Field>
            </Section>

            {/* Banner superior */}
            <Section title="Banner superior">
              <Field label="Texto del banner" name="banner.top.text">
                <TextInput
                  name="banner.top.text"
                  defaultValue={get("banner.top.text", "Fabricación Nacional · Personalización para cada celebración")}
                  placeholder="Fabricación Nacional · Personalización para cada celebración"
                />
              </Field>
              <Field label="Link del banner (opcional)" name="banner.top.link">
                <TextInput name="banner.top.link" defaultValue={get("banner.top.link")} placeholder="/catalogo o https://..." />
              </Field>
              <ToggleRow name="banner.top.active" label="Mostrar banner" defaultChecked={get("banner.top.active", "true") === "true"} />
            </Section>

            {/* Cinta promocional */}
            <Section title="Cinta promocional">
              <Field label="Texto de la promoción" name="promo.text">
                <TextInput name="promo.text" defaultValue={get("promo.text")} placeholder="Envío gratis por compras al por mayor" />
              </Field>
              <ToggleRow name="promo.active" label="Mostrar cinta" defaultChecked={get("promo.active", "false") === "true"} />
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
          </>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit">Guardar ajustes</Button>
        </div>
      </Form>
    </AdminShell>
  );
}

function BrandSection({
  slug,
  name,
  get,
  prefix,
}: {
  slug: BrandSlug;
  name: string;
  get: (key: string, fallback?: string) => string;
  prefix: string;
}) {
  return (
    <Section title={`Marca: ${name}`}>
      <Field label="Foto de perfil" name={`${prefix}photo`}>
        <SingleImageUploader
          name={`${prefix}photo`}
          initialKey={get(`${prefix}photo`) || null}
          prefix="perfiles"
          hint="Avatar circular que aparece en el footer de contacto"
        />
      </Field>
      <Field label="Número de WhatsApp" name={`${prefix}whatsapp`} hint="Formato internacional sin +, ej: 573001234567">
        <TextInput name={`${prefix}whatsapp`} defaultValue={get(`${prefix}whatsapp`, BRAND_DEFAULTS[slug].whatsapp)} placeholder="573001234567" />
      </Field>
      <Field label="Enlace de Instagram" name={`${prefix}instagram`}>
        <TextInput name={`${prefix}instagram`} defaultValue={get(`${prefix}instagram`, BRAND_DEFAULTS[slug].instagram)} placeholder="https://instagram.com/..." />
      </Field>
      <Field label="Enlace de Facebook" name={`${prefix}facebook`}>
        <TextInput name={`${prefix}facebook`} defaultValue={get(`${prefix}facebook`)} placeholder="https://facebook.com/..." />
      </Field>
    </Section>
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

function ToggleRow({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-sm text-brand-ink">{label}</span>
      <input
        type="checkbox"
        name={name}
        value="true"
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="relative h-6 w-11 rounded-full border border-border bg-surface-off transition-colors peer-checked:bg-brand-ink after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-surface after:transition-transform peer-checked:after:translate-x-5" />
      <input type="hidden" name={name} value="false" />
    </label>
  );
}
