import { Link, Form } from "react-router";
import { useState } from "react";

/**
 * Header público de eventoarte.co — estilo premium inspirado en Vélez.
 * Sección 7.1 del Documento Técnico.
 *
 * Estructura: barra superior fina + header principal con logo, navegación por
 * categorías de producto, buscador y CTA de WhatsApp.
 */

// Público (primer nivel de navegación) + categorías de producto
const NAV_AUDIENCE = [
  { label: "Niños", to: "/ninos" },
  { label: "Niñas", to: "/ninas" },
];

const NAV_CATEGORIES = [
  { label: "Morrales", to: "/categoria/morrales" },
  { label: "Loncheras", to: "/categoria/loncheras" },
  { label: "Cartucheras", to: "/categoria/cartucheras" },
  { label: "Tulas", to: "/categoria/tulas" },
  { label: "Cangureras", to: "/categoria/cangureras" },
  { label: "Recordatorios", to: "/categoria/recordatorios" },
  { label: "Piñatería", to: "/categoria/pinateria" },
];

export function SiteHeader({ waNumber }: { waNumber?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface">
      {/* Barra superior fina (estilo Vélez: tracked caps) */}
      <div className="bg-brand-ink py-2 text-center">
        <span className="text-[11px] font-bold uppercase tracking-[3px] text-white/90">
          Fabricación nacional · Personalización para cada celebración
        </span>
      </div>

      {/* Header principal */}
      <div className="container-page">
        <div className="flex h-20 items-center gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tight text-brand-ink transition-colors hover:text-brand-coral md:text-3xl"
          >
            eventoarte<span className="text-brand-coral">.co</span>
          </Link>

          {/* Navegación desktop */}
          <nav
            className="ml-8 hidden flex-1 items-center gap-5 lg:flex"
            aria-label="Navegación principal"
          >
            {/* Niños / Niñas — primer nivel, destacados */}
            {NAV_AUDIENCE.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-[13px] font-bold uppercase tracking-[2px] text-brand-ink transition-colors hover:text-brand-coral"
              >
                {item.label}
              </Link>
            ))}

            {/* Separador */}
            <span className="h-4 w-px bg-border" aria-hidden="true" />

            {/* Categorías de producto */}
            {NAV_CATEGORIES.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-[12px] font-medium uppercase tracking-[1.5px] text-brand-ink-soft transition-colors hover:text-brand-coral"
              >
                {item.label}
              </Link>
            ))}

            {/* Contacto */}
            <Link
              to="/contacto"
              className="ml-auto text-[12px] font-medium uppercase tracking-[1.5px] text-brand-ink-soft transition-colors hover:text-brand-coral"
            >
              Contacto
            </Link>
          </nav>

          {/* Buscador (desktop) */}
          <Form action="/buscar" className="ml-auto hidden md:block">
            <label className="relative block w-48 lg:w-56">
              <span className="sr-only">Buscar productos</span>
              <input
                type="search"
                name="q"
                placeholder="Buscar…"
                className="w-full rounded-full border border-border bg-brand-cream py-2 pl-4 pr-10 text-sm transition-colors focus:border-brand-coral focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-ink-soft transition-colors hover:text-brand-coral"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            </label>
          </Form>

          {/* CTA WhatsApp (desktop) — sobrio, outline */}
          {waNumber ? (
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noreferrer"
              className="hidden border border-brand-ink px-4 py-2 text-[11px] font-medium uppercase tracking-[1.5px] text-brand-ink transition-all hover:bg-brand-ink hover:text-white md:inline-flex md:items-center md:gap-1.5"
            >
              <span>💬</span>
              <span>Cotizar</span>
            </a>
          ) : null}

          {/* Botón menú móvil */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="ml-auto rounded-md p-2 text-brand-ink lg:hidden"
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {mobileOpen ? (
        <div className="border-t border-border bg-surface lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-4" aria-label="Navegación (móvil)">
            {/* Niños / Niñas primero */}
            <div className="mb-1 flex gap-2 px-3">
              {NAV_AUDIENCE.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-md bg-brand-cream px-4 py-3 text-center text-sm font-bold uppercase tracking-[1.5px] text-brand-ink"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="my-1 h-px bg-border" />

            {/* Categorías */}
            {NAV_CATEGORIES.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-brand-ink-soft transition-colors hover:bg-surface-off hover:text-brand-coral"
              >
                {item.label}
              </Link>
            ))}

            <div className="my-1 h-px bg-border" />
            <Link
              to="/contacto"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-brand-ink-soft transition-colors hover:bg-surface-off hover:text-brand-coral"
            >
              Contacto
            </Link>

            {/* Buscador móvil */}
            <Form action="/buscar" className="mt-2">
              <label className="relative block">
                <span className="sr-only">Buscar productos</span>
                <input
                  type="search"
                  name="q"
                  placeholder="Buscar por nombre o código…"
                  className="w-full rounded-full border border-border bg-brand-cream py-2.5 pl-4 pr-10 text-sm focus:border-brand-coral focus:outline-none"
                />
              </label>
            </Form>

            {waNumber ? (
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-pill bg-whatsapp px-5 py-2.5 text-sm font-semibold text-white"
              >
                💬 Cotizar por WhatsApp
              </a>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
