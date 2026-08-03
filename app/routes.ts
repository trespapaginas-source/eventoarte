import {
  type RouteConfig,
  index,
  route,
  prefix,
} from "@react-router/dev/routes";

/**
 * Definición de rutas — recuerdos.store.
 *
 * Estructura multi-marca: el sitio público vive bajo un segmento
 * `:brand?` OPCIONAL, de modo que la misma UI se sirve en:
 *   - /                    (raíz = Bella Arte, canónica)
 *   - /bellaarte/...       (alias explícito de la raíz)
 *   - /recordarte/...      (Recordarte, con su WhatsApp; noindex)
 *
 * Cualquier slug inválido (/xyz/...) cae también al default (Bella Arte)
 * vía resolveBrand(), así que nunca rompe.
 *
 * El CMS /admin, las rutas resource (sitemap, robots, media) y los
 * assets estáticos quedan FUERA del bloque :brand?, enraizados en /.
 *
 * Nota técnica: RR v8 usa la ruta del archivo como route id, así que
 * no podemos montar el mismo módulo varias veces (duplicate id). En
 * su lugar envolvemos TODAS las rutas públicas en un padre con
 * path ":brand?" (param opcional), que captura / , /bellaarte/* y
 * /recordarte/* con un solo árbol. El padre es un layout pathless
 * (brand-layout.tsx) que solo renderiza <Outlet/>.
 */
export default [
  // ====== Sitio público bajo prefijo de marca opcional ======
  // :brand? es opcional: coincide con "" (raíz) o "bellaarte"/"recordarte".
  route(
    ":brand?",
    "routes/brand-layout.tsx",
    [
      index("routes/home.tsx"),
      route("catalogo", "routes/catalogo.tsx"),
      route("buscar", "routes/buscar.tsx"),
      route("categoria/:slug", "routes/categoria.tsx"),
      route("ocasion/:slug", "routes/ocasion.tsx"),
      route("producto/:slug", "routes/producto.tsx"),
      route("cotizar", "routes/cotizar.tsx"),
      route("sobre-nosotros", "routes/sobre-nosotros.tsx"),
      route("contacto", "routes/contacto.tsx"),
      route("faq", "routes/faq.tsx"),
    ],
  ),

  // Resource routes (SEO) — en raíz, sin prefijo
  route("sitemap.xml", "routes/sitemap.ts"),
  route("robots.txt", "routes/robots.ts"),

  // CMS — /admin (protegido, sin prefijo de marca)
  ...prefix("admin", [
    index("routes/admin/index.tsx"),
    route("login", "routes/admin/login.tsx"),
    route("logout", "routes/admin/logout.tsx"),
    route("upload", "routes/admin/upload.tsx"),
    route("productos", "routes/admin/productos.tsx"),
    route("productos/nuevo", "routes/admin/productos.nuevo.tsx"),
    route("productos/:id", "routes/admin/productos.$id.tsx"),
    route("categorias", "routes/admin/categorias.tsx"),
    route("cotizaciones", "routes/admin/cotizaciones.tsx"),
    route("ajustes", "routes/admin/ajustes.tsx"),
    route("usuarios", "routes/admin/usuarios.tsx"),
  ]),

  // Servir imágenes de R2 públicamente
  route("media/*", "routes/media.ts"),
];
