/**
 * /admin/login — Pantalla de acceso al CMS (placeholder de la Fase 3).
 */
export function meta() {
  return [{ title: "Iniciar sesión — eventoarte.co" }, { name: "robots", content: "noindex, nofollow" }];
}

export default function AdminLogin() {
  return (
    <main className="container-page py-16 text-center">
      <h1 className="text-3xl">🔒 Iniciar sesión</h1>
      <p className="mt-3 text-brand-ink-soft">
        La autenticación del CMS se implementa en la Fase 3.
      </p>
    </main>
  );
}
