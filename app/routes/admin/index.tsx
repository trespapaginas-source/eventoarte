import type { Route } from "./+types/index";
import { Link } from "react-router";
import { Package, Inbox, FolderTree, Plus, ArrowRight } from "lucide-react";
import { AdminShell } from "~/components/admin/AdminShell";
import { Button } from "~/components/ui/Toggle";
import { cloudflareContext } from "~/lib/cloudflare-context";
import { requireAdmin } from "~/lib/auth";
import { getDb } from "~/lib/db/client";
import { countQuotesByStatus } from "~/lib/db/mutations";
import { listProducts } from "~/lib/db/queries";
import { eq } from "drizzle-orm";
import { products } from "~/lib/db/schema";

export function meta() {
  return [
    { title: "Dashboard — recuerdos.store" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  await requireAdmin({ context, request });
  const { env } = context.get(cloudflareContext);
  if (!env.DB) return { stats: null };

  const db = getDb(env.DB);
  const [allProducts, quotes] = await Promise.all([
    listProducts(db, {}),
    countQuotesByStatus(db),
  ]);
  const active = allProducts.filter((p: any) => p.active).length;
  const featured = allProducts.filter((p: any) => p.featured).length;

  return {
    stats: {
      total: allProducts.length,
      active,
      featured,
      quotes,
    },
  };
}

export default function AdminIndex({ loaderData }: Route.ComponentProps) {
  const stats = loaderData.stats as {
    total: number;
    active: number;
    featured: number;
    quotes: { nueva: number; atendida: number; cerrada: number; total: number };
  } | null;

  return (
    <AdminShell>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-brand-ink">Panel</h1>
        <p className="mt-1 text-sm text-brand-ink-soft">
          Resumen de tu catálogo y solicitudes
        </p>
      </header>

      {/* Tarjetas resumen */}
      {stats ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Productos" value={stats.total} sub={`${stats.active} activos`} to="/admin/productos" icon={Package} />
          <StatCard label="Destacados" value={stats.featured} sub="en home" to="/admin/productos" icon={Package} />
          <StatCard label="Cotizaciones nuevas" value={stats.quotes.nueva} sub={`${stats.quotes.total} en total`} to="/admin/cotizaciones" icon={Inbox} highlight={stats.quotes.nueva > 0} />
          <StatCard label="Categorías" value="-" sub="gestionar" to="/admin/categorias" icon={FolderTree} />
        </div>
      ) : (
        <div className="border border-border bg-surface p-6 text-sm text-brand-ink-soft">
          La base de datos no está disponible. Configura el binding D1.
        </div>
      )}

      {/* Accesos rápidos */}
      <section className="mt-8">
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[1.5px] text-brand-ink-light">
          Accesos rápidos
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to="/admin/productos/nuevo"
            className="flex items-center justify-between border border-border bg-surface p-4 transition-colors hover:border-brand-ink"
          >
            <span className="flex items-center gap-3">
              <Plus size={18} strokeWidth={1.5} className="text-brand-ink" />
              <span className="text-sm font-medium text-brand-ink">Crear producto</span>
            </span>
            <ArrowRight size={16} strokeWidth={1.5} className="text-brand-ink-light" />
          </Link>
          <Link
            to="/admin/cotizaciones"
            className="flex items-center justify-between border border-border bg-surface p-4 transition-colors hover:border-brand-ink"
          >
            <span className="flex items-center gap-3">
              <Inbox size={18} strokeWidth={1.5} className="text-brand-ink" />
              <span className="text-sm font-medium text-brand-ink">Ver cotizaciones</span>
            </span>
            <ArrowRight size={16} strokeWidth={1.5} className="text-brand-ink-light" />
          </Link>
        </div>
      </section>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  sub,
  to,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: number | string;
  sub: string;
  to: string;
  icon: any;
  highlight?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`block border bg-surface p-4 transition-colors hover:border-brand-ink ${
        highlight ? "border-brand-ink" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between">
        <Icon size={16} strokeWidth={1.5} className="text-brand-ink-light" />
        {highlight ? (
          <span className="h-2 w-2 rounded-full bg-gradient-brand" />
        ) : null}
      </div>
      <p className="mt-3 text-2xl font-bold text-brand-ink">{value}</p>
      <p className="text-[11px] font-medium uppercase tracking-[1px] text-brand-ink-light">
        {label}
      </p>
      <p className="mt-0.5 text-[11px] text-brand-ink-light">{sub}</p>
    </Link>
  );
}
