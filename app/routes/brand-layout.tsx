import { Outlet } from "react-router";

/**
 * Layout pathless para el segmento de marca `:brand?`.
 *
 * No renderiza nada propio (solo <Outlet />); su único propósito es
 * agrupar TODAS las rutas públicas bajo un padre con path ":brand?"
 * para que React Router v8 las sirva en:
 *   - /            (brand undefined → default Bella Arte)
 *   - /bellaarte/... 
 *   - /recordarte/...
 *
 * El layout está vacío porque el <PublicLayout> (header/footer) lo
 * aporta cada página individualmente, igual que antes.
 */
export default function BrandLayout() {
  return <Outlet />;
}
