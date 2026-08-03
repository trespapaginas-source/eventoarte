import type { Route } from "./+types/productos.$id";
import { Form, redirect, Link, useSearchParams } from "react-router";
import { ArrowLeft, Copy, Trash2 } from "lucide-react";
import { AdminShell } from "~/components/admin/AdminShell";
import { ProductForm } from "~/components/admin/ProductForm";
import { Button } from "~/components/ui/Toggle";
import { cloudflareContext } from "~/lib/cloudflare-context";
import { requireAdmin } from "~/lib/auth";
import { getDb } from "~/lib/db/client";
import { categories, products } from "~/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { getProductById } from "~/lib/db/queries";
import {
  updateProduct,
  deleteProduct,
  duplicateProduct,
  addProductImage,
  deleteProductImage,
} from "~/lib/db/mutations";
import { productSchema } from "~/lib/validation";

export function meta() {
  return [
    { title: "Editar producto — Admin eventoarte.co" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  await requireAdmin({ context, request });
  const { env } = context.get(cloudflareContext);
  if (!env.DB) throw new Response("DB no disponible", { status: 503 });
  const db = getDb(env.DB);

  const id = Number(params.id);
  const [product, cats] = await Promise.all([
    getProductById(db, id),
    db.query.categories.findMany({
      orderBy: [asc(categories.sortOrder), asc(categories.name)],
    }),
  ]);

  if (!product) throw new Response("Producto no encontrado", { status: 404 });

  return {
    product,
    categories: cats,
    images: (product.images ?? []).map((img: any) => ({
      id: img.id,
      r2Key: img.r2Key,
      url: `/media/${img.r2Key}`,
      altText: img.altText,
    })),
  };
}

export async function action({ context, request, params }: Route.ActionArgs) {
  await requireAdmin({ context, request });
  const { env } = context.get(cloudflareContext);
  if (!env.DB) return { error: "DB no disponible" };
  const db = getDb(env.DB);
  const id = Number(params.id);

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "save");

  if (intent === "delete") {
    await deleteProduct(db, id);
    throw redirect("/admin/productos");
  }
  if (intent === "duplicate") {
    const dup = await duplicateProduct(db, id);
    if (dup) throw redirect(`/admin/productos/${dup.id}`);
    throw new Response("Error al duplicar", { status: 500 });
  }

  // --- Guardar ---
  const raw = Object.fromEntries(form.entries());
  const images = form.getAll("images").map(String).filter(Boolean);
  raw.active = (form.getAll("active").pop() ?? "false") as any;
  raw.featured = (form.getAll("featured").pop() ?? "false") as any;
  raw.colors = (raw.colors as string) || "[]";

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  await updateProduct(db, id, {
    ...parsed.data,
    categoryId: parsed.data.categoryId ?? null,
  } as any);

  // Sincronizar imágenes: las que existen en DB pero no en el form → eliminar
  const current = await getProductById(db, id);
  const currentImageIds = (current?.images ?? []).map((i: any) => i.id);
  const keptKeys = new Set(images);
  const existingKept = (current?.images ?? []).filter((i: any) =>
    keptKeys.has(i.r2Key),
  );
  const existingKeptIds = new Set(existingKept.map((i: any) => i.id));
  const toDelete = currentImageIds.filter((iid: number) => !existingKeptIds.has(iid));
  for (const did of toDelete) await deleteProductImage(db, did);

  // Las nuevas (r2Key que no existían) → insertar
  const existingKeys = new Set((current?.images ?? []).map((i: any) => i.r2Key));
  const newKeys = images.filter((k) => !existingKeys.has(k));
  for (const k of newKeys) await addProductImage(db, id, k);

  return { ok: true };
}

export default function AdminProductoEditar({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { product, categories, images } = loaderData as {
    product: any;
    categories: any[];
    images: any[];
  };
  const [searchParams] = useSearchParams();
  const justCreated = searchParams.get("created") === "1";
  const saved = (actionData as { ok?: boolean } | null)?.ok;
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
        <h1 className="mt-2 text-2xl font-bold text-brand-ink">{product.name}</h1>
        <p className="mt-1 text-[11px] text-brand-ink-light">Editando · {product.code}</p>
      </header>

      {justCreated || saved ? (
        <p className="mb-4 border border-success bg-success/5 px-3 py-2 text-xs text-success">
          {justCreated ? "Producto creado correctamente." : "Cambios guardados."}
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 border border-error bg-error/5 px-3 py-2 text-xs text-error">
          {error}
        </p>
      ) : null}

      <Form method="post" className="space-y-6 pb-20 md:pb-6">
        <input type="hidden" name="intent" value="save" />
        <ProductForm product={product} images={images} categories={categories} />
        <div className="flex flex-wrap justify-between gap-3">
          <Form method="post" className="contents" onSubmit={(e) => {
            if (!confirm("¿Eliminar este producto? No se puede deshacer.")) e.preventDefault();
          }}>
            <input type="hidden" name="intent" value="delete" />
            <Button variant="danger" icon={Trash2} type="submit">
              Eliminar
            </Button>
          </Form>
          <div className="flex gap-3">
            <Form method="post" className="contents">
              <input type="hidden" name="intent" value="duplicate" />
              <Button variant="outline" icon={Copy} type="submit">
                Duplicar
              </Button>
            </Form>
            <Button type="submit">Guardar cambios</Button>
          </div>
        </div>
      </Form>
    </AdminShell>
  );
}
