import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "react-router";
import type { Route } from "./+types/root";
import { cloudflareContext } from "~/lib/cloudflare-context";
import "./styles/app.css";

/**
 * Root loader: expone datos globales (WhatsApp, URL pública) a toda la app.
 * En v8 el contexto de Cloudflare se lee con context.get(cloudflareContext).
 */
export function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  return {
    waNumber: env.WA_NUMBER,
    publicUrl: env.PUBLIC_URL,
  };
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#7ca8e8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const message =
    status === 404
      ? "Página no encontrada"
      : "Ocurrió un error inesperado. Intenta de nuevo.";

  return (
    <main className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-mono text-gradient-brand">{status}</p>
      <h1 className="text-3xl">{message}</h1>
      <a href="/" className="text-gradient-brand underline">
        Volver al inicio
      </a>
    </main>
  );
}
