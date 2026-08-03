import type { Route } from "./+types/robots";
import { cloudflareContext } from "~/lib/cloudflare-context";

/**
 * Resource route: /robots.txt — Sección 12.6.
 */
export function loader({ context }: Route.LoaderArgs) {
  const base = (context.get(cloudflareContext).env.PUBLIC_URL ?? "https://recuerdos.store").replace(/\/$/, "");
  const body = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${base}/sitemap.xml
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
