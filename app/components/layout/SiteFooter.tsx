import { Link } from "react-router";

/**
 * Footer público de eventoarte.co.
 * Sección 7.1 del Documento Técnico. Editable desde el CMS en fases posteriores.
 */
export function SiteFooter({ waNumber }: { waNumber?: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-border bg-brand-cream">
      <div className="container-page grid gap-8 py-12 md:grid-cols-4">
        <div>
          <p className="font-display text-xl font-extrabold text-brand-coral">
            eventoarte<span className="text-brand-mustard">.co</span>
          </p>
          <p className="mt-2 text-sm text-brand-ink-soft">
            Recordatorios y productos personalizados para celebrar tus momentos.
            Hecho en Colombia. 🇨🇴
          </p>
        </div>

        <nav aria-label="Catálogo">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">Catálogo</h2>
          <ul className="space-y-2 text-sm text-brand-ink-soft">
            <li><Link className="hover:text-brand-coral" to="/catalogo">Todos los productos</Link></li>
            <li><Link className="hover:text-brand-coral" to="/categoria/morrales-y-kits">Morrales y kits</Link></li>
            <li><Link className="hover:text-brand-coral" to="/categoria/loncheras">Loncheras</Link></li>
            <li><Link className="hover:text-brand-coral" to="/categoria/recordatorios">Recordatorios</Link></li>
          </ul>
        </nav>

        <nav aria-label="Ocasiones">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">Por ocasión</h2>
          <ul className="space-y-2 text-sm text-brand-ink-soft">
            <li><Link className="hover:text-brand-coral" to="/ocasion/baby-shower">Baby shower</Link></li>
            <li><Link className="hover:text-brand-coral" to="/ocasion/cumpleanos">Cumpleaños</Link></li>
            <li><Link className="hover:text-brand-coral" to="/ocasion/quinceanos">Quinceaños</Link></li>
            <li><Link className="hover:text-brand-coral" to="/ocasion/bautizos">Bautizos y comuniones</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">Contacto</h2>
          {waNumber ? (
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-pill bg-whatsapp px-4 py-2 text-sm font-semibold text-white"
            >
              💬 WhatsApp
            </a>
          ) : null}
          <ul className="mt-3 space-y-1 text-sm text-brand-ink-soft">
            <li><Link className="hover:text-brand-coral" to="/contacto">Contáctanos</Link></li>
            <li><Link className="hover:text-brand-coral" to="/faq">Preguntas frecuentes</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-4 text-center text-xs text-brand-ink-soft">
        © {year} eventoarte.co · Hecho con ♥ en Colombia
      </div>
    </footer>
  );
}
