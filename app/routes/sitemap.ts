import type { Route } from "./+types/sitemap";
import { cloudflareContext } from "~/lib/cloudflare-context";

/**
 * Resource route: /sitemap.xml
 * Genera el sitemap dinámicamente. En fase 0 lista las rutas estáticas;
 * en fases siguientes se enriquece con productos/categorías desde D1.
 */
export function loader({ context }: Route.LoaderArgs) {
  const base = (context.get(cloudflareContext).env.PUBLIC_URL ?? "https://eventoarte.co").replace(/\/$/, "");
  const today = new Date().toISOString().split("T")[0];

  const urls = [
    { loc: `${base}/`, changefreq: "weekly", priority: "1.0" },
    { loc: `${base}/catalogo`, changefreq: "weekly", priority: "0.9" },
    { loc: `${base}/cotizar`, changefreq: "monthly", priority: "0.7" },
    { loc: `${base}/sobre-nosotros`, changefreq: "monthly", priority: "0.5" },
    { loc: `${base}/contacto`, changefreq: "monthly", priority: "0.5" },
    { loc: `${base}/faq`, changefreq: "monthly", priority: "0.4" },
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
