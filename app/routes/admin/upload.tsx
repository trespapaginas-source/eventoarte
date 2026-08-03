import type { Route } from "./+types/upload";
import { cloudflareContext } from "~/lib/cloudflare-context";
import { requireUser } from "~/lib/auth";

/**
 * Resource route: POST /admin/upload
 * Recibe una imagen (multipart), la guarda en R2 y devuelve JSON { key, url }.
 *
 * Acepta un campo opcional `prefix` (string) para organizar las imágenes
 * por tipo: "productos" (default), "categorias", etc.
 *
 * Requiere que el binding MEDIA (R2Bucket) esté activo.
 * Si R2 no está configurado, devuelve error 503 con instrucciones.
 */

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const VALID_PREFIXES = new Set(["productos", "categorias", "banners", "general"]);

export async function action({ context, request }: Route.ActionArgs) {
  await requireUser({ context, request });
  const { env } = context.get(cloudflareContext);

  if (!env.MEDIA) {
    return json({ error: "R2 no está activo. Activa el bucket 'recuerdos-media' en el dashboard de Cloudflare." }, 503);
  }

  const form = await request.formData();
  const file = form.get("file");
  const prefix = String(form.get("prefix") ?? "productos").replace(/[^a-z0-9_-]/gi, "").toLowerCase();
  const safePrefix = VALID_PREFIXES.has(prefix) ? prefix : "productos";

  if (!(file instanceof File)) {
    return json({ error: "No se recibió ningún archivo." }, 400);
  }
  if (!ALLOWED.includes(file.type)) {
    return json({ error: `Tipo no permitido: ${file.type}. Usa JPG, PNG, WEBP o GIF.` }, 415);
  }
  if (file.size > MAX_BYTES) {
    return json({ error: "La imagen supera los 5 MB." }, 413);
  }

  // Generar clave única: <prefix>/<timestamp>-<random>.<ext>
  const ext = file.type.split("/")[1] ?? "jpg";
  const rand = Math.random().toString(36).slice(2, 8);
  const key = `${safePrefix}/${Date.now()}-${rand}.${ext}`;

  const bytes = new Uint8Array(await file.arrayBuffer());
  await env.MEDIA.put(key, bytes, {
    httpMetadata: { contentType: file.type },
  });

  return json({ key, url: `/media/${key}` });
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

