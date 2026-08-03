# PLAN DE IMPLEMENTACIÓN — eventoarte.co

## 0. Resumen del cambio de alcance
Transformamos el proyecto de **LUGIM (mayorista B2B corporativo)** a **eventoarte.co (recordatorios y productos personalizados para eventos familiares)**: cumpleaños infantiles, quinceaños, baby shower, bautizos, primeras comuniones, etc. Se mantiene el modelo de **catálogo sin carrito ni pagos**, enfocado 100% en generar **cotizaciones por WhatsApp + formulario**.

El entregable de esta fase NO es código: es un **documento técnico integral** (Markdown) que apruebas antes de programar.

---

## 1. Decisiones clave que asumí (valida al aprobar)

**Modelo de negocio**
- Catálogo sin carrito/checkout/cuentas de usuario (igual que antes).
- Conversión = solicitudes de cotización. CTA principal: "Cotizar por WhatsApp".
- Cantidades mínimas y precios por volumen siguen teniendo sentido (eventos = pedidos por cantidad).

**Identidad visual (dirección nueva para eventos)**
- Tono **festivo, cálido y alegre**, pero **profesional y confiable** (sigue siendo fabricación/personalización nacional).
- Dirección de paleta: **colores cálidos y vibrantes armónicos** (ej. coral/terracota + amarillo mostaza + verde sage como acento), no la sobriedad marrón/cuero de LUGIM. Fondo claro y limpio.
- Tipografía: una **display redondeada y amigable** para títulos (ej. Poppins/Quicksand/Baloo 2) + **sans neutra** para texto (ej. Inter).
- Logo: propongo concepto placeholder (marca + elemento festivo).

**Stack (decidido por optimalidad en Cloudflare)**
- **React Router v7 (Remix)** → framework full-stack. Es **Generally Available** y de **primera clase** en Cloudflare (el `@cloudflare/vite-plugin` lo soporta nativamente). SSR maduro, `loader`/`action` por ruta, el mejor ecosistema para SEO y CMS. *(TanStack Start es más nuevo pero menos maduro; Next.js en CF sigue en beta vía OpenNext.)*
- **Cloudflare Workers** (compute edge) + **D1** (SQLite relacional, ideal catálogo) + **R2** (imágenes originales) + **Cloudflare Images** (transformación/optimización automática, 5k gratis/mes).
- **Vite** + `@cloudflare/vite-plugin`, **Tailwind CSS** + **shadcn/ui** (componentes accesibles), **Drizzle ORM** (type-safe sobre D1), **Zod** (validación), **dnd-kit** (arrastrar-soltar: imágenes, destacados, categorías), **Lucide** (iconos).

**Dominio**: usaré `eventoarte.co` como dominio en todos los ejemplos de SEO/sitemap/canonical.

**Formato del entregable**: un único `DOCUMENTO_TECNICO.md` con tabla de contenidos navegable (fácil de leer y versionar en GitHub).

---

## 2. Análisis de Vélez (conclusión de la investigación ya realizada)

**Qué hace bien (a inspirar):** H1/H2 con narrativa de marca, grid visual de categorías con etiquetas en mayúsculas, tarjetas de producto con precio tachado + badges ("ÍCONO"), mega-menú por género/categoría, breadcrumb, ficha con galería de varias imágenes + descripción detallada + medidas, CTA "Comprar por WhatsApp" integrado, rich metadata VTEX (`og:type=product`), PWA, multi-país, footer completo con redes/legales/newsletter.

**Qué hacer mejor para eventoarte.co (propuesta):**
- **Home sin fricción**: productos visibles casi de inmediato (no portadas largas narrativas).
- **Categorías orientadas a *ocasión*** (cumpleaños, baby shower, quinceaños), no solo a tipo de producto.
- **Catálogo sin peso de e-commerce tradicional** (sin VTEX ni procesos pesados): ligero y rapidísimo.
- **CMS mobile-first tipo app nativa** (la administradora principal es una persona mayor que trabaja desde el celular).
- **Conversión simplificada**: un solo CTA claro (Cotizar por WhatsApp) en vez del embudo Comprar/Carrito/Checkout.

---

## 3. Estructura del DOCUMENTO_TECNICO.md que voy a redactar

1. **Resumen ejecutivo y objetivo del proyecto** (eventoarte.co).
2. **Análisis de Vélez**: puntos positivos, negativos y lecciones.
3. **Propuesta de mejora** y diferenciación.
4. **Arquitectura de información** + **Mapa del sitio** (Home → Categorías → Producto → Buscar → Cotizar → Sobre nosotros/Contacto → /admin CMS).
5. **Flujo de navegación** y wireframes conceptuales (ASCII) de Home, listado categoría, ficha producto, cotización y CMS.
6. **Design System**: paleta (con hex), tipografías, escala, espaciados, radios, sombras, estados, accesibilidad.
7. **Componentes reutilizables** (Header, Banner, CategoryGrid, ProductCard, ProductGallery, PriceTag, WhatsAppButton, QuoteForm, Footer, CMS-ProductEditor, DragList, ImageUploader, etc.).
8. **Arquitectura Frontend** (rutas, data loading, render SSR + prerender, lazy loading).
9. **Arquitectura Backend** (API interna en el mismo Worker, loaders/actions, validación).
10. **Arquitectura del CMS** (pantallas, flujo mobile-first app-like, auth por sesión, roles).
11. **Modelo de base de datos** (esquema D1/Drizzle: products, categories, images, banners, settings, quotes, users, sessions).
12. **Estrategia SEO** (URLs amigables, meta, Open Graph, Schema.org `Product`/`Organization`/`BreadcrumbList`, sitemap dinámico, robots, canonical, hreflang opcional).
13. **Estrategia de rendimiento** (objetivo PageSpeed >95, R2+Images, lazy load, caché, prerender, métricas Core Web Vitals).
14. **Estrategia de seguridad** (OWASP: auth sesión cookie httpOnly, CSRF tokens, XSS escaping, SQLi mitigado con Drizzle parametrizado, rate-limit, RBAC).
15. **Escalabilidad** (cómo añadir futuro carrito/pagos/clientes/pedidos/inventario/facturación sin rehacer).
16. **Plan de desarrollo por fases** (F0 setup → F1 catálogo público → F2 producto + cotización → F3 CMS → F4 SEO/perf/seg → F5 pulido/lanzamiento).
17. **Cronograma estimado** (por fase, en semanas).
18. **Riesgos técnicos** y mitigaciones.
19. **Recomendaciones futuras**.
20. **Justificación de cada decisión técnica y de diseño.**

Categorías iniciales que propondré para el catálogo: **Morrales y Kits para niños · Loncheras · Tulas · Cangureras · Piñatería · Recordatorios (cajas/bolsitas/etiquetas) · Cumpleaños · Baby Shower · Quinceaños · Bautizos y Primeras Comuniones**.

---

## 4. Qué entrego en esta fase (sin tocar código)
- `DOCUMENTO_TECNICO.md` completo en el directorio de trabajo (todos los puntos de la sección 3).
- Una **tabla de decisiones** final para tu validación antes de pasar a programar.

## 5. Qué viene después (fase de código, previa aprobación)
- Inicializar proyecto React Router v7 + Cloudflare.
- Esquema D1 + Drizzle.
- Catálogo público + CMS mobile-first.
- Deploy a Cloudflare vía GitHub.

---

### ¿Necesito de ti?
Solo **aprueba este plan** (o dime qué ajustar: identidad visual, categorías, modelo de venta, dominio o formato del documento). En cuanto confirmes, redacto el `DOCUMENTO_TECNICO.md` completo.