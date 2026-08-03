/**
 * /admin — Dashboard del CMS (placeholder de la Fase 3).
 * Será una SPA protegida con auth y bottom navigation tipo app nativa.
 */
export function meta() {
  return [{ title: "Admin — eventoarte.co" }, { name: "robots", content: "noindex, nofollow" }];
}

export default function AdminIndex() {
  return (
    <main className="container-page py-16 text-center">
      <h1 className="text-3xl">CMS en construcción</h1>
      <p className="mt-3 text-brand-ink-soft">
        El panel de administración se desarrolla en la Fase 3 del proyecto.
      </p>
      <a href="/" className="mt-6 inline-block text-brand-ink underline">Volver al inicio</a>
    </main>
  );
}
