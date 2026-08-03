import { createContext } from "react-router";

/**
 * Contexto tipado de Cloudflare para React Router v8.
 * Los loaders/actions lo leen con: context.get(cloudflareContext)
 */

export interface CloudflareEnv {
  DB: D1Database;
  // MEDIA: R2Bucket;  // se habilita tras activar R2 en el dashboard
  WA_NUMBER: string;
  PUBLIC_URL: string;
  SITE_NAME: string;
  SESSION_SECRET: string;
  CSRF_SECRET: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD_HASH: string;
  NOTIFICATION_EMAIL_TOKEN: string;
}

export interface CloudflareData {
  env: CloudflareEnv;
  ctx: ExecutionContext;
}

// Contexto tipado accesible desde loaders/actions/middleware.
export const cloudflareContext = createContext<CloudflareData>();
