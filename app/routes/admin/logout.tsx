import type { Route } from "./+types/logout";
import { cloudflareContext } from "~/lib/cloudflare-context";
import { readSessionCookie, endSession, clearSessionCookie } from "~/lib/auth";
import { getDb } from "~/lib/db/client";

/**
 * Resource route: POST /admin/logout
 * Borra la sesión y la cookie, redirige al login.
 */
export async function action({ context, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const token = readSessionCookie(request);
  if (token && env.DB) {
    const db = getDb(env.DB);
    await endSession(db, token);
  }
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/admin/login",
      "Set-Cookie": clearSessionCookie(),
    },
  });
}

/** GET también permite cerrar sesión (por si se accede directamente). */
export async function loader({ context, request }: Route.LoaderArgs) {
  return action({ context, request } as any);
}
