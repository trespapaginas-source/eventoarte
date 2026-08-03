import { Link, Form, useParams } from "react-router";
import type { ComponentProps } from "react";
import { resolveBrand, brandPath, type BrandConfig } from "./brand";

/**
 * ============================================================
 * Helpers de navegación conscientes de la marca activa.
 * ============================================================
 * En sitios multi-marca, la navegación interna debe quedarse dentro
 * del directorio activo: si navegas /recordarte/catalogo y haces clic
 * en "Inicio", vas a /recordarte/ (NO a /).
 *
 * Uso:
 *   import { useBrand, BrandLink, BrandForm } from "~/lib/brand-links";
 *   const brand = useBrand();
 *   <BrandLink to="/catalogo">Catálogo</BrandLink>
 *
 * Los componentes administrativos (/admin/*) NO usan estos helpers;
 * siguen enraizados en /admin.
 */

/** Lee la marca activa del segmento de URL :brand? */
export function useBrand(): BrandConfig {
  const params = useParams();
  return resolveBrand(params.brand);
}

/** Hook que devuelve el slug crudo del directorio (o undefined si es raíz). */
export function useBrandSlug(): string | undefined {
  return useParams().brand;
}

/**
 * <BrandLink> — como <Link> pero aplica el prefijo de marca activa.
 * Props idénticas a Link. El `to` siempre debe ser una ruta relativa
 * a la raíz lógica (ej. "/catalogo"), y se le antepone el prefijo.
 */
export function BrandLink({
  to,
  ...props
}: Omit<ComponentProps<typeof Link>, "to"> & { to: string }) {
  const brand = useBrand();
  return <Link to={brandPath(to, brand)} {...props} />;
}

/**
 * <BrandForm> — como <Form> pero aplica el prefijo de marca activa al action.
 * Útil para el buscador y cualquier form que POSTee a una ruta pública.
 */
export function BrandForm({
  action,
  ...props
}: Omit<ComponentProps<typeof Form>, "action"> & { action: string }) {
  const brand = useBrand();
  return <Form action={brandPath(action, brand)} {...props} />;
}
