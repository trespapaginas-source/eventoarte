import type { Route } from "./+types/productos.nuevo";
import { Form, redirect } from "react-router";
import { Link } from "react-router";
import { ArrowLeft, Copy, Trash2 } from "lucide-react";
import { AdminShell } from "~/components/admin/AdminShell";
import { ProductForm } from "~/components/admin/ProductForm";
import { Button } from "~/components/ui/Toggle";
import { cloudflareContext } from "~/lib/cloudflare-context";
import { requireUser } from "~/lib/auth";
import { getDb } from "~/lib/db/client";
import { categories } from "~/lib/db/schema";
import { asc } from "drizzle-orm";
import { createProduct, addProductImage } from "~/lib/db/mutations";
import { productSchema } from "~/lib/validation";

export function meta() {
  return [
    { title: "Nuevo producto — Admin recuerdos.store" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  await requireUser({ context, request });
  const { env } = context.get(cloudflareContext);
  if (!env.DB) return { categories: [] };
  const db = getDb(env.DB);
  const cats = await db.query.categories.findMany({
    orderBy: [asc(categories.sortOrder), asc(categories.name)],
  });
  return { categories: cats };
}

export async function action({ context, request }: Route.ActionArgs) {
  await requireUser({ context, request });
  const { env } = context.get(cloudflareContext);
  if (!env.DB) return { error: "DB no disponible" };
  const db = getDb(env.DB);

  const form = await request.formData();
  const raw = Object.fromEntries(form.entries());

  // Las imágenes vienen como entradas múltiples
  const images = form.getAll("images").map(String).filter(Boolean);
  // active/featured vienen como "true"/"false" duplicados; nos quedamos con el último
  raw.active = (form.getAll("active").pop() ?? "false") as any;
  raw.featured = (form.getAll("featured").pop() ?? "false") as any;
  // colors: JSON string
  raw.colors = (raw.colors as string) || "[]";

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const created = await createProduct(db, {
    ...parsed.data,
    categoryId: parsed.data.categoryId ?? null,
  } as any);
  if (!created) throw new Response("Error al crear", { status: 500 });

  // Asociar imágenes subidas
  for (const r2Key of images) {
    await addProductImage(db, created.id, r2Key);
  }

  throw redirect(`/admin/productos/${created.id}?created=1`);
}

export default function AdminProductoNuevo({ loaderData, actionData }: Route.ComponentProps) {
  const { categories } = loaderData as { categories: any[] };
  const error = (actionData as { error?: string } | null)?.error;

  return (
    <AdminShell>
      <header className="mb-6">
        <Link
          to="/admin/productos"
          className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[1.5px] text-brand-ink-light hover:text-brand-ink"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Productos
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-brand-ink">Nuevo producto</h1>
      </header>

      {error ? (
        <p className="mb-4 border border-error bg-error/5 px-3 py-2 text-xs text-error">
          {error}
        </p>
      ) : null}

      <Form method="post" className="space-y-6 pb-20 md:pb-6">
        <ProductForm product={null} images={[]} categories={categories} />
        <div className="flex justify-end gap-3">
          <Link to="/admin/productos">
            <Button variant="ghost">Cancelar</Button>
          </Link>
          <Button type="submit">Guardar producto</Button>
        </div>
      </Form>
    </AdminShell>
  );
}
