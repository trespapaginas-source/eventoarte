import { MessageCircle, Camera, Share2 } from "lucide-react";
import { Logo } from "./Logo";
import { BrandLink } from "~/lib/brand-links";
import { buildWhatsAppSimpleLink } from "~/lib/whatsapp";
import type { BrandConfig } from "~/lib/brand";

/**
 * Footer público de recuerdos.store — estilo editorial minimalista.
 * Recibe la marca activa para resolver WhatsApp/Instagram correctos.
 * La navegación interna usa BrandLink para mantener el directorio de marca.
 */

export function SiteFooter({ brand }: { brand?: BrandConfig }) {
  const year = new Date().getFullYear();
  const waLink = brand ? buildWhatsAppSimpleLink(brand) : null;
  const instagram = brand?.instagram ?? "https://instagram.com/recuerdos.store";

  return (
    <footer className="mt-20 border-t border-border bg-surface-off">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        {/* Marca */}
        <div className="md:col-span-1">
          <Logo textClassName="text-2xl" />
          <p className="mt-3 text-sm leading-relaxed text-brand-ink-soft">
            Recordatorios y productos personalizados para celebrar tus momentos.
            <br />
            <span className="font-medium text-brand-ink">Hecho en Colombia.</span>
          </p>
        </div>

        {/* Categorías */}
        <nav aria-label="Categorías de producto">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-ink">
            Categorías
          </h2>
          <ul className="space-y-2.5 text-sm text-brand-ink-soft">
            <li><BrandLink className="transition-colors hover:text-brand-ink" to="/categoria/morrales">Morrales</BrandLink></li>
            <li><BrandLink className="transition-colors hover:text-brand-ink" to="/categoria/loncheras">Loncheras</BrandLink></li>
            <li><BrandLink className="transition-colors hover:text-brand-ink" to="/categoria/cartucheras">Cartucheras</BrandLink></li>
            <li><BrandLink className="transition-colors hover:text-brand-ink" to="/categoria/tulas">Tulas</BrandLink></li>
            <li><BrandLink className="transition-colors hover:text-brand-ink" to="/categoria/recordatorios">Recordatorios</BrandLink></li>
          </ul>
        </nav>

        {/* Empresa */}
        <nav aria-label="Empresa">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-ink">
            Empresa
          </h2>
          <ul className="space-y-2.5 text-sm text-brand-ink-soft">
            <li><BrandLink className="transition-colors hover:text-brand-ink" to="/catalogo">Ver catálogo</BrandLink></li>
            <li><BrandLink className="transition-colors hover:text-brand-ink" to="/sobre-nosotros">Sobre nosotros</BrandLink></li>
            <li><BrandLink className="transition-colors hover:text-brand-ink" to="/faq">Preguntas frecuentes</BrandLink></li>
            <li><BrandLink className="transition-colors hover:text-brand-ink" to="/contacto">Contacto</BrandLink></li>
          </ul>
        </nav>

        {/* Contacto */}
        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-ink">
            Contacto
          </h2>
          {/* Avatar de la marca (si tiene foto de perfil configurada) */}
          {brand?.photo ? (
            <img
              src={`/media/${brand.photo}`}
              alt={brand.name}
              className="mb-4 h-16 w-16 rounded-full border border-border object-cover"
            />
          ) : null}
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="mb-4 inline-flex items-center gap-2 border border-brand-ink px-5 py-2.5 text-xs font-medium uppercase tracking-[1.5px] text-brand-ink transition-all hover:bg-brand-ink hover:text-white"
            >
              <MessageCircle size={14} strokeWidth={1.5} />
              Escríbenos por WhatsApp
            </a>
          ) : null}
          <ul className="space-y-2.5 text-sm text-brand-ink-soft">
            <li>
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-ink"
              >
                <Camera size={14} strokeWidth={1.5} />
                {brand ? `@${brand.name}` : "@recuerdos.store"}
              </a>
            </li>
            {brand?.facebook ? (
              <li>
                <a
                  href={brand.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-ink"
                >
                  <Share2 size={14} strokeWidth={1.5} />
                  Facebook
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-border py-5">
        <p className="container-page text-center text-xs text-brand-ink-soft">
          © {year} recuerdos.store · Todos los derechos reservados · Hecho en Colombia
        </p>
      </div>
    </footer>
  );
}
