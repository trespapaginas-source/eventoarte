import { Link } from "react-router";

/**
 * Footer público de eventoarte.co — estilo premium.
 * Sección 7.1 del Documento Técnico. Editable desde el CMS en fases posteriores.
 */
export function SiteFooter({ waNumber }: { waNumber?: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-border bg-brand-cream">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        {/* Marca */}
        <div className="md:col-span-1">
          <p className="font-display text-2xl font-extrabold text-brand-ink">
            eventoarte<span className="text-brand-coral">.co</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-brand-ink-soft">
            Recordatorios y productos personalizados para celebrar tus momentos.
            <br />
            <span className="font-medium text-brand-ink">Hecho en Colombia. 🇨🇴</span>
          </p>
        </div>

        {/* Categorías */}
        <nav aria-label="Categorías de producto">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-ink">
            Categorías
          </h2>
          <ul className="space-y-2.5 text-sm text-brand-ink-soft">
            <li><Link className="transition-colors hover:text-brand-coral" to="/categoria/morrales">Morrales</Link></li>
            <li><Link className="transition-colors hover:text-brand-coral" to="/categoria/loncheras">Loncheras</Link></li>
            <li><Link className="transition-colors hover:text-brand-coral" to="/categoria/cartucheras">Cartucheras</Link></li>
            <li><Link className="transition-colors hover:text-brand-coral" to="/categoria/tulas">Tulas</Link></li>
            <li><Link className="transition-colors hover:text-brand-coral" to="/categoria/recordatorios">Recordatorios</Link></li>
          </ul>
        </nav>

        {/* Empresa */}
        <nav aria-label="Empresa">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-ink">
            Empresa
          </h2>
          <ul className="space-y-2.5 text-sm text-brand-ink-soft">
            <li><Link className="transition-colors hover:text-brand-coral" to="/catalogo">Ver catálogo</Link></li>
            <li><Link className="transition-colors hover:text-brand-coral" to="/sobre-nosotros">Sobre nosotros</Link></li>
            <li><Link className="transition-colors hover:text-brand-coral" to="/faq">Preguntas frecuentes</Link></li>
            <li><Link className="transition-colors hover:text-brand-coral" to="/contacto">Contacto</Link></li>
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
              className="mb-4 inline-flex items-center gap-2 rounded-pill bg-whatsapp px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105"
            >
              💬 Escríbenos por WhatsApp
            </a>
          ) : null}
          <ul className="space-y-2.5 text-sm text-brand-ink-soft">
            <li>
              <a href="https://instagram.com/eventoarte.co" target="_blank" rel="noreferrer" className="transition-colors hover:text-brand-coral">
                📷 @eventoarte.co
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-border py-5">
        <p className="container-page text-center text-xs text-brand-ink-soft">
          © {year} eventoarte.co · Todos los derechos reservados · Hecho con ♥ en Colombia
        </p>
      </div>
    </footer>
  );
}
