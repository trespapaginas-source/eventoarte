/// <reference path="../worker-configuration.d.ts" />
import { createRequestHandler, RouterContextProvider } from "react-router";
import { cloudflareContext, type CloudflareEnv } from "../app/lib/cloudflare-context";

/**
 * Punto de entrada del Worker de Cloudflare para React Router v8.
 *
 * Creamos un RouterContextProvider, le inyectamos el contexto de Cloudflare
 * (env + ctx), y los loaders lo leen con context.get(cloudflareContext).
 */

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext) {
    const provider = new RouterContextProvider();
    provider.set(cloudflareContext, { env, ctx });
    return requestHandler(request, provider);
  },
} satisfies ExportedHandler<CloudflareEnv>;
