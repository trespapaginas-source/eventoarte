import type { Route } from "./+types/media";
import { cloudflareContext } from "~/lib/cloudflare-context";

/**
 * Resource route: GET /media/*
 * Sirve objetos de R2 (imágenes subidas desde el CMS) públicamente.
 * Cachea en el navegador 1 día (inmutable salvo que se re-suba con nueva key).
 *
 * Si R2 no está activo, devuelve 404.
 */
export async function loader({ context, params }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  if (!env.MEDIA) {
    throw new Response("R2 no disponible", { status: 503 });
  }

  const key = (params["*"] ?? "").replace(/^\/+/, "");
  if (!key) throw new Response("Not found", { status: 404 });

  const object = await env.MEDIA.get(key);
  if (!object) throw new Response("Not found", { status: 404 });

  const headers = new Headers();
  headers.set("Content-Type", object.httpMetadata?.contentType ?? "image/jpeg");
  headers.set("Cache-Control", "public, max-age=86400, immutable");
  headers.set("ETag", object.httpEtag);

  return new Response(object.body, { headers });
}
