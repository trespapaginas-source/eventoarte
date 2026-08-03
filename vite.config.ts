import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig, type PluginOption } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

/**
 * React Router v7 + Cloudflare Workers + Tailwind v4
 * Docs: https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/
 *
 * El Cloudflare Vite plugin expone automáticamente el contexto (env con bindings
 * DB, MEDIA, vars) como `context.cloudflare` en los loaders/actions.
 */
export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    reactRouter({ serverModuleFormat: "esm" }),
    // tailwindcss() devuelve Plugin[]; Vite aplana arrays en plugins.
    tailwindcss() as PluginOption,
    tsconfigPaths(),
  ],
  ssr: {
    resolve: {
      externalConditions: ["workerd", "browser"],
    },
  },
});
