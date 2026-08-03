import { Link } from "react-router";
import { MessageCircle, Camera } from "lucide-react";

/**
 * Footer público de eventoarte.co — estilo editorial minimalista.
 * Editable desde el CMS en fases posteriores.
 */
export function SiteFooter({ waNumber }: { waNumber?: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-border bg-surface-off">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        {/* Marca */}
        <div className="md:col-span-1">
          <p className="font-display text-2xl font-extrabold text-brand-ink">
            eventoarte<span className="text-brand-ink-light">.co</span>
          </p>
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
            <li><Link className="transition-colors hover:text-brand-ink" to="/categoria/morrales">Morrales</Link></li>
            <li><Link className="transition-colors hover:text-brand-ink" to="/categoria/loncheras">Loncheras</Link></li>
            <li><Link className="transition-colors hover:text-brand-ink" to="/categoria/cartucheras">Cartucheras</Link></li>
            <li><Link className="transition-colors hover:text-brand-ink" to="/categoria/tulas">Tulas</Link></li>
            <li><Link className="transition-colors hover:text-brand-ink" to="/categoria/recordatorios">Recordatorios</Link></li>
          </ul>
        </nav>

        {/* Empresa */}
        <nav aria-label="Empresa">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-ink">
            Empresa
          </h2>
          <ul className="space-y-2.5 text-sm text-brand-ink-soft">
            <li><Link className="transition-colors hover:text-brand-ink" to="/catalogo">Ver catálogo</Link></li>
            <li><Link className="transition-colors hover:text-brand-ink" to="/sobre-nosotros">Sobre nosotros</Link></li>
            <li><Link className="transition-colors hover:text-brand-ink" to="/faq">Preguntas frecuentes</Link></li>
            <li><Link className="transition-colors hover:text-brand-ink" to="/contacto">Contacto</Link></li>
          </ul>
        </nav>

        {/* Contacto */}
        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-ink">
            Contacto
          </h2>
          {waNumber ? (
            <a
              href={`https://wa.me/${waNumber}`}
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
                href="https://instagram.com/eventoarte.co"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-ink"
              >
                <Camera size={14} strokeWidth={1.5} />
                @eventoarte.co
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-border py-5">
        <p className="container-page text-center text-xs text-brand-ink-soft">
          © {year} eventoarte.co · Todos los derechos reservados · Hecho en Colombia
        </p>
      </div>
    </footer>
  );
}
