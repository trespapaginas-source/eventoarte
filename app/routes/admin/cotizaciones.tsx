import type { Route } from "./+types/cotizaciones";
import { Link, Form, useSearchParams } from "react-router";
import { MessageCircle, Trash2 } from "lucide-react";
import { AdminShell } from "~/components/admin/AdminShell";
import { Button } from "~/components/ui/Toggle";
import { cloudflareContext } from "~/lib/cloudflare-context";
import { requireAdmin } from "~/lib/auth";
import { getDb } from "~/lib/db/client";
import {
  listQuotes,
  updateQuoteStatus,
  deleteQuote,
} from "~/lib/db/mutations";

export function meta() {
  return [
    { title: "Cotizaciones — Admin eventoarte.co" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

const STATUS_TABS = [
  { value: "nueva", label: "Nuevas" },
  { value: "atendida", label: "Atendidas" },
  { value: "cerrada", label: "Cerradas" },
  { value: "", label: "Todas" },
] as const;

export async function loader({ context, request }: Route.LoaderArgs) {
  await requireAdmin({ context, request });
  const { env } = context.get(cloudflareContext);
  if (!env.DB) return { quotes: [], activeStatus: "" };

  const db = getDb(env.DB);
  const url = new URL(request.url);
  const status = url.searchParams.get("estado") ?? "";
  const valid = status === "nueva" || status === "atendida" || status === "cerrada";
  const quotes = await listQuotes(db, valid ? { status: status as any } : {});
  return { quotes, activeStatus: status };
}

export async function action({ context, request }: Route.ActionArgs) {
  await requireAdmin({ context, request });
  const { env } = context.get(cloudflareContext);
  if (!env.DB) return { ok: true };
  const db = getDb(env.DB);

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const id = Number(form.get("id"));

  if (intent === "status") {
    const status = String(form.get("status"));
    if (status === "nueva" || status === "atendida" || status === "cerrada") {
      await updateQuoteStatus(db, id, status);
    }
  } else if (intent === "delete") {
    await deleteQuote(db, id);
  }
  return { ok: true };
}

export default function AdminCotizaciones({ loaderData }: Route.ComponentProps) {
  const { quotes, activeStatus } = loaderData as {
    quotes: any[];
    activeStatus: string;
  };
  const [searchParams, setSearchParams] = useSearchParams();

  function setStatus(value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("estado", value);
    else next.delete("estado");
    setSearchParams(next);
  }

  return (
    <AdminShell>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-brand-ink">Cotizaciones</h1>
        <p className="mt-1 text-sm text-brand-ink-soft">
          {quotes.length} {quotes.length === 1 ? "solicitud" : "solicitudes"}
        </p>
      </header>

      {/* Tabs por estado */}
      <div className="mb-6 flex gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            className={`border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[1px] transition-colors ${
              activeStatus === tab.value
                ? "border-brand-ink bg-brand-ink text-white"
                : "border-border bg-surface text-brand-ink-soft hover:border-brand-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {quotes.length === 0 ? (
        <div className="border border-border bg-surface p-10 text-center">
          <p className="text-sm text-brand-ink-soft">No hay solicitudes en este estado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <QuoteCard key={q.id} quote={q} />
          ))}
        </div>
      )}
    </AdminShell>
  );
}

function QuoteCard({ quote: q }: { quote: any }) {
  const statusColor =
    q.status === "nueva"
      ? "border-brand-ink"
      : q.status === "atendida"
        ? "border-success"
        : "border-border";

  return (
    <div className={`border ${statusColor} bg-surface p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-brand-ink">{q.name}</p>
          {q.product ? (
            <p className="text-[11px] text-brand-ink-light">
              Producto: {q.product.name} ({q.product.code})
            </p>
          ) : null}
          {q.occasion ? (
            <p className="text-[11px] text-brand-ink-light">Ocasión: {q.occasion}</p>
          ) : null}
          {q.message ? (
            <p className="mt-2 text-sm text-brand-ink-soft">{q.message}</p>
          ) : null}
        </div>
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-[1px] text-brand-ink-light">
          {q.status}
        </span>
      </div>

      {/* Datos de contacto */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-ink-soft">
        <a
          href={`https://wa.me/${q.phone.replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-medium text-brand-ink hover:opacity-70"
        >
          <MessageCircle size={12} strokeWidth={1.5} />
          {q.phone}
        </a>
        {q.email ? <span>{q.email}</span> : null}
        {q.quantity ? <span>Cant: {q.quantity}</span> : null}
        {q.eventDate ? <span>Fecha: {q.eventDate}</span> : null}
      </div>

      {/* Acciones */}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <Form method="post" className="flex items-center gap-2">
          <input type="hidden" name="id" value={q.id} />
          <input type="hidden" name="intent" value="status" />
          <select
            name="status"
            defaultValue={q.status}
            className="border border-border bg-surface px-2 py-1 text-xs focus:border-brand-ink focus:outline-none"
            onChange={(e) => e.currentTarget.form?.submit()}
          >
            <option value="nueva">Nueva</option>
            <option value="atendida">Atendida</option>
            <option value="cerrada">Cerrada</option>
          </select>
        </Form>
        <Form method="post" className="contents" onSubmit={(e) => {
          if (!confirm("¿Eliminar esta solicitud?")) e.preventDefault();
        }}>
          <input type="hidden" name="id" value={q.id} />
          <input type="hidden" name="intent" value="delete" />
          <button type="submit" aria-label="Eliminar" className="p-1.5 text-brand-ink-light hover:text-error">
            <Trash2 size={14} strokeWidth={1.5} />
          </button>
        </Form>
      </div>
    </div>
  );
}
