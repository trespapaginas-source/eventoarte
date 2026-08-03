# Plan: CMS de eventoarte.co

## Decisiones confirmadas
- **Auth**: Admin único vía variables de entorno (`ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH`). Sesión cookie httpOnly sobre la tabla `sessions` existente. Sin tabla users, sin roles.
- **Imágenes**: Subida a R2 desde el panel (bucket `eventoarte-media`). **Requiere activación manual del bucket en el dashboard de Cloudflare** (te daré instrucciones).
- **Módulos v1**: Productos (CRUD completo), Bandeja de cotizaciones, Categorías (CRUD), Ajustes del sitio.
- **Diseño**: Mobile-first app-like con bottom navigation en móvil / sidebar en desktop (como define el doc técnico §5.4, §7.6). Coherente con la paleta B&N + Inter + Lucide del sitio público.

---

## Fase 0 — Fundaciones (bloques compartidos)

### 0.1 Arreglar schema Drizzle (CRÍTICO)
- Añadir `relations()` faltantes en `app/lib/db/schema.ts` (products↔images, products↔category, products↔occasions). Sin esto, las queries con `with:` fallan en runtime.
- Arreglar bug `getRelatedProducts` (no excluye el producto actual) y `listProducts` (no aplica minPrice/maxPrice) en `queries.ts`.

### 0.2 Capa de escritura — `app/lib/db/mutations.ts` (NUEVO)
Funciones CRUD tipadas para todas las entidades: `createProduct`, `updateProduct`, `toggleProductActive`, `toggleProductFeatured`, `deleteProduct`, `upsertProductImage`, `reorderImages`, `deleteImage`, `createCategory`, `updateCategory`, `deleteCategory`, `reorderCategories`, `insertQuote`, `listQuotes`, `updateQuoteStatus`, `deleteQuote`, `getSetting`, `getAllSettings`, `upsertSetting`.

### 0.3 Validación — `app/lib/validation.ts` (NUEVO)
Esquemas Zod por entidad: `productSchema`, `categorySchema`, `settingsSchema`, `quoteInsertSchema`. Usados en actions para validar entrada.

### 0.4 Auth — `app/lib/auth.ts` (NUEVO)
- `hashPassword`/`verifyPassword` con Web Crypto API (PBKDF2, disponible en Workers sin librerías).
- `createSession`/`getSession`/`destroySession` sobre tabla `sessions`.
- Cookie httpOnly + Secure + SameSite=Lax, expira en 30 días.
- Helper `requireAdmin(context, request)` que lanza 401/redirect a `/admin/login` si no hay sesión válida.

### 0.5 Componentes UI base — `app/components/ui/` (NUEVOS)
Unificando los FormField duplicados de contacto/cotizar en componentes reutilizables: `FormField`, `TextInput`, `TextArea`, `Select`, `Toggle`, `Button`, `AdminShell` (layout con bottom-nav/sidebar). Reutilizan Icon.tsx y los design tokens existentes.

---

## Fase 1 — Auth y shell del CMS

### 1.1 Rutas admin (en `routes.ts`)
```
/admin/login              → login.tsx (público)
/admin                    → dashboard (protegido)
/admin/productos          → lista de productos (protegido)
/admin/productos/nuevo    → editor crear (protegido)
/admin/productos/:id      → editor editar (protegido)
/admin/categorias         → gestor categorías (protegido)
/admin/cotizaciones       → bandeja (protegido)
/admin/ajustes            → ajustes del sitio (protegido)
```

### 1.2 Login (`admin/login.tsx`)
Form email+password → action verifica contra `ADMIN_EMAIL`/`ADMIN_PASSWORD_HASH` del env → crea sesión → redirect a `/admin`. Diseño minimalista B&N.

### 1.3 AdminShell (`AdminShell.tsx`)
Layout app-like:
- **Mobile**: top bar con título + logout, **bottom navigation** fija con 5 ítems (Inicio, Productos, Cotizaciones, Categorías, Ajustes) usando iconos Lucide.
- **Desktop**: sidebar lateral fija con los mismos ítems.
- Protege rutas: cada loader admin verifica sesión vía `requireAdmin()`.

### 1.4 Dashboard (`admin/index.tsx`)
Tarjetas resumen: total productos, productos activos, cotizaciones nuevas, cotizaciones pendientes. Accesos rápidos.

---

## Fase 2 — Módulo Productos (CRUD)

### 2.1 Lista de productos (`admin/productos.tsx`)
- Buscador por nombre/código.
- Filtro por categoría y por estado (activo/inactivo).
- Tabla (desktop) / tarjetas (mobile) con: miniatura, nombre, código, categoría, precio, estado, destacado.
- Acciones rápidas: activar/desactivar (toggle), destacar, editar, eliminar (con confirmación).
- Botón "Nuevo producto".

### 2.2 Editor de producto (`admin/productos.$id.tsx` y `admin/productos.nuevo.tsx`)
Form completo mobile-first (wireframe §5.4):
- **Galería de fotos**: subir a R2 (drag para reordenar, eliminar, alt text). Vista de miniaturas.
- **Datos básicos**: nombre, slug (auto-generado), código, categoría (select), descripción corta/larga.
- **Precio**: precio, tipo (unitario/desde/por_cantidad), cantidad mínima.
- **Especificaciones**: material, colores (lista editable), medidas, peso, tiempo fabricación, personalización.
- **Visibilidad**: activo (toggle), destacado (toggle).
- **SEO**: título SEO, descripción SEO (opcional).
- Botones: Guardar, Duplicar, Eliminar.

### 2.3 Subida a R2 — `app/routes/admin.upload.tsx` (resource route)
Endpoint interno POST que recibe la imagen, la guarda en R2 (`MEDIA.put()`), devuelve la URL pública. El editor la asocia al producto.

---

## Fase 3 — Módulo Cotizaciones

### 3.1 Action de `/cotizar` (FALTANTE — el form público ya existe)
Añadir `action` a `cotizar.tsx` que inserta en tabla `quotes` vía `insertQuote()`. Redirige a página de gracias.

### 3.2 Bandeja (`admin/cotizaciones.tsx`)
- Lista de solicitudes con: nombre, teléfono (link WhatsApp), producto, fecha, estado.
- Filtros por estado (nueva/atendida/cerrada).
- Acciones: marcar como atendida, cerrada; responder por WhatsApp (link directo).
- Vaciar/eliminar cotizaciones antiguas.

---

## Fase 4 — Módulo Categorías

### 4.1 Gestor (`admin/categorias.tsx`)
- Lista de categorías con imagen, nombre, slug, # productos, estado.
- Crear/editar: nombre, slug (auto), descripción, imagen (subida R2), estado.
- Reordenar (subir/bajar con flechas — sin dnd-kit para evitar complejidad).
- Eliminar (con advertencia si tiene productos asociados).

---

## Fase 5 — Módulo Ajustes

### 5.1 Panel (`admin/ajustes.tsx`)
Edita la tabla `settings` (clave-valor):
- WhatsApp, Instagram, URL pública.
- SEO: título por defecto, descripción por defecto.
- Texto del footer.
- Guarda vía `upsertSetting()`.

---

## Fase 6 — Activar R2 + seguridad

- **R2**: Descomentar bloque `r2_buckets` en `wrangler.jsonc`, añadir `MEDIA: R2Bucket` al `CloudflareEnv`. **Requiere que actives el bucket `eventoarte-media` en el dashboard de Cloudflare** (te daré los pasos).
- **Secrets de producción**: `wrangler secret put SESSION_SECRET`, `ADMIN_PASSWORD_HASH` (generaré el hash PBKDF2).
- **CSRF**: token en forms admin (usa `CSRF_SECRET`).
- **Rate limiting** básico en `/admin/login` (anti-fuerza bruta).

---

## Archivos a crear (≈22 nuevos)
- `app/lib/db/mutations.ts`, `app/lib/validation.ts`, `app/lib/auth.ts`
- `app/components/ui/{FormField,TextInput,TextArea,Select,Toggle,Button}.tsx`
- `app/components/admin/{AdminShell,Dashboard,ProductList,ProductEditor,ImageUploader,CategoryManager,QuotesInbox,SettingsPanel}.tsx`
- `app/routes/admin/{login,index,productos,productos_.$id,categorias,cotizaciones,ajustes}.tsx`
- `app/routes/admin.upload.tsx` (resource route R2)

## Archivos a modificar (≈8)
- `app/lib/db/schema.ts` (relations), `app/lib/db/queries.ts` (bugs + nuevas queries)
- `app/routes.ts` (rutas admin), `wrangler.jsonc` (R2), `app/lib/cloudflare-context.ts` (MEDIA)
- `app/routes/cotizar.tsx` (action), `app/routes/admin/{index,login}.tsx` (de placeholder a funcional)

## Orden de ejecución
Fase 0 (fundaciones) → Fase 1 (auth+shell) → Fase 2 (productos) → Fase 3 (cotizaciones) → Fase 4 (categorías) → Fase 5 (ajustes) → Fase 6 (R2+seguridad). Cada fase termina con build+deploy+verificación.

---

## Notas
- **Sin `dnd-kit`**: el reordenamiento será con flechas subir/bajar (más simple, funciona perfecto en móvil).
- **Sin tabla users**: auth directo contra vars de entorno. Si en el futuro quieres multi-usuario, la tabla existe y se activa.
- **R2 es bloqueante para imágenes**: si no activas el bucket, el módulo de imágenes no funcionará pero todo lo demás sí (el CMS permitirá pegar URL como fallback temporal).

¿Apruebo este plan para empezar la implementación?