import type { Route } from "./+types/robots";

/**
 * Resource route: /robots.txt — Sección 12.6.
 */
export function loader({ context }: Route.LoaderArgs) {
  const base = (context.cloudflare.env.PUBLIC_URL ?? "https://eventoarte.co").replace(/\/$/, "");
  const body = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${base}/sitemap.xml
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
