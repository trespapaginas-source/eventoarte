import type { Database } from "./db/client";
import {
  createSession,
  getSession,
  deleteSession,
  purgeExpiredSessions,
  getUserByEmail,
  getUserById,
} from "./db/mutations";
import type { User, UserRole } from "./db/schema";

/**
 * ============================================================
 * Autenticación del CMS — Multi-usuario contra tabla `users`.
 *
 * Modelo:
 *  - Usuarios en tabla `users` (email único, passwordHash PBKDF2, role).
 *  - Roles: admin (acceso total + gestión usuarios), recordarte, bellaarte
 *    (editores del catálogo compartido; solo editan su config de marca).
 *  - Sesión persistida en tabla `sessions` (token aleatorio, userId real).
 *  - Cookie httpOnly + Secure + SameSite=Lax, expira en 30 días.
 *
 * PBKDF2 se implementa con Web Crypto API (disponible en Workers, sin libs).
 * ============================================================
 */

const SESSION_COOKIE = "recuerdos_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 días
const PBKDF2_ITERATIONS = 100_000;
const HASH_ALGO = "SHA-256";

/* ---------------- Hashing (PBKDF2) ---------------- */

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveKey(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  if (!parts[2] || !parts[3]) return false;
  const salt = fromBase64(parts[2]);
  const expected = fromBase64(parts[3]);
  const computed = await deriveKey(password, salt, iterations);
  return constantTimeEqual(computed, expected);
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: HASH_ALGO },
    baseKey,
    256,
  );
  return new Uint8Array(bits);
}

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

/* ---------------- Sesiones ---------------- */

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return toBase64(bytes).replace(/[^a-zA-Z0-9]/g, "").slice(0, 40);
}

export async function startSession(db: Database, userId: number): Promise<{ token: string; maxAge: number }> {
  await purgeExpiredSessions(db);
  const token = randomToken();
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  await createSession(db, token, userId, expiresAt);
  return { token, maxAge: SESSION_TTL_SECONDS };
}

/**
 * Valida la sesión y devuelve el usuario completo (con rol), o null.
 * Cada loader/action usa el usuario retornado para aplicar permisos.
 */
export async function validateSession(
  db: Database,
  token: string | null,
): Promise<User | null> {
  if (!token) return null;
  await purgeExpiredSessions(db);
  const session = await getSession(db, token);
  if (!session) return null;
  if (session.expiresAt < Math.floor(Date.now() / 1000)) {
    await deleteSession(db, token);
    return null;
  }
  const user = await getUserById(db, session.userId);
  if (!user || !user.active) {
    // Usuario desactivado tras crear la sesión → la invalidamos
    await deleteSession(db, token);
    return null;
  }
  return user;
}

export async function endSession(db: Database, token: string | null) {
  if (token) await deleteSession(db, token);
}

/* ---------------- Cookies ---------------- */

export function setSessionCookie(token: string, maxAge: number): string {
  // Workers siempre sirven tras HTTPS en producción; Secure siempre.
  return [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "HttpOnly",
    "SameSite=Lax",
    "Secure",
  ].join("; ");
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure`;
}

export function readSessionCookie(request: Request): string | null {
  const cookie = request.headers.get("Cookie") ?? "";
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match?.[1] ?? null;
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

/* ---------------- Autenticación contra tabla users ---------------- */

/**
 * Autentica email+password contra la tabla users.
 * Devuelve el usuario si las credenciales son válidas y la cuenta está activa.
 */
export async function authenticate(
  db: Database,
  email: string,
  password: string,
): Promise<User | null> {
  const user = await getUserByEmail(db, email.trim().toLowerCase());
  if (!user || !user.active) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  return ok ? user : null;
}

/* ---------------- Helpers de protección de rutas ---------------- */

import { cloudflareContext } from "./cloudflare-context";

/**
 * Verifica que hay sesión válida y devuelve el usuario autenticado.
 * Si no, lanza redirect a /admin/login.
 * Usar al inicio de cada loader/action admin protegido.
 */
export async function requireUser(args: {
  context: any;
  request: Request;
}): Promise<User> {
  const { env } = args.context.get(cloudflareContext);
  const db = env.DB ? (await import("./db/client")).getDb(env.DB) : null;
  if (!db) throw new Response("Base de datos no disponible", { status: 503 });

  const token = readSessionCookie(args.request);
  const user = await validateSession(db, token);
  if (!user) {
    throw new Response(null, {
      status: 302,
      headers: { Location: "/admin/login" },
    });
  }
  return user;
}

/**
 * Requiere que el usuario tenga un rol específico (ej: "admin" para gestión
 * de usuarios). Si no lo tiene, lanza 403.
 */
export function requireRole(user: User, role: UserRole): void {
  if (user.role !== role) {
    throw new Response("No tienes permiso para acceder a esta sección", {
      status: 403,
    });
  }
}

/**
 * Devuelve el scope de marca del usuario:
 *  - admin → null (sin restricción, puede ver/editar ambas marcas)
 *  - recordarte/bellaarte → solo su marca
 */
export function userBrandScope(user: User): "recordarte" | "bellaarte" | null {
  if (user.role === "admin") return null;
  return user.role;
}

/**
 * ¿Puede este usuario editar la config de una marca dada?
 * Admin puede todo; las marcas solo la suya.
 */
export function canEditBrand(user: User, brandSlug: string): boolean {
  if (user.role === "admin") return true;
  return user.role === brandSlug;
}

/** Devuelve el db si hay sesión válida, o null. Para rutas que pueden mostrar UI sin sesión. */
export async function getDbIfUser(args: {
  context: any;
  request: Request;
}): Promise<{ db: Database; user: User } | null> {
  const { env } = args.context.get(cloudflareContext);
  if (!env.DB) return null;
  const db = (await import("./db/client")).getDb(env.DB);
  const token = readSessionCookie(args.request);
  const user = await validateSession(db, token);
  return user ? { db, user } : null;
}
