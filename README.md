# eventoarte.co 🎉

**Catálogo profesional de recordatorios y productos personalizados para eventos** (cumpleaños, baby showers, quinceaños, bautizos y celebraciones). Modelo de cotización por WhatsApp + formulario, sin carrito ni pagos.

> 📄 Documentación técnica completa en [`docs/DOCUMENTO_TECNICO.md`](./docs/DOCUMENTO_TECNICO.md)

---

## 🧱 Stack tecnológico

| Capa | Tecnología | Por qué |
|---|---|---|
| **Framework** | React Router v7 (Remix) | SSR maduro, GA en Cloudflare, loader/action por ruta |
| **Edge compute** | Cloudflare Workers | Latencia mínima, serverless, económico |
| **DB** | Cloudflare D1 (SQLite) | Relacional, gratuito, replicado en lectura |
| **ORM** | Drizzle ORM | Type-safe, queries parametrizadas (anti-SQLi) |
| **Imágenes** | R2 + Cloudflare Images | Sin egress, optimización AVIF/WebP automática |
| **Estilos** | Tailwind CSS v4 + design tokens | Utility-first, bundle mínimo |
| **Validación** | Zod | Type-safe en cliente y servidor |
| **Build** | Vite 6 + `@cloudflare/vite-plugin` | HMR + build unificado |

---

## 🚀 Puesta en marcha

### Requisitos
- Node.js ≥ 20
- Cuenta de Cloudflare (gratis)
- Wrangler CLI (ya incluido como dependencia)

### Instalación
```bash
npm install
```

### Desarrollo local
```bash
npm run dev
```
Abre `http://localhost:5173` (o el puerto que indique la consola).

> 💡 En desarrollo, la app usa **datos de muestra** automáticamente cuando D1 aún no está configurado, así puedes previsualizar el diseño sin base de datos.

---

## 🗄️ Base de datos (D1)

### 1. Crear la base de datos en Cloudflare
```bash
npx wrangler d1 create eventoarte-db
```
Pega el `database_id` que devuelve en `wrangler.jsonc` → `d1_databases[0].database_id`.

### 2. Aplicar migraciones (esquema generado por Drizzle)
```bash
# Local (desarrollo)
npm run db:migrate:local

# Producción (remoto)
npm run db:migrate:prod
```

### 3. Cargar datos iniciales (categorías y ocasiones)
```bash
npm run db:seed:local
```

### Editar el esquema
El esquema vive en [`app/lib/db/schema.ts`](./app/lib/db/schema.ts). Tras editarlo:
```bash
npm run db:generate      # genera una nueva migración SQL
npm run db:migrate:local # la aplica
```

---

## 📦 Scripts disponibles

| Script | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción (cliente + servidor) |
| `npm run start` | Sirve el build con wrangler |
| `npm run typecheck` | Verificación de tipos TypeScript |
| `npm run deploy` | Build + deploy a Cloudflare |
| `npm run db:generate` | Genera migración desde el esquema Drizzle |
| `npm run db:migrate:local` | Aplica migraciones a D1 local |
| `npm run db:migrate:prod` | Aplica migraciones a D1 remoto |
| `npm run db:seed:local` | Carga datos iniciales |
| `npm run cf-typegen` | Regenera tipos de bindings de Cloudflare |

---

## 🔐 Configuración de secretos

Copia `.dev.vars.example` a `.dev.vars` y completa los valores para desarrollo local:
```bash
cp .dev.vars.example .dev.vars
```

Para producción, usa secretos de Cloudflare:
```bash
npx wrangler secret put SESSION_SECRET
npx wrangler secret put CSRF_SECRET
```

> ⚠️ **Nunca subas `.dev.vars` ni secretos reales a git.** Ya están en `.gitignore`.

---

## 📁 Estructura del proyecto

```
eventoarte/
├── app/
│   ├── components/          # Componentes reutilizables
│   │   ├── catalog/         # ProductCard, etc.
│   │   └── layout/          # SiteHeader, SiteFooter, PublicLayout
│   ├── lib/
│   │   ├── db/              # Esquema Drizzle, queries, seed
│   │   ├── whatsapp.ts      # Generador de enlaces wa.me
│   │   ├── seo.ts           # Meta + Schema.org
│   │   └── format.ts        # Formato COP, etc.
│   ├── routes/              # Rutas (file-based)
│   │   ├── home.tsx         # Página principal
│   │   ├── catalogo.tsx
│   │   ├── producto.tsx
│   │   ├── cotizar.tsx
│   │   ├── admin/           # CMS (Fase 3)
│   │   ├── sitemap.ts       # /sitemap.xml
│   │   └── robots.ts        # /robots.txt
│   ├── styles/app.css       # Tailwind + design tokens
│   ├── root.tsx             # <html>, Layout, ErrorBoundary
│   ├── routes.ts            # Definición de rutas
│   ├── entry.server.tsx     # SSR para Workers
│   └── entry.client.tsx     # Hidratación
├── workers/app.ts           # Entry del Worker de Cloudflare
├── drizzle/migrations/      # Migraciones SQL generadas
├── public/                  # Assets estáticos (favicon)
├── docs/DOCUMENTO_TECNICO.md
├── wrangler.jsonc           # Config Cloudflare (bindings D1/R2)
├── drizzle.config.ts
├── vite.config.ts
└── package.json
```

---

## 🗺️ Hoja de ruta (Fases)

- [x] **Fase 0 — Fundaciones** ← *actual* (este commit)
- [ ] **Fase 1 — Catálogo público** (filtros, orden, paginación)
- [ ] **Fase 2 — Ficha de producto + cotización** (WhatsApp + form)
- [ ] **Fase 3 — CMS mobile-first** (auth, CRUD, drag&drop)
- [ ] **Fase 4 — SEO/Performance/Seguridad** (Schema.org, Lighthouse >95)
- [ ] **Fase 5 — Pulido y lanzamiento**

Consulta el cronograma completo en la sección 16–17 del [Documento Técnico](./docs/DOCUMENTO_TECNICO.md).

---

## 🚢 Deploy

### Primer deploy
1. Configura `database_id` en `wrangler.jsonc` (tras crear D1).
2. Crea el bucket R2: `npx wrangler r2 bucket create eventoarte-media`.
3. Aplica migraciones: `npm run db:migrate:prod`.
4. Configura secretos.
5. Deploy:
```bash
npm run deploy
```

### Conectar con GitHub (CI/CD)
Conecta el repo en el dashboard de Cloudflare → Workers & Pages para deploy automático en cada push.

---

## 📝 Licencia

Propiedad de eventoarte.co. Código a medida para el proyecto.

Hecho con ♥ en Colombia 🇨🇴
