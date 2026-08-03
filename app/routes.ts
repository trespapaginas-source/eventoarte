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

  // Público: Niños / Niñas (mismo componente, ids distintos)
  route("ninos", "routes/audience.tsx", { id: "ninos" }),
  route("ninas", "routes/audience.tsx", { id: "ninas" }),

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

  // CMS (fase 3)
  ...prefix("admin", [
    index("routes/admin/index.tsx"),
    route("login", "routes/admin/login.tsx"),
  ]),
] satisfies RouteConfig;
