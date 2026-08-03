import {
  type RouteConfig,
  index,
  route,
  prefix,
} from "@react-router/dev/routes";

/**
 * Definición de rutas — Sección 4.3 (mapa del sitio).
 * El CMS /admin se declarará como layout SPA en fases posteriores.
 */
export default [
  // Home
  index("routes/home.tsx"),

  // Catálogo y filtros
  route("catalogo", "routes/catalogo.tsx"),
  route("buscar", "routes/buscar.tsx"),
  route("categoria/:slug", "routes/categoria.tsx"),
  route("ocasion/:slug", "routes/ocasion.tsx"),

  // Producto y cotización
  route("producto/:slug", "routes/producto.tsx"),
  route("cotizar", "routes/cotizar.tsx"),

  // Páginas estáticas
  route("sobre-nosotros", "routes/sobre-nosotros.tsx"),
  route("contacto", "routes/contacto.tsx"),
  route("faq", "routes/faq.tsx"),

  // Resource routes (SEO)
  route("sitemap.xml", "routes/sitemap.ts"),
  route("robots.txt", "routes/robots.ts"),

  // CMS — /admin (protegido)
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
  ]),

  // Servir imágenes de R2 públicamente
  route("media/*", "routes/media.ts"),
] satisfies RouteConfig;
