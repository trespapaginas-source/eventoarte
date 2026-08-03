/// <reference path="../worker-configuration.d.ts" />
import { createRequestHandler } from "react-router";

/**
 * Tipo Env: agrupa los bindings/vars declarados en wrangler.jsonc y validados
 * por worker-configuration.d.ts (que los declara como `const` globales).
 */
interface Env {
  DB: D1Database;
  // MEDIA: R2Bucket;  // se habilita tras activar R2 en el dashboard
  WA_NUMBER: string;
  PUBLIC_URL: string;
  SITE_NAME: string;
  SESSION_SECRET: string;
  CSRF_SECRET: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD_HASH: string;
  NOTIFICATION_EMAIL_TOKEN: string;
}

/**
 * Punto de entrada del Worker de Cloudflare para React Router v7.
 * El Cloudflare Vite plugin inyecta el server-build generado en build/server.
 *
 * El contexto (env con bindings) se expone como `context.cloudflare` a los
 * loaders/actions de React Router.
 */
declare module "react-router" {
  interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const handler = createRequestHandler(
      () => import("virtual:react-router/server-build"),
      import.meta.env.MODE,
    );
    return handler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<Env>;
