import type { Route } from "./+types/usuarios";
import { Form } from "react-router";
import { Users as UsersIcon, KeyRound, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AdminShell } from "~/components/admin/AdminShell";
import { Button } from "~/components/ui/Toggle";
import { Field, TextInput, Select } from "~/components/ui/Field";
import { cloudflareContext } from "~/lib/cloudflare-context";
import { requireUser, requireRole, hashPassword } from "~/lib/auth";
import { getDb } from "~/lib/db/client";
import {
  listUsers,
  createUser,
  updateUserPassword,
  setUserActive,
  deleteUser,
} from "~/lib/db/mutations";

export function meta() {
  return [
    { title: "Usuarios — Admin recuerdos.store" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const user = await requireUser({ context, request });
  requireRole(user, "admin");
  const { env } = context.get(cloudflareContext);
  if (!env.DB) return { users: [], currentUserId: user.id };
  const db = getDb(env.DB);
  const users = await listUsers(db);
  // No exponer el hash al cliente
  return {
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      active: u.active,
    })),
    currentUserId: user.id,
  };
}

export async function action({ context, request }: Route.ActionArgs) {
  const user = await requireUser({ context, request });
  requireRole(user, "admin");
  const { env } = context.get(cloudflareContext);
  if (!env.DB) return { error: "DB no disponible" };
  const db = getDb(env.DB);

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "create") {
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const role = String(form.get("role") ?? "bellaarte") as
      | "admin"
      | "recordarte"
      | "bellaarte";
    if (!name || !email || password.length < 6) {
      return { error: "Nombre, email y contraseña (mín. 6 caracteres) son obligatorios." };
    }
    const passwordHash = await hashPassword(password);
    try {
      await createUser(db, { name, email, passwordHash, role, active: true });
      return { ok: "Usuario creado correctamente." };
    } catch (e: any) {
      return { error: e?.message?.includes("UNIQUE") ? "Ya existe un usuario con ese email." : "Error al crear el usuario." };
    }
  }

  if (intent === "reset") {
    const id = Number(form.get("id"));
    const password = String(form.get("password") ?? "");
    if (password.length < 6) return { error: "La contraseña debe tener mínimo 6 caracteres." };
    const passwordHash = await hashPassword(password);
    await updateUserPassword(db, id, passwordHash);
    return { ok: "Contraseña actualizada." };
  }

  if (intent === "toggle") {
    const id = Number(form.get("id"));
    const active = form.get("active") === "true";
    await setUserActive(db, id, !active);
    return { ok: active ? "Usuario desactivado." : "Usuario activado." };
  }

  if (intent === "delete") {
    const id = Number(form.get("id"));
    if (id === user.id) return { error: "No puedes eliminar tu propia cuenta." };
    await deleteUser(db, id);
    return { ok: "Usuario eliminado." };
  }

  return { error: "Acción no reconocida." };
}

export default function AdminUsuarios({ loaderData, actionData }: Route.ComponentProps) {
  const { users, currentUserId } = loaderData as {
    users: { id: number; name: string; email: string; role: string; active: boolean }[];
    currentUserId: number;
  };
  const msg = (actionData as { ok?: string; error?: string } | null) ?? {};
  const [creating, setCreating] = useState(false);

  return (
    <AdminShell>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-brand-ink">Usuarios</h1>
        <p className="mt-1 text-sm text-brand-ink-soft">
          Gestiona quién puede acceder al panel y con qué permisos
        </p>
      </header>

      {msg.ok ? (
        <p className="mb-4 border border-success bg-success/5 px-3 py-2 text-xs text-success">{msg.ok}</p>
      ) : null}
      {msg.error ? (
        <p className="mb-4 border border-error bg-error/5 px-3 py-2 text-xs text-error">{msg.error}</p>
      ) : null}

      {/* Botón crear */}
      <div className="mb-4">
        <Button icon={Plus} onClick={() => setCreating((v) => !v)}>
          {creating ? "Cancelar" : "Nuevo usuario"}
        </Button>
      </div>

      {/* Formulario crear */}
      {creating ? <CreateUserForm onDone={() => setCreating(false)} /> : null}

      {/* Lista de usuarios */}
      <div className="divide-y divide-border border border-border bg-surface">
        {users.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center gap-3 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-surface-off text-brand-ink-light">
              <UsersIcon size={16} strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-medium ${u.active ? "text-brand-ink" : "text-brand-ink-light"}`}>
                {u.name}
                {u.id === currentUserId ? <span className="ml-2 text-[10px] uppercase tracking-wide text-brand-ink-light">(tú)</span> : null}
              </p>
              <p className="text-[11px] text-brand-ink-light">{u.email}</p>
            </div>
            <span className={`border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
              u.role === "admin" ? "border-brand-ink bg-brand-ink text-white" : "border-border text-brand-ink-soft"
            }`}>
              {u.role}
            </span>
            <div className="flex items-center gap-1">
              {/* Reset password */}
              <Form method="post" className="contents" onSubmit={(e) => {
                const np = prompt(`Nueva contraseña para ${u.name} (mín. 6 caracteres):`);
                if (!np) { e.preventDefault(); return; }
                const fd = e.currentTarget;
                // inyectar password via input oculto
                let inp = fd.querySelector('input[name="password"]') as HTMLInputElement | null;
                if (!inp) { inp = document.createElement('input'); inp.type = 'hidden'; inp.name = 'password'; fd.appendChild(inp); }
                inp.value = np;
              }}>
                <input type="hidden" name="intent" value="reset" />
                <input type="hidden" name="id" value={u.id} />
                <button type="submit" aria-label="Cambiar contraseña" className="p-1.5 text-brand-ink-soft hover:text-brand-ink">
                  <KeyRound size={14} strokeWidth={1.5} />
                </button>
              </Form>
              {/* Activar/desactivar */}
              <Form method="post" className="contents">
                <input type="hidden" name="intent" value="toggle" />
                <input type="hidden" name="id" value={u.id} />
                <input type="hidden" name="active" value={String(u.active)} />
                <button type="submit" className={`px-2 py-1 text-[10px] uppercase tracking-wide ${u.active ? "text-brand-ink-light hover:text-error" : "text-success hover:opacity-70"}`}>
                  {u.active ? "Desactivar" : "Activar"}
                </button>
              </Form>
              {/* Eliminar */}
              <Form method="post" className="contents" onSubmit={(e) => {
                if (!confirm(`¿Eliminar a ${u.name}? No se puede deshacer.`)) e.preventDefault();
              }}>
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="id" value={u.id} />
                <button type="submit" disabled={u.id === currentUserId} aria-label="Eliminar" className="p-1.5 text-brand-ink-soft hover:text-error disabled:opacity-30">
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </Form>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border border-border bg-surface-off p-4 text-xs text-brand-ink-soft">
        <p className="font-medium text-brand-ink">Permisos por rol:</p>
        <ul className="mt-2 space-y-1">
          <li><strong>admin</strong> — acceso total: catálogo, usuarios, ambas marcas, config global.</li>
          <li><strong>recordarte / bellaarte</strong> — editan el catálogo compartido y SOLO su config de marca.</li>
        </ul>
      </div>
    </AdminShell>
  );
}

function CreateUserForm({ onDone }: { onDone: () => void }) {
  return (
    <Form method="post" className="mb-6 space-y-4 border border-border bg-surface p-4">
      <input type="hidden" name="intent" value="create" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" name="name" required>
          <TextInput name="name" required placeholder="Bella Arte" />
        </Field>
        <Field label="Email" name="email" required>
          <TextInput name="email" type="email" required placeholder="bellaarte@recuerdos.store" />
        </Field>
        <Field label="Contraseña inicial" name="password" required hint="Mínimo 6 caracteres">
          <TextInput name="password" type="password" required placeholder="••••••" />
        </Field>
        <Field label="Rol" name="role">
          <Select name="role" defaultValue="bellaarte">
            <option value="bellaarte">Bella Arte (editor + su marca)</option>
            <option value="recordarte">Recordarte (editor + su marca)</option>
            <option value="admin">Administrador (acceso total)</option>
          </Select>
        </Field>
      </div>
      <div className="flex justify-end">
        <Button type="submit" onClick={onDone}>Crear usuario</Button>
      </div>
    </Form>
  );
}
