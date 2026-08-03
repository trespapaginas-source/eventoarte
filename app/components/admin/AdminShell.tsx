import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Package,
  Inbox,
  FolderTree,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "~/components/layout/Logo";

/**
 * Layout del CMS — app-like:
 *  - Mobile: top bar + bottom navigation fija (5 ítems).
 *  - Desktop: sidebar lateral fija.
 *
 * Sin header/footer públicos. Paleta B&N coherente con el sitio.
 */

const NAV: { label: string; to: string; icon: LucideIcon }[] = [
  { label: "Inicio", to: "/admin", icon: LayoutDashboard },
  { label: "Productos", to: "/admin/productos", icon: Package },
  { label: "Cotizaciones", to: "/admin/cotizaciones", icon: Inbox },
  { label: "Categorías", to: "/admin/categorias", icon: FolderTree },
  { label: "Ajustes", to: "/admin/ajustes", icon: Settings },
];

function isActive(pathname: string, to: string): boolean {
  if (to === "/admin") return pathname === "/admin";
  return pathname.startsWith(to);
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-surface-off">
      {/* ===== Desktop sidebar ===== */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-surface md:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Logo to="/admin" textClassName="text-lg" />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => {
            const active = isActive(pathname, item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-ink text-white"
                    : "text-brand-ink-soft hover:bg-surface-off hover:text-brand-ink"
                }`}
              >
                <item.icon size={18} strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <form method="post" action="/admin/logout">
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-brand-ink-soft transition-colors hover:bg-surface-off hover:text-brand-ink"
            >
              <LogOut size={18} strokeWidth={1.5} />
              Cerrar sesión
            </button>
          </form>
          <Link
            to="/"
            className="mt-1 block px-3 py-2.5 text-[11px] uppercase tracking-[1.5px] text-brand-ink-light transition-colors hover:text-brand-ink"
          >
            Ver sitio público →
          </Link>
        </div>
      </aside>

      {/* ===== Contenido principal ===== */}
      <div className="md:pl-60">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:hidden">
          <Link to="/admin" className="block">
            <Logo textClassName="text-base" />
          </Link>
          <form method="post" action="/admin/logout">
            <button type="submit" aria-label="Cerrar sesión" className="p-2 text-brand-ink-soft">
              <LogOut size={18} strokeWidth={1.5} />
            </button>
          </form>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
          {children}
        </main>
      </div>

      {/* ===== Mobile bottom navigation ===== */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-surface md:hidden">
        {NAV.map((item) => {
          const active = isActive(pathname, item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[9px] font-medium uppercase tracking-[0.5px] transition-colors ${
                active ? "text-brand-ink" : "text-brand-ink-light"
              }`}
            >
              <item.icon size={20} strokeWidth={active ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
