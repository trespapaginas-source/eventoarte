import type { Database } from "./db/client";
import {
  createSession,
  getSession,
  deleteSession,
  purgeExpiredSessions,
} from "./db/mutations";

/**
 * ============================================================
 * Autenticación del CMS — Admin único vía variables de entorno.
 *
 * Modelo:
 *  - ADMIN_EMAIL y ADMIN_PASSWORD_HASH en vars/secrets de Cloudflare.
 *  - ADMIN_PASSWORD_HASH es un hash PBKDF2 serializado: pbkdf2$iter$saltBase64$hashBase64
 *  - Sesión persistida en tabla `sessions` (token aleatorio de 32 bytes).
 *  - Cookie httpOnly + Secure + SameSite=Lax, expira en 30 días.
 *
 * PBKDF2 se implementa con Web Crypto API (disponible en Workers, sin libs).
 * ============================================================
 */

const SESSION_COOKIE = "eventoarte_admin";
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

export async function startSession(db: Database): Promise<{ token: string; maxAge: number }> {
  await purgeExpiredSessions(db);
  const token = randomToken();
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  await createSession(db, token, expiresAt);
  return { token, maxAge: SESSION_TTL_SECONDS };
}

export async function validateSession(
  db: Database,
  token: string | null,
): Promise<boolean> {
  if (!token) return false;
  await purgeExpiredSessions(db);
  const session = await getSession(db, token);
  if (!session) return false;
  if (session.expiresAt < Math.floor(Date.now() / 1000)) {
    await deleteSession(db, token);
    return false;
  }
  return true;
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

/* ---------------- Credenciales admin ---------------- */

export interface AdminCredentials {
  email: string;
  passwordHash: string;
}

/** Verifica email+password contra las vars de entorno. */
export async function checkCredentials(
  email: string,
  password: string,
  creds: AdminCredentials,
): Promise<boolean> {
  if (email.trim().toLowerCase() !== creds.email.trim().toLowerCase()) return false;
  return verifyPassword(password, creds.passwordHash);
}

/* ---------------- Helper de protección de rutas ---------------- */

import { cloudflareContext } from "./cloudflare-context";

/**
 * Verifica que hay sesión válida; si no, lanza redirect a /admin/login.
 * Usar al inicio de cada loader/action admin protegido.
 */
export async function requireAdmin(args: {
  context: any;
  request: Request;
}): Promise<void> {
  const { env } = args.context.get(cloudflareContext);
  const db = env.DB ? (await import("./db/client")).getDb(env.DB) : null;
  if (!db) throw new Response("Base de datos no disponible", { status: 503 });

  const token = readSessionCookie(args.request);
  const ok = await validateSession(db, token);
  if (!ok) {
    throw new Response(null, {
      status: 302,
      headers: { Location: "/admin/login" },
    });
  }
}

/** Devuelve el db si hay sesión válida, o null. Para rutas que pueden mostrar UI sin sesión. */
export async function getDbIfAdmin(args: {
  context: any;
  request: Request;
}): Promise<Database | null> {
  const { env } = args.context.get(cloudflareContext);
  if (!env.DB) return null;
  const db = (await import("./db/client")).getDb(env.DB);
  const token = readSessionCookie(args.request);
  const ok = await validateSession(db, token);
  return ok ? db : null;
}
