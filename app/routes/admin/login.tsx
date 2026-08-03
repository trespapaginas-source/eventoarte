import type { Route } from "./+types/login";
import { Form, redirect } from "react-router";
import { cloudflareContext } from "~/lib/cloudflare-context";
import {
  authenticate,
  readSessionCookie,
  setSessionCookie,
  validateSession,
  startSession,
} from "~/lib/auth";
import { getDb } from "~/lib/db/client";
import { Field, TextInput } from "~/components/ui/Field";
import { Button } from "~/components/ui/Toggle";
import { Logo } from "~/components/layout/Logo";

export function meta() {
  return [
    { title: "Iniciar sesión — recuerdos.store" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

/** Si ya hay sesión válida, redirige al dashboard. */
export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  if (env.DB) {
    const db = getDb(env.DB);
    const token = readSessionCookie(request);
    if (token && (await validateSession(db, token))) {
      throw redirect("/admin");
    }
  }
  return {};
}

export async function action({ context, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresa tu correo y contraseña." };
  }

  if (!env.DB) {
    return { error: "Base de datos no disponible." };
  }
  const db = getDb(env.DB);
  const user = await authenticate(db, email, password);

  if (!user) {
    return { error: "Correo o contraseña incorrectos." };
  }

  const { token, maxAge } = await startSession(db, user.id);

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/admin",
      "Set-Cookie": setSessionCookie(token, maxAge),
    },
  });
}

export default function AdminLogin({ actionData }: Route.ComponentProps) {
  const error = (actionData as { error?: string } | null)?.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-off px-4">
      <div className="w-full max-w-sm border border-border bg-surface p-8">
        <a href="/" className="flex justify-center">
          <Logo textClassName="text-xl" />
        </a>
        <h1 className="mt-6 text-center text-lg font-bold text-brand-ink">
          Panel de administración
        </h1>
        <p className="mt-1 text-center text-sm text-brand-ink-soft">
          Ingresa con tu cuenta para gestionar el catálogo
        </p>

        <Form method="post" className="mt-6 space-y-4">
          {error ? (
            <p className="border border-error bg-error/5 px-3 py-2 text-xs text-error">
              {error}
            </p>
          ) : null}
          <Field label="Correo" name="email" required>
            <TextInput
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@recuerdos.store"
            />
          </Field>
          <Field label="Contraseña" name="password" required>
            <TextInput name="password" type="password" required autoComplete="current-password" />
          </Field>
          <Button type="submit" className="w-full">
            Iniciar sesión
          </Button>
        </Form>

        <p className="mt-6 text-center text-[11px] text-brand-ink-light">
          Zona privada · Solo administradores
        </p>
      </div>
    </main>
  );
}
