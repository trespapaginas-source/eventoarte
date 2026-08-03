/// <reference path="../worker-configuration.d.ts" />
import { createRequestHandler, RouterContextProvider } from "react-router";
import { cloudflareContext, type CloudflareEnv } from "../app/lib/cloudflare-context";

/**
 * Punto de entrada del Worker de Cloudflare para React Router v8.
 *
 * Creamos un RouterContextProvider, le inyectamos el contexto de Cloudflare
 * (env + ctx), y los loaders lo leen con context.get(cloudflareContext).
 *
 * A las respuestas HTML dinámicas (SSR) les añadimos cabeceras anti-cache
 * para que los cambios se refle siempre inmediatamente en el navegador.
 */

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext) {
    const provider = new RouterContextProvider();
    provider.set(cloudflareContext, { env, ctx });
    const response = await requestHandler(request, provider);

    // Solo aplicamos anti-cache a documentos HTML (no a assets estáticos como
    // CSS/JS/imágenes, que SÍ deben cachearse para performance).
    const contentType = response.headers.get("Content-Type") ?? "";
    if (contentType.includes("text/html")) {
      const headers = new Headers(response.headers);
      headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, max-age=0",
      );
      headers.set("Pragma", "no-cache");
      headers.set("Expires", "0");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  },
} satisfies ExportedHandler<CloudflareEnv>;
