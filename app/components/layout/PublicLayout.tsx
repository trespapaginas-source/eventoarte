import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import type { BrandConfig } from "~/lib/brand";

/**
 * Layout público con header + footer compartido.
 * Recibe la marca activa (resuelta en el loader desde :brand?) y la
 * propaga al header y footer para que usen el WhatsApp/Instagram correcto.
 */
export function PublicLayout({
  children,
  brand,
  banner,
}: {
  children: React.ReactNode;
  brand?: BrandConfig;
  banner?: { text: string; active: boolean; link?: string | null };
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader brand={brand} banner={banner} />
      <div className="flex-1">{children}</div>
      <SiteFooter brand={brand} />
    </div>
  );
}
