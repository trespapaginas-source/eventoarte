import type { Config } from "@react-router/dev/config";

// React Router config — docs: https://reactrouter.com/api/framework-conventions/react-router.config.ts
export default {
  // SSR en Cloudflare Workers (edge).
  ssr: true,
  // Prerender de rutas estáticas definidas con `loader` que retornan export const prerender = true
  prerender: false,
} satisfies Config;
