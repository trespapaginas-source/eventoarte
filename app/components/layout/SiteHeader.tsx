import { useState } from "react";
import { Search, Menu, X, MessageCircle } from "lucide-react";
import { Logo } from "./Logo";
import { BrandLink, BrandForm } from "~/lib/brand-links";
import { buildWhatsAppSimpleLink } from "~/lib/whatsapp";
import { brandPath, type BrandConfig } from "~/lib/brand";

/**
 * Header público de recuerdos.store — estilo editorial minimalista.
 * Blanco y negro predominante, sin emojis.
 *
 * Recibe la marca activa para resolver el WhatsApp correcto, y el
 * banner superior editable (texto + link + activo).
 * La navegación interna usa BrandLink/BrandForm para mantenerse dentro
 * del directorio de marca activo.
 */

const NAV_CATEGORIES = [
  { label: "Morrales", to: "/categoria/morrales" },
  { label: "Loncheras", to: "/categoria/loncheras" },
  { label: "Cartucheras", to: "/categoria/cartucheras" },
  { label: "Tulas", to: "/categoria/tulas" },
  { label: "Cangureras", to: "/categoria/cangureras" },
  { label: "Recordatorios", to: "/categoria/recordatorios" },
  { label: "Piñatería", to: "/categoria/pinateria" },
];

export interface TopBanner {
  text: string;
  active: boolean;
  link?: string | null;
}

export function SiteHeader({
  brand,
  banner,
}: {
  brand?: BrandConfig;
  banner?: TopBanner;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const showBanner = banner?.active && banner?.text;
  const waLink = brand ? buildWhatsAppSimpleLink(brand) : null;
  const homePath = brand ? brandPath("/", brand) : "/";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface">
      {/* Barra superior fina editable (banner.top) */}
      {showBanner ? (
        banner!.link ? (
          <a
            href={banner!.link}
            className="block bg-brand-ink py-2 text-center transition-opacity hover:opacity-90"
          >
            <span className="text-[11px] font-bold uppercase tracking-[3px] text-white/90">
              {banner!.text}
            </span>
          </a>
        ) : (
          <div className="bg-brand-ink py-2 text-center">
            <span className="text-[11px] font-bold uppercase tracking-[3px] text-white/90">
              {banner!.text}
            </span>
          </div>
        )
      ) : null}

      {/* Header principal */}
      <div className="container-page">
        <div className="flex h-20 items-center gap-4">
          {/* Logo */}
          <Logo to={homePath} size={32} textClassName="text-2xl md:text-3xl" />

          {/* Navegación desktop */}
          <nav
            className="ml-8 hidden flex-1 items-center gap-5 lg:flex"
            aria-label="Navegación principal"
          >
            {/* Categorías de producto */}
            {NAV_CATEGORIES.map((item) => (
              <BrandLink
                key={item.to}
                to={item.to}
                className="text-[12px] font-medium uppercase tracking-[1.5px] text-brand-ink-soft transition-colors hover:text-brand-ink"
              >
                {item.label}
              </BrandLink>
            ))}

            {/* Contacto */}
            <BrandLink
              to="/contacto"
              className="ml-auto text-[12px] font-medium uppercase tracking-[1.5px] text-brand-ink-soft transition-colors hover:text-brand-ink"
            >
              Contacto
            </BrandLink>
          </nav>

          {/* Buscador (desktop) */}
          <BrandForm action="/buscar" className="ml-auto hidden md:block">
            <label className="relative block w-48 lg:w-56">
              <span className="sr-only">Buscar productos</span>
              <input
                type="search"
                name="q"
                placeholder="Buscar…"
                className="w-full rounded-full border border-border bg-surface-off py-2 pl-4 pr-10 text-sm transition-colors focus:border-brand-ink focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-ink-soft transition-colors hover:text-brand-ink"
              >
                <Search size={16} strokeWidth={1.5} />
              </button>
            </label>
          </BrandForm>

          {/* CTA WhatsApp (desktop) — sobrio, outline */}
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="hidden border border-brand-ink px-4 py-2 text-[11px] font-medium uppercase tracking-[1.5px] text-brand-ink transition-all hover:bg-brand-ink hover:text-white md:inline-flex md:items-center md:gap-1.5"
            >
              <MessageCircle size={14} strokeWidth={1.5} />
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
            {mobileOpen ? (
              <X size={24} strokeWidth={1.5} />
            ) : (
              <Menu size={24} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {mobileOpen ? (
        <div className="border-t border-border bg-surface lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-4" aria-label="Navegación (móvil)">
            {/* Categorías */}
            {NAV_CATEGORIES.map((item) => (
              <BrandLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-brand-ink-soft transition-colors hover:bg-surface-off hover:text-brand-ink"
              >
                {item.label}
              </BrandLink>
            ))}

            <div className="my-1 h-px bg-border" />
            <BrandLink
              to="/contacto"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-brand-ink-soft transition-colors hover:bg-surface-off hover:text-brand-ink"
            >
              Contacto
            </BrandLink>

            {/* Buscador móvil */}
            <BrandForm action="/buscar" className="mt-2">
              <label className="relative block">
                <span className="sr-only">Buscar productos</span>
                <input
                  type="search"
                  name="q"
                  placeholder="Buscar por nombre o código…"
                  className="w-full rounded-full border border-border bg-surface-off py-2.5 pl-4 pr-10 text-sm focus:border-brand-ink focus:outline-none"
                />
              </label>
            </BrandForm>

            {waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 border border-brand-ink px-5 py-2.5 text-xs font-medium uppercase tracking-[1.5px] text-brand-ink transition-all hover:bg-brand-ink hover:text-white"
              >
                <MessageCircle size={14} strokeWidth={1.5} />
                Cotizar por WhatsApp
              </a>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
