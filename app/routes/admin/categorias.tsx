import type { Route } from "./+types/categorias";
import { Form, redirect } from "react-router";
import { ArrowUp, ArrowDown, Trash2, Plus, Pencil, X } from "lucide-react";
import { useState } from "react";
import { AdminShell } from "~/components/admin/AdminShell";
import { Button } from "~/components/ui/Toggle";
import { Field, TextInput, TextArea } from "~/components/ui/Field";
import { SingleImageUploader } from "~/components/admin/SingleImageUploader";
import { cloudflareContext } from "~/lib/cloudflare-context";
import { requireUser } from "~/lib/auth";
import { getDb } from "~/lib/db/client";
import { categories } from "~/lib/db/schema";
import { asc } from "drizzle-orm";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  moveCategory,
  countProductsInCategory,
} from "~/lib/db/mutations";
import { categorySchema, slugify } from "~/lib/validation";

export function meta() {
  return [
    { title: "Categorías — Admin recuerdos.store" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  await requireUser({ context, request });
  const { env } = context.get(cloudflareContext);
  if (!env.DB) return { categories: [] };

  const db = getDb(env.DB);
  const list = await db.query.categories.findMany({
    orderBy: [asc(categories.sortOrder), asc(categories.name)],
  });
  // Contar productos por categoría
  const withCounts = await Promise.all(
    list.map(async (c) => ({
      ...c,
      productCount: await countProductsInCategory(db, c.id),
    })),
  );
  return { categories: withCounts };
}

export async function action({ context, request }: Route.ActionArgs) {
  await requireUser({ context, request });
  const { env } = context.get(cloudflareContext);
  if (!env.DB) return { error: "DB no disponible" };
  const db = getDb(env.DB);

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "move") {
    const id = Number(form.get("id"));
    const dir = String(form.get("dir")) as "up" | "down";
    await moveCategory(db, id, dir);
    return { ok: true };
  }
  if (intent === "delete") {
    const id = Number(form.get("id"));
    const count = await countProductsInCategory(db, id);
    if (count > 0) {
      return { error: `No se puede eliminar: tiene ${count} producto(s) asociado(s).` };
    }
    await deleteCategory(db, id);
    return { ok: true };
  }

  // create / update
  const id = form.get("id");
  const raw = Object.fromEntries(form.entries());
  raw.slug = raw.slug ? raw.slug : slugify(String(raw.name ?? ""));
  raw.active = (form.getAll("active").pop() ?? "false") as any;

  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  if (id) {
    await updateCategory(db, Number(id), parsed.data as any);
  } else {
    await createCategory(db, parsed.data as any);
  }
  return { ok: true };
}

export default function AdminCategorias({ loaderData, actionData }: Route.ComponentProps) {
  const { categories } = loaderData as { categories: any[] };
  const error = (actionData as { error?: string } | null)?.error;
  const saved = (actionData as { ok?: boolean } | null)?.ok;
  const [editing, setEditing] = useState<any | null>(null);

  return (
    <AdminShell>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-brand-ink">Categorías</h1>
        <p className="mt-1 text-sm text-brand-ink-soft">
          Organiza el catálogo por tipo de producto
        </p>
      </header>

      {error ? (
        <p className="mb-4 border border-error bg-error/5 px-3 py-2 text-xs text-error">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lista de categorías */}
        <div>
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[1.5px] text-brand-ink-light">
            Existentes ({categories.length})
          </h2>
          <div className="divide-y divide-border border border-border bg-surface">
            {categories.map((c, idx) => (
              <div key={c.id} className="flex items-center gap-3 p-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden border border-border bg-surface-off">
                  {c.imageKey ? (
                    <img src={`/media/${c.imageKey}`} alt={c.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${c.active ? "text-brand-ink" : "text-brand-ink-light"}`}>
                    {c.name}
                  </p>
                  <p className="text-[11px] text-brand-ink-light">
                    /{c.slug} · {c.productCount} producto(s)
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Form method="post" className="contents">
                    <input type="hidden" name="intent" value="move" />
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="dir" value="up" />
                    <button type="submit" disabled={idx === 0} aria-label="Subir" className="p-1.5 text-brand-ink-soft hover:text-brand-ink disabled:opacity-30">
                      <ArrowUp size={14} strokeWidth={1.5} />
                    </button>
                  </Form>
                  <Form method="post" className="contents">
                    <input type="hidden" name="intent" value="move" />
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="dir" value="down" />
                    <button type="submit" disabled={idx === categories.length - 1} aria-label="Bajar" className="p-1.5 text-brand-ink-soft hover:text-brand-ink disabled:opacity-30">
                      <ArrowDown size={14} strokeWidth={1.5} />
                    </button>
                  </Form>
                  <button
                    type="button"
                    onClick={() => setEditing(c)}
                    aria-label="Editar"
                    className="p-1.5 text-brand-ink-soft hover:text-brand-ink"
                  >
                    <Pencil size={14} strokeWidth={1.5} />
                  </button>
                  <Form method="post" className="contents" onSubmit={(e) => {
                    if (!confirm(`¿Eliminar la categoría "${c.name}"?`)) e.preventDefault();
                  }}>
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" aria-label="Eliminar" className="p-1.5 text-brand-ink-soft hover:text-error">
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </Form>
                </div>
              </div>
            ))}
            {categories.length === 0 ? (
              <p className="p-6 text-center text-sm text-brand-ink-soft">No hay categorías.</p>
            ) : null}
          </div>
        </div>

        {/* Formulario crear/editar */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-[1.5px] text-brand-ink-light">
              {editing ? "Editar" : "Crear nueva"}
            </h2>
            {editing ? (
              <button onClick={() => setEditing(null)} className="text-brand-ink-light hover:text-brand-ink">
                <X size={16} strokeWidth={1.5} />
              </button>
            ) : null}
          </div>
          <CategoryForm key={editing?.id ?? "new"} category={editing} />
        </div>
      </div>
    </AdminShell>
  );
}

function CategoryForm({ category }: { category: any | null }) {
  return (
    <Form method="post" className="mt-3 space-y-4 border border-border bg-surface p-4">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <Field label="Nombre" name="name" required>
        <TextInput name="name" defaultValue={category?.name ?? ""} required placeholder="Morrales" />
      </Field>
      <Field label="Slug (URL)" name="slug" hint="Se genera automáticamente si lo dejas vacío">
        <TextInput name="slug" defaultValue={category?.slug ?? ""} placeholder="morrales" />
      </Field>
      <Field label="Imagen de la categoría" name="imageKey">
        <SingleImageUploader
          name="imageKey"
          initialKey={category?.imageKey}
          prefix="categorias"
          hint="Se muestra en el home y en la página de categoría"
        />
      </Field>
      <label className="flex cursor-pointer items-center justify-between">
        <span className="text-sm text-brand-ink">Activa</span>
        <input type="checkbox" name="active" value="true" defaultChecked={category?.active ?? true} className="peer sr-only" />
        <span className="relative h-6 w-11 rounded-full border border-border bg-surface-off transition-colors peer-checked:bg-brand-ink after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-surface after:transition-transform peer-checked:after:translate-x-5" />
        <input type="hidden" name="active" value="false" />
      </label>
      <div className="flex justify-end">
        <Button type="submit" icon={Plus}>
          {category ? "Guardar cambios" : "Crear categoría"}
        </Button>
      </div>
    </Form>
  );
}
