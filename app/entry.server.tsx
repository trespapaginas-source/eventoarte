import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import type { EntryContext } from "react-router";

/**
 * Entry server para Cloudflare Workers (runtime web estándar, sin Node APIs).
 * - Bots: espera el render completo (mejor SEO).
 * - Humanos: streaming con renderToReadableStream.
 *
 * En v8 el loadContext es un RouterContextProvider (no se usa aquí directamente).
 */
export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
) {
  const userAgent = request.headers.get("user-agent") ?? "";
  const bot = isbot(userAgent);

  responseHeaders.set("Content-Type", "text/html; charset=utf-8");

  const body = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} />,
    {
      signal: bot ? undefined : request.signal,
      onError(error: unknown) {
        // eslint-disable-next-line no-console
        console.error(error);
        if (!bot) responseStatusCode = 500;
      },
    },
  );

  // Los bots reciben el HTML completo para indexar.
  if (bot) await body.allReady;

  return new Response(body, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
