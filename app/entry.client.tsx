import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

/**
 * Entry client para React Router v7.
 * Hidrata el HTML generado en el servidor dentro de un <HydratedRouter>,
 * necesario para que <Link>, useLoaderData, etc. funcionen en cliente.
 */
startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});
