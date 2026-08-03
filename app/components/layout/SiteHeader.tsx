import { Link } from "react-router";

/**
 * Header público de eventoarte.co.
 * Sección 7.1 del Documento Técnico.
 * Sticky, con logo, navegación principal, buscador y CTA de WhatsApp.
 */
export function SiteHeader({ waNumber }: { waNumber?: string }) {
  const navItems = [
    { label: "Inicio", to: "/" },
    { label: "Catálogo", to: "/catalogo" },
    { label: "Baby shower", to: "/ocasion/baby-shower" },
    { label: "Cumpleaños", to: "/ocasion/cumpleanos" },
    { label: "Contacto", to: "/contacto" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4">
        <Link to="/" className="font-display text-2xl font-extrabold text-brand-coral">
          eventoarte<span className="text-brand-mustard">.co</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-6 md:flex" aria-label="Navegación principal">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-medium text-brand-ink-soft transition-colors hover:text-brand-coral"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form action="/buscar" className="ml-auto hidden flex-1 max-w-xs sm:block">
          <label className="relative block">
            <span className="sr-only">Buscar productos</span>
            <input
              type="search"
              name="q"
              placeholder="Buscar por nombre o código…"
              className="w-full rounded-full border border-border bg-brand-cream px-4 py-2 pr-10 text-sm focus:border-brand-coral focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-ink-soft"
            >
              🔍
            </button>
          </label>
        </form>

        {waNumber ? (
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-pill hidden bg-whatsapp px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-whatsapp-dark sm:inline-block"
          >
            💬 Cotizar
          </a>
        ) : null}
      </div>
    </header>
  );
}
