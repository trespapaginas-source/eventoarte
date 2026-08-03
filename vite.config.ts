import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig, type PluginOption } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

/**
 * React Router v8 + Cloudflare Workers + Tailwind v4
 * Docs: https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/
 *
 * El plugin de Cloudflare expone automáticamente `context.cloudflare` (con env,
 * ctx, cf) a los loaders/actions de React Router. No se requiere getLoadContext.
 */
export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    reactRouter({ serverModuleFormat: "esm" }),
    tailwindcss() as PluginOption,
    tsconfigPaths(),
  ],
  ssr: {
    resolve: {
      externalConditions: ["workerd", "browser"],
    },
  },
});
