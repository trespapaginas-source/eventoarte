import type { Route } from "./+types/productos";
import { Link, Form, useSearchParams } from "react-router";
import { Plus, Search, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { AdminShell } from "~/components/admin/AdminShell";
import { Button } from "~/components/ui/Toggle";
import { cloudflareContext } from "~/lib/cloudflare-context";
import { requireAdmin } from "~/lib/auth";
import { getDb } from "~/lib/db/client";
import { products, categories } from "~/lib/db/schema";
import { eq, or, like, asc, and, desc } from "drizzle-orm";
import { toggleProductActive, deleteProduct } from "~/lib/db/mutations";
import { formatCOP } from "~/lib/format";

export function meta() {
  return [
    { title: "Productos — Admin recuerdos.store" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  await requireAdmin({ context, request });
  const { env } = context.get(cloudflareContext);
  if (!env.DB) return { products: [], categories: [] };

  const db = getDb(env.DB);
  const url = new URL(request.url);
  const search = url.searchParams.get("q") ?? "";
  const catFilter = url.searchParams.get("categoria") ?? "";

  const conditions = [];
  if (search) {
    conditions.push(or(like(products.name, `%${search}%`), like(products.code, `%${search}%`))!);
  }
  if (catFilter) conditions.push(eq(products.categoryId, Number(catFilter)));

  const list = await db.query.products.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy: [desc(products.createdAt)],
    with: { images: true },
  });
  const cats = await db.query.categories.findMany({
    orderBy: [asc(categories.sortOrder), asc(categories.name)],
  });

  return { products: list, categories: cats };
}

export async function action({ context, request }: Route.ActionArgs) {
  await requireAdmin({ context, request });
  const { env } = context.get(cloudflareContext);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const id = Number(form.get("id"));

  if (!env.DB) return { error: "DB no disponible" };
  const db = getDb(env.DB);

  if (intent === "toggle") {
    const p = await db.query.products.findFirst({ where: eq(products.id, id) });
    if (p) await toggleProductActive(db, id, !p.active);
  } else if (intent === "delete") {
    await deleteProduct(db, id);
  }
  return { ok: true };
}

export default function AdminProductos({ loaderData }: Route.ComponentProps) {
  const { products: list, categories: cats } = loaderData as {
    products: any[];
    categories: any[];
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const catFilter = searchParams.get("categoria") ?? "";

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  return (
    <AdminShell>
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">Productos</h1>
          <p className="mt-1 text-sm text-brand-ink-soft">
            {list.length} {list.length === 1 ? "producto" : "productos"}
          </p>
        </div>
        <Link to="/admin/productos/nuevo">
          <Button icon={Plus}>Nuevo</Button>
        </Link>
      </header>

      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            strokeWidth={1.5}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink-light"
          />
          <input
            type="search"
            placeholder="Buscar por nombre o código…"
            defaultValue={q}
            onChange={(e) => updateFilter("q", e.target.value)}
            className="w-full border border-border bg-surface py-2.5 pl-10 pr-3 text-sm focus:border-brand-ink focus:outline-none"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => updateFilter("categoria", e.target.value)}
          className="border border-border bg-surface px-3 py-2.5 text-sm focus:border-brand-ink focus:outline-none"
        >
          <option value="">Todas las categorías</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Lista — tarjetas (responsive) */}
      {list.length === 0 ? (
        <div className="border border-border bg-surface p-10 text-center">
          <p className="text-sm text-brand-ink-soft">No hay productos.</p>
          <Link to="/admin/productos/nuevo" className="mt-3 inline-block">
            <Button icon={Plus}>Crear el primero</Button>
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border border border-border bg-surface">
          {list.map((p) => (
            <ProductRow key={p.id} product={p} />
          ))}
        </div>
      )}
    </AdminShell>
  );
}

function ProductRow({ product: p }: { product: any }) {
  const img = p.images?.[0]?.r2Key
    ? `/media/${p.images[0].r2Key}`
    : null;

  return (
    <div className="flex items-center gap-3 p-3">
      {/* Miniatura */}
      <div className="h-14 w-14 shrink-0 overflow-hidden border border-border bg-surface-off">
        {img ? (
          <img src={img} alt={p.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brand-ink-light text-[10px]">
            sin foto
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${p.active ? "text-brand-ink" : "text-brand-ink-light"}`}>
          {p.name}
        </p>
        <p className="text-[11px] text-brand-ink-light">
          {p.code} · {formatCOP(p.price)}
          {p.featured ? " · ★ Destacado" : ""}
        </p>
      </div>

      {/* Acciones */}
      <div className="flex shrink-0 items-center gap-1">
        <Form method="post" className="contents">
          <input type="hidden" name="id" value={p.id} />
          <input type="hidden" name="intent" value="toggle" />
          <button
            type="submit"
            aria-label={p.active ? "Ocultar" : "Mostrar"}
            title={p.active ? "Ocultar" : "Mostrar"}
            className="p-2 text-brand-ink-soft transition-colors hover:text-brand-ink"
          >
            {p.active ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
          </button>
        </Form>
        <Link
          to={`/admin/productos/${p.id}`}
          aria-label="Editar"
          title="Editar"
          className="p-2 text-brand-ink-soft transition-colors hover:text-brand-ink"
        >
          <Pencil size={16} strokeWidth={1.5} />
        </Link>
        <Form
          method="post"
          onSubmit={(e) => {
            if (!confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`)) {
              e.preventDefault();
            }
          }}
          className="contents"
        >
          <input type="hidden" name="id" value={p.id} />
          <input type="hidden" name="intent" value="delete" />
          <button
            type="submit"
            aria-label="Eliminar"
            title="Eliminar"
            className="p-2 text-brand-ink-soft transition-colors hover:text-error"
          >
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        </Form>
      </div>
    </div>
  );
}
