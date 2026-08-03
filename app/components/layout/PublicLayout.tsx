import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/**
 * Layout público con header + footer compartido.
 * Recibe el número de WhatsApp (vendrá de settings en producción).
 */
export function PublicLayout({
  children,
  waNumber,
}: {
  children: React.ReactNode;
  waNumber?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader waNumber={waNumber} />
      <div className="flex-1">{children}</div>
      <SiteFooter waNumber={waNumber} />
    </div>
  );
}
