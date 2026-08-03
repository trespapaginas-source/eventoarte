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
import "./styles/app.css";

/**
 * Función que enlaza el contexto de Cloudflare (bindings: DB, MEDIA, vars)
 * con los loaders/actions de React Router.
 */
export function loader({ context }: Route.LoaderArgs) {
  // Exponemos el env completo para que los loaders accedan a bindings.
  return { cloudflare: (context as any).cloudflare?.env ?? context.cloudflare };
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#e8645a" />
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
      <p className="font-mono text-brand-coral">{status}</p>
      <h1 className="text-3xl">{message}</h1>
      <a href="/" className="text-brand-coral underline">
        Volver al inicio
      </a>
    </main>
  );
}
