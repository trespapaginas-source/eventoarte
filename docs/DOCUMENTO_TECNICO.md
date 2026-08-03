# 📄 DOCUMENTO TÉCNICO — eventoarte.co

**Catálogo profesional de recordatorios y productos personalizados para eventos**

> Estado: **Borrador v1 — Pendiente de aprobación**
> Fecha: 2026-08-02
> Plataforma de despliegue: **Cloudflare** (Workers + D1 + R2 + Images)
> Stack: **React Router v7 (Remix)** + TypeScript + Tailwind + shadcn/ui
> Modelo de negocio: **Catálogo sin carrito ni pagos → Cotización por WhatsApp + formulario**

---

## 📑 Tabla de contenidos

1. [Resumen ejecutivo y objetivos](#1-resumen-ejecutivo-y-objetivos)
2. [Análisis de Vélez (benchmark)](#2-análisis-de-vélez-benchmark)
3. [Propuesta de mejora y diferenciación](#3-propuesta-de-mejora-y-diferenciación)
4. [Arquitectura de información y mapa del sitio](#4-arquitectura-de-información-y-mapa-del-sitio)
5. [Flujo de navegación y wireframes conceptuales](#5-flujo-de-navegación-y-wireframes-conceptuales)
6. [Sistema de diseño (Design System)](#6-sistema-de-diseño-design-system)
7. [Componentes reutilizables](#7-componentes-reutilizables)
8. [Arquitectura del frontend](#8-arquitectura-del-frontend)
9. [Arquitectura del backend](#9-arquitectura-del-backend)
10. [Arquitectura del CMS](#10-arquitectura-del-cms)
11. [Modelo de base de datos](#11-modelo-de-base-de-datos)
12. [Estrategia SEO](#12-estrategia-seo)
13. [Estrategia de rendimiento](#13-estrategia-de-rendimiento)
14. [Estrategia de seguridad](#14-estrategia-de-seguridad)
15. [Escalabilidad](#15-escalabilidad)
16. [Plan de desarrollo por fases](#16-plan-de-desarrollo-por-fases)
17. [Cronograma estimado](#17-cronograma-estimado)
18. [Riesgos técnicos](#18-riesgos-técnicos)
19. [Recomendaciones futuras](#19-recomendaciones-futuras)
20. [Justificación de decisiones y tabla final de validación](#20-justificación-de-decisiones-y-tabla-final-de-validación)

---

## 1. Resumen ejecutivo y objetivos

### 1.1 Qué es eventoarte.co

**eventoarte.co** es una empresa colombiana dedicada a la **fabricación y personalización de recordatorios y productos para eventos familiares**: cumpleaños infantiles, quinceaños, baby showers, bautizos, primeras comuniones, bodas y celebraciones en general. Sus productos estrella son **morrales y loncheras para niños, kits temáticos, recordatorios (cajas, bolsitas, etiquetas), piñatería y tulas/cangureras personalizadas**.

### 1.2 El modelo de negocio (no es e-commerce tradicional)

eventoarte.co **NO** será una tienda online convencional. La decisión deliberada es:

| ❌ Lo que NO habrá | ✅ Lo que SÍ habrá |
|---|---|
| Carrito de compras | Catálogo navegable y rápido |
| Pasarela de pago / checkout | **Cotización por WhatsApp** (CTA principal) |
| Cuentas de usuario / login | **Formulario de cotización** en cada ficha |
| Inventario / stock | Cantidades mínimas y precios por volumen |
| Proceso de registro | Conversión en **1–2 clics** |

> **El KPI de éxito es: cantidad de solicitudes de cotización recibidas.** Toda la UX, copy, SEO y performance se alinean a este objetivo.

### 1.3 ¿Por qué este modelo encaja con eventos?

Los pedidos para eventos **siempre requieren negociación**: cantidades variables, personalización por tema/colores, tiempos de entrega según fecha del evento, descuentos por volumen. Un checkout rígido fracasaría. El flujo *“veo el producto → lo cotizo por WhatsApp con un mensaje precargado”* reduce fricción y acelera el contacto comercial, que es donde eventoarte.co realmente cierra ventas.

### 1.4 Objetivos del proyecto

1. **Imagen profesional y confiable** que transmita: fabricación nacional, calidad, personalización, experiencia, empresa sólida.
2. **Catálogo extremadamente rápido** (objetivo PageSpeed > 95) para competir en búsquedas de Google.
3. **CMS propio mobile-first** utilizable por una persona mayor desde el celular, sin conocimientos técnicos.
4. **Arquitectura escalable** que permita, en el futuro, añadir carrito/pagos/clientes/inventario **sin rehacer el proyecto**.
5. **SEO impecable** desde el día uno (URLs amigables, Schema.org, sitemap, optimización de imágenes, lazy loading).

---

## 2. Análisis de Vélez (benchmark)

> **Aclaración importante:** este análisis es de **inspiración y benchmarking**, no de copia. Estudiamos qué hace bien velez.com.co (líder en cuero en Colombia, plataforma VTEX) para aplicar lecciones al modelo de eventoarte.co, que es un negocio distinto.

### 2.1 Qué hace bien Vélez ✅

| Aspecto | Observación | Lección para eventoarte.co |
|---|---|---|
| **Narrativa de marca** | H1/H2 emocional ("hechos a mano, uno a uno, con alma") que construye confianza de inmediato. | Tener una *brand line* cálida que conecte con la emoción de celebrar momentos. |
| **Grid de categorías visual** | Bloques grandes con imagen + etiqueta en mayúsculas, altamente escaneable. | Usar un grid de categorías con foto grande y etiqueta clara; pero **orientado a *ocasión*** (cumpleaños, baby shower…), no a género. |
| **Tarjetas de producto** | Imagen + nombre + referencia + precio (con tachado en oferta) + badges ("ÍCONO"). | Tarjeta limpia con imagen, nombre, código, precio y cantidad mínima. |
| **Mega-menú** | Navegación profunda por género → tipo → subcategoría. | Para eventoarte.co basta un menú más simple (categorías por ocasión + tipo de producto), no uno tan profundo. |
| **Ficha de producto** | Galería de varias imágenes, descripción detallada, **medidas explícitas** (alto/ancho/profundo), capacidad. | Ficha con galería + specs completos (material, colores, medidas, peso, tiempo de fabricación, personalización). |
| **CTA WhatsApp** | Integración directa de WhatsApp en la ficha. | **CTA principal** "Cotizar por WhatsApp" con mensaje precargado. |
| **Rich metadata** | `og:type=product`, Open Graph completo, plataforma VTEX con datos estructurados. | Implementar Schema.org `Product` + `Organization` + `BreadcrumbList` + Open Graph. |
| **Footer completo** | Redes, legales, newsletter, multi-país. | Footer con WhatsApp, redes, métodos de contacto, enlaces legales. |
| **PWA** | Instalable como app. | Considerar PWA ligera en el futuro (no prioritario). |

### 2.2 Qué NO encaja o hay que mejorar para eventoarte.co ⚠️

| Problema para nuestro caso | Decisión |
|---|---|
| Vélez depende de **VTEX** (plataforma e-commerce pesada, costosa, overkill para un catálogo sin pagos). | Arquitectura **ligera propia** sobre Cloudflare Workers: sin la sobrecarga de un motor de e-commerce. |
| La home obliga a *navegar narrativa* antes de ver productos. | Home con **productos visibles casi de inmediato** (banner compacto → categorías → destacados → catálogo). |
| Embudo largo (categoría → ficha → talla/color → carrito → checkout). | Embudo **corto**: ficha → 1 clic en "Cotizar por WhatsApp". |
| Mucha variedad de géneros (hombre/mujer/zapatos/chaquetas) que **no aplica** a eventoarte.co. | Categorías por **ocasión + tipo de producto** de eventos. |
| El peso de VTEX penaliza la velocidad. | SSR + prerender + edge en Cloudflare para **PageSpeed > 95**. |

### 2.3 Conclusión del benchmark

Tomamos de Vélez lo que **sirve para vender por catálogo con confianza** (jerarquía visual, ficha rica, WhatsApp, SEO), y **descartamos** lo que es ruido para un negocio de cotizaciones (carrito, checkout, VTEX, multi-género).

---

## 3. Propuesta de mejora y diferenciación

### 3.1 Diferenciadores de eventoarte.co

1. **Catálogo por ocasión, no por género.** El usuario entra pensando *"tengo un baby shower"* → aterriza directo en productos relevantes.
2. **Cotización en 1 clic.** Sin registros, sin carritos. WhatsApp abre con producto + código + cantidad mínima + URL ya cargados.
3. **Velocidad extrema.** Edge en Cloudflare + prerender + imágenes optimizadas = experiencia instantánea que Google premia.
4. **CMS app-like para el celular.** La administradora principal (persona mayor) gestiona todo el catálogo desde el teléfono como si fuera una app nativa.
5. **Transparencia de fabricación.** Tiempo de fabricación, materiales y personalización visibles en cada ficha → confianza.

### 3.2 Identidad de marca (dirección)

eventoarte.co celebra **momentos**: cumpleaños, bienvenidas, primeros años, fiestas. La marca debe sentirse **festiva, cálida y alegre, pero profesional y confiable**. Esa tensión (fiesta + seriedad comercial) es la clave del diseño.

**Atributos de marca:** Cálido · Festivo · Confiable · Hecho en Colombia · Personalizable · Para celebrar.

**Tono de voz:** Cercano, entusiasta, claro. Nunca infantil de más (los clientes son adultos organizando eventos), pero sí alegre.

> La propuesta visual concreta (paleta, tipografía, logo placeholder) se detalla en la **Sección 6**.

---

## 4. Arquitectura de información y mapa del sitio

### 4.1 Principios de la IA

- **Planitud:** máximo 2 clics desde el Home hasta cualquier producto.
- **Doble entrada:** los productos se pueden encontrar **por tipo** (morrales, loncheras) y **por ocasión** (cumpleaños, baby shower).
- **Sin cuentas:** toda acción pública termina en WhatsApp o formulario.
- **CMS aislado:** `/admin` es una zona aparte con su propio flujo.

### 4.2 Taxonomía: categorías iniciales

**Por tipo de producto:**
- Morrales y kits para niños
- Loncheras
- Tulas
- Cangureras
- Piñatería
- Recordatorios (cajas, bolsitas, etiquetas)

**Por ocasión (etiquetas/filtros transversales):**
- Cumpleaños
- Baby shower
- Quinceaños
- Bautizos y primeras comuniones
- Bodas
- Eventos empresariales (opcional)

> El CMS permitirá crear/editar/reordenar categorías y ocasiones libremente. Un producto puede pertenecer a **una categoría de tipo** y tener **varias etiquetas de ocasión**.

### 4.3 Mapa del sitio

```
eventoarte.co/
│
├── /                          → Home (banner + categorías + destacados + catálogo + formulario)
│
├── /catalogo                  → Catálogo completo (con filtros + buscador)
├── /catalogo?categoria=...    → Filtrado por categoría
├── /catalogo?ocasion=...      → Filtrado por ocasión
│
├── /categoria/:slug           → Página SEO de categoría (ej. /categoria/morrales-para-ninos)
├── /ocasion/:slug             → Página SEO de ocasión (ej. /ocasion/baby-shower)
│
├── /producto/:slug            → Ficha de producto (ej. /producto/morral-tematico-safari)
│
├── /buscar?q=                 → Resultados de búsqueda (por nombre o código)
│
├── /cotizar                   → Formulario general de cotización (no ligado a un producto)
├── /producto/:slug?cotizar=1  → Abre el formulario de cotización sobre la ficha
│
├── /sobre-nosotros            → Historia, fabricación, por qué elegir eventoarte
├── /contacto                  → Datos de contacto, WhatsApp, redes, ubicación
├── /politicas-de-envio        → Info logística (no checkout)
├── /faq                       → Preguntas frecuentes (SEO)
├── /aviso-de-privacidad       → Legal
├── /terminos-y-condiciones    → Legal
│
├── /sitemap.xml               → Sitemap dinámico
├── /robots.txt                → Robots
│
└── /admin                     → CMS (zona protegida)
     ├── /admin/login          → Inicio de sesión
     ├── /admin                → Dashboard
     ├── /admin/productos       → Lista + editar/crear/duplicar/eliminar
     ├── /admin/productos/:id  → Editor de producto (imágenes, specs, precios…)
     ├── /admin/categorias      → Categorías y ocasiones
     ├── /admin/destacados      → Reordenar productos destacados (drag & drop)
     ├── /admin/banners         → Banners del Home
     ├── /admin/cotizaciones    → Bandeja de solicitudes recibidas
     ├── /admin/contenido       → Footer, textos, imágenes del Home
     ├── /admin/ajustes          → WhatsApp, redes, SEO global, favicon, logo
     └── /admin/ajustes/seguridad → Contraseñas, roles
```

### 4.4 Profundidad de navegación (clics desde el Home)

| Destino | Clics |
|---|---|
| Cualquier categoría | 1 |
| Cualquier producto destacado | 1 |
| Cualquier producto del catálogo | 1–2 |
| Cotizar un producto | 1 (botón WhatsApp en la ficha) |
| Buscar | 1 (barra en el header) |
| Contacto / Sobre nosotros | 1 |

---

## 5. Flujo de navegación y wireframes conceptuales

### 5.1 Flujos principales

**Flujo A — Cotización por WhatsApp (camino feliz)**
```
Home → Categoría/Ocasión → Ficha de producto
                              ├─ [Cotizar por WhatsApp] → wa.me con msg precargado ✅
                              └─ [Formulario de cotización] → Guarda solicitud + confirma
```

**Flujo B — Búsqueda**
```
Header [🔍] → /buscar?q=morral → Resultados → Ficha → Cotizar
```

**Flujo C — Directo desde el Home**
```
Home → Producto destacado → Ficha → Cotizar por WhatsApp
```

**Flujo D — Cotización general (sin producto)**
```
Home/Footer → /cotizar → Formulario libre → Guarda solicitud
```

### 5.2 Wireframe — Home (desktop)

```
┌──────────────────────────────────────────────────────────────┐
│ [logo eventoarte]   Inicio  Catálogo  Ocasiones  Contacto  [🔍] │  ← Header sticky
├──────────────────────────────────────────────────────────────┤
│  [== BANNER PRINCIPAL (compacto, 1 pant) ==]                   │
│   "Recordatorios que celebran tus momentos"                    │
│   [Cotizar ahora]                                              │
├──────────────────────────────────────────────────────────────┤
│  EXPLORA POR OCASIÓN                                           │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                  │
│  │Cumpleañ│ │Baby    │ │Quinceañ│ │Bautizos│   (grid ocasión) │
│  │  os    │ │Shower  │ │  os    │ │        │                  │
│  └────────┘ └────────┘ └────────┘ └────────┘                  │
├──────────────────────────────────────────────────────────────┤
│  DESTACADOS                                                    │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                  │
│  │[img]   │ │[img]   │ │[img]   │ │[img]   │                  │
│  │Nombre  │ │Nombre  │ │Nombre  │ │Nombre  │                  │
│  │#COD01  │ │#COD02  │ │#COD03  │ │#COD04  │                  │
│  │$desde  │ │$desde  │ │$desde  │ │$desde  │                  │
│  │min 50u │ │min 25u │ │min 30u │ │min 100u│                  │
│  │Ver Cot.│ │Ver Cot.│ │Ver Cot.│ │Ver Cot.│                  │
│  └────────┘ └────────┘ └────────┘ └────────┘                  │
├──────────────────────────────────────────────────────────────┤
│  CATÁLOGO COMPLETO  [+ filtros: categoría | precio | ocasión]  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  ... (lazy)      │
│  │ card   │ │ card   │ │ card   │ │ card   │                  │
│  └────────┘ └────────┘ └────────┘ └────────┘                  │
│                   [ Ver todo el catálogo ]                     │
├──────────────────────────────────────────────────────────────┤
│  ¿ORGANIZANDO UN EVENTO? COTIZA CON NOSOTROS                   │
│  ┌────────────────────────────────┐                            │
│  │ Formulario rápido de cotización│  → envía a bandeja + mail  │
│  └────────────────────────────────┘                            │
├──────────────────────────────────────────────────────────────┤
│  Footer: WhatsApp · Instagram · Facebook · Contacto · Legal    │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 Wireframe — Ficha de producto (mobile-first)

```
┌─────────────────────┐
│ ← Volver            │
├─────────────────────┤
│                     │
│   [Galería swipe]   │
│   ● ○ ○ ○           │   ← thumbnails abajo
├─────────────────────┤
│ Morral temático     │
│ Safari              │   ← H1
│ #MAR-SAF-01         │   ← código
│                     │
│ Desde $12.000 /u    │   ← precio (tipo "desde")
│ Cantidad mín: 25 u  │
├─────────────────────┤
│ Descripción corta…  │
├─────────────────────┤
│ 📦 Material: Lona   │
│ 🎨 Colores: 6       │
│ 📏 30×25×10 cm      │
│ ⚖️ 180 g            │
│ ⏱️ Fab: 5-7 días    │
│ ✨ Personalización: │
│    Bordado nombre   │
├─────────────────────┤
│ [💬 Cotizar x WhatsApp] │ ← CTA principal, sticky
│ [📝 Formulario]         │ ← secundario
├─────────────────────┤
│ PRODUCTOS RELACIONADOS│
│ [card] [card] [card] │
└─────────────────────┘
```

### 5.4 Wireframe — CMS Editor de producto (mobile app-like)

```
┌─────────────────────┐
│ ←  Editar producto  │   ← top bar tipo app
│            [Guardar] │
├─────────────────────┤
│ FOTOS               │
│ [+ Foto] [img][img] │   ← subir + arrastrar
│  (mantén y arrastra)│      para reordenar
├─────────────────────┤
│ Nombre              │
│ [_______________]   │
│ Código              │
│ [_______________]   │
│ Categoría   [▼]     │
│ Ocasion  [+etiquetas│
├─────────────────────┤
│ Precio   [12.000]   │
│ Tipo [▼ desde]      │
│ Cant. mín [25]      │
├─────────────────────┤
│ Descripción         │
│ [ multilinea      ] │
├─────────────────────┤
│ Material [Lona]     │
│ Colores  [+]        │
│ Medidas [30x25x10]  │
│ Peso [180g]         │
│ Tiempo fab [5-7d]   │
│ Personaliz. [Bordado]│
├─────────────────────┤
│ Activo      [ON]    │
│ Destacado   [OFF]   │
├─────────────────────┤
│ [Duplicar] [Eliminar]│
└─────────────────────┘
```

---

## 6. Sistema de diseño (Design System)

### 6.1 Dirección visual

**Festivo + confiable.** Colores cálidos y vibrantes armónicos (no neón), tipografía redondeada y amigable para títulos, neutra para texto, mucho espacio en blanco, fotos protagonistas.

### 6.2 Paleta de colores

| Token | HEX | Uso |
|---|---|---|
| `--brand-coral` | `#E8645A` | Color primario / CTAs principales (WhatsApp usa su propio verde) |
| `--brand-coral-dark` | `#D14E45` | Hover de primario |
| `--brand-mustard` | `#F2B544` | Acento festivo, badges, destacados |
| `--brand-sage` | `#7FA88C` | Acento secundario, etiquetas de ocasión |
| `--brand-cream` | `#FFF8F0` | Fondos suaves, secciones alternas |
| `--brand-ink` | `#2B2522` | Texto principal (casi negro cálido) |
| `--brand-ink-soft` | `#6B6056` | Texto secundario |
| `--whatsapp` | `#25D366` | Botón WhatsApp (marca oficial) |
| `--whatsapp-dark` | `#1FB855` | Hover WhatsApp |
| `--surface` | `#FFFFFF` | Tarjetas, fondo base |
| `--border` | `#EFE7DC` | Bordes sutiles |
| `--success` | `#2E8B57` | Estados de éxito |
| `--error` | `#C0392B` | Errores / validación |
| `--warning` | `#E67E22` | Avisos |

> **Contraste:** todas las combinaciones texto/fondo cumplen **WCAG AA** (≥ 4.5:1 en texto normal, ≥ 3:1 en grande). Se valida en la Sección 14 (accesibilidad).

### 6.3 Tipografía

| Rol | Familia | Pesos | Uso |
|---|---|---|---|
| **Display / Títulos** | **Baloo 2** (o Poppins) | 600–800 | H1, H2, nombres de producto, títulos de sección. Redondeada, cálida, festiva. |
| **Cuerpo** | **Inter** | 400–600 | Texto, descripciones, UI. Neutra y muy legible. |
| **Monoespaciada** | **JetBrains Mono** | 500 | Códigos de producto (#MAR-SAF-01), datos técnicos. |

Cargadas vía **Google Fonts** con `font-display: swap` y `preload` de la display. Se autohospedan (subset) en producción para privacidad y velocidad.

### 6.4 Escala tipográfica (fluida, clamp)

| Token | Mobile | Desktop | Uso |
|---|---|---|---|
| `--text-display` | `clamp(2rem, 6vw, 3.5rem)` | | Hero |
| `--text-h1` | `clamp(1.75rem, 4vw, 2.5rem)` | | Título de página |
| `--text-h2` | `clamp(1.4rem, 3vw, 2rem)` | | Sección |
| `--text-h3` | `1.25rem` | | Subtítulo / ficha |
| `--text-body` | `1rem` | | Texto base |
| `--text-small` | `0.875rem` | | Meta, código |
| `--text-caption` | `0.75rem` | | Badges, pies |

### 6.5 Espaciado, radios y sombras

**Espaciado (escala 4px):** `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`

**Radios:**
- `--radius-sm`: 8px (botones pequeños, chips)
- `--radius-md`: 14px (tarjetas, inputs)
- `--radius-lg`: 22px (cards grandes, banner)
- `--radius-pill`: 9999px (badges, botones flotantes)

**Sombras (suaves, cálidas):**
- `--shadow-sm`: `0 1px 2px rgba(43,37,34,0.06)`
- `--shadow-md`: `0 4px 16px rgba(43,37,34,0.08)`
- `--shadow-lg`: `0 12px 40px rgba(43,37,34,0.12)`

### 6.6 Componentes de marca

- **Botones:** primario (coral sólido), secundario (outline tinta), WhatsApp (verde oficial), fantasma (solo texto).
- **Tarjetas:** fondo blanco, radius lg, sombra sm→md en hover, imagen con ratio 4:3.
- **Badges:** pill, mostaza para "Destacado", sage para ocasión, coral para "Nuevo".
- **Iconografía:** **Lucide** (lineal, 1.5–2px stroke), coherente en toda la UI.

### 6.7 Imagen y fotografía

- Fotos de producto sobre fondo limpio, buena iluminación.
- Ratio estandarizado **4:3** para tarjetas, **1:1** para galería.
- Optimización automática vía **Cloudflare Images** (AVIF/WebP, responsive `width=auto`).

---

## 7. Componentes reutilizables

Catálogo de componentes base (todos accesibles y con estados vacío/carga/error):

### 7.1 Layout y navegación
| Componente | Responsabilidad |
|---|---|
| `<SiteHeader />` | Logo, nav principal, buscador, CTA WhatsApp. Sticky, colapsable en mobile. |
| `<SiteNav />` | Menú categorías + ocasiones. Mobile: drawer. |
| `<SearchBar />` | Buscador por nombre/código con autocompletado. |
| `<SiteFooter />` | WhatsApp, redes, enlaces legales, contacto. Editable desde CMS. |
| `<Breadcrumb />` | Migas con Schema.org `BreadcrumbList`. |

### 7.2 Home y marketing
| Componente | Responsabilidad |
|---|---|
| `<HeroBanner />` | Banner principal compacto. Contenido editable desde CMS. |
| `<OccasionGrid />` | Grid de ocasiones (cumpleaños, baby shower…). |
| `<CategoryGrid />` | Grid de categorías por tipo de producto. |
| `<FeaturedCarousel />` | Productos destacados (reordenables por drag en CMS). |
| `<QuoteTeaser />` | Bloque CTA "¿Organizando un evento?". |

### 7.3 Catálogo
| Componente | Responsabilidad |
|---|---|
| `<ProductCard />` | Imagen, nombre, código, precio, cantidad mín, botones Ver/Cotizar. |
| `<PriceTag />` | Precio con tipo (`unitario` / `desde` / `por cantidad`). |
| `<ProductGrid />` | Grid responsive con lazy loading. |
| `<FilterBar />` | Filtros: categoría, precio (slider), ocasión. Solo esos. |
| `<SortSelect />` | Orden: destacados, precio asc/desc, nombre. |
| `<EmptyState />` | Estado sin resultados. |
| `<Pagination />` | Paginación o "cargar más" con prefetch. |

### 7.4 Ficha de producto
| Componente | Responsabilidad |
|---|---|
| `<ProductGallery />` | Galería con thumbnails, swipe mobile, zoom ligero. |
| `<SpecList />` | Lista de atributos (material, medidas, peso, etc.). |
| `<WhatsAppButton />` | Genera `wa.me` con mensaje precargado (producto, código, mín, URL). |
| `<QuoteForm />` | Formulario de cotización (cantidad, fecha evento, tema, datos). |
| `<RelatedProducts />` | Productos relacionados por categoría/ocasión. |

### 7.5 Cotización y formularios
| Componente | Responsabilidad |
|---|---|
| `<QuoteModal />` | Modal con el formulario, reutilizable. |
| `<FormField />` | Input accesible con label, error, ayuda. |
| `<SuccessToast />` | Confirmación tras enviar cotización. |

### 7.6 CMS (zona `/admin`)
| Componente | Responsabilidad |
|---|---|
| `<AdminShell />` | Layout app-like: bottom nav en mobile, sidebar en desktop. |
| `<Dashboard />` | KPIs: cotizaciones nuevas, productos activos, etc. |
| `<ProductEditor />` | Formulario completo de producto (Sección 5.4). |
| `<ImageUploader />` | Subida múltiple a R2, preview, borrado. |
| `<DragOrderList />` | Lista arrastrable (dnd-kit) para imágenes, destacados, categorías. |
| `<CategoryManager />` | CRUD + orden de categorías/ocasiones. |
| `<BannerEditor />` | Editar banners (imagen, textos, enlace). |
| `<QuotesInbox />` | Bandeja de solicitudes de cotización. |
| `<SettingsPanel />` | WhatsApp, redes, SEO global, favicon, logo. |

---

## 8. Arquitectura del frontend

### 8.1 Framework y rendering

**React Router v7 (Remix)** sobre **Cloudflare Workers** con el **`@cloudflare/vite-plugin`**.

**Estrategia de render híbrida por ruta:**

| Ruta | Render | Por qué |
|---|---|---|
| `/` (Home) | **SSR + caché edge** | Contenido dinámico (destacados, banners del CMS) pero estable; se cachea en el edge. |
| `/producto/:slug` | **SSR** | Necesita datos frescos + SEO; se prerenderiza en build para los productos más visitados. |
| `/categoria/:slug`, `/ocasion/:slug` | **SSR + caché** | SEO fuerte, contenido semi-estable. |
| `/catalogo`, `/buscar` | **SSR** | Filtros dinámicos por query string. |
| `/cotizar`, `/contacto`, estáticas | **Prerender** | HTML estático servido como asset (rapidísimo). |
| `/admin/*` | **SPA** (client-only) | App privada, no indexable, sin SSR necesario. |

### 8.2 Carga de datos (loaders/actions)

React Router v7 usa `loader` (GET) y `action` (POST) por ruta, ejecutándose en el Worker:

```ts
// app/routes/producto.$slug.tsx (esquema)
export async function loader({ params, context }) {
  const product = await context.db.query.products.findFirst({
    where: and(eq(products.slug, params.slug), eq(products.active, true)),
    with: { images: true, category: true, occasions: true },
  });
  if (!product) throw new Response("No encontrado", { status: 404 });
  const related = await getRelatedProducts(context.db, product);
  return { product, related };
}
```

- Los datos se sirven desde **D1** vía **Drizzle ORM** (queries parametrizadas → anti-SQLi).
- Respuestas de catálogo cacheadas con **`Cache-Control` + Cache API** del Worker.

### 8.3 Estructura de carpetas

```
app/
├── routes/                # Rutas (file-based routing)
│   ├── _index.tsx         # Home
│   ├── catalogo.tsx
│   ├── categoria.$slug.tsx
│   ├── ocasion.$slug.tsx
│   ├── producto.$slug.tsx
│   ├── buscar.tsx
│   ├── cotizar.tsx
│   ├── sobre-nosotros.tsx
│   ├── contacto.tsx
│   ├── sitemap[.]xml.ts   # Resource route
│   ├── robots[.]txt.ts
│   └── admin+/           # Rutas del CMS (SPA)
├── components/            # Componentes (Sección 7)
│   ├── layout/
│   ├── catalog/
│   ├── product/
│   ├── cms/
│   └── ui/                # shadcn/ui base
├── lib/
│   ├── db/                # Drizzle schema + queries
│   ├── whatsapp.ts        # Generador de wa.me
│   ├── seo.ts             # Meta, OG, Schema.org
│   ├── auth.ts            # Sesiones CMS
│   └── validation.ts      # Esquemas Zod
├── styles/
└── root.tsx               # <html>, fuentes, meta global
```

### 8.4 Estilos

- **Tailwind CSS** con config de design tokens de la Sección 6.
- **shadcn/ui** para primitivos accesibles (Dialog, Dropdown, Sheet, Toast).
- Sin CSS pesado adicional; todo utility-first + componentes.

### 8.5 Imágenes

- Originales en **R2**.
- Servidas vía **Cloudflare Images** con `width=auto`, formato **AVIF/WebP** automático.
- `<img>` con `loading="lazy"`, `decoding="async"`, `srcset` responsive y `width`/`height` para evitar CLS.

### 8.6 Estado y formularios

- Estado de UI con **state local + URL** (filtros y orden viven en la URL para compartir/SEO).
- Formularios con `action` de React Router + **Zod** para validación server-side y feedback de errores accesible.

---

## 9. Arquitectura del backend

### 9.1 Todo en un Worker (full-stack en el edge)

No hay servidor separado: el **mismo Worker** hace SSR, sirve la API interna del CMS y los resource routes (`/sitemap.xml`, `/robots.txt`). Esto reduce latencia, costos y complejidad.

### 9.2 Bindings de Cloudflare

```jsonc
// wrangler.jsonc (resumen)
{
  "name": "eventoarte",
  "main": "build/server/index.js",
  "compatibility_date": "2026-08-01",
  "compatibility_flags": ["nodejs_compat"],
  "assets": { "directory": "build/client" },
  "d1_databases": [{ "binding": "DB", "database_name": "eventoarte-db" }],
  "r2_buckets":   [{ "binding": "MEDIA", "bucket_name": "eventoarte-media" }],
  "vars": { "WA_NUMBER": "...", "PUBLIC_URL": "https://eventoarte.co" },
  "observability": { "enabled": true }
}
```

| Binding | Uso |
|---|---|
| `DB` (D1) | Catálogo, categorías, imágenes, banners, cotizaciones, usuarios, sesiones. |
| `MEDIA` (R2) | Imágenes originales subidas desde el CMS. |
| `IMAGES` (Cloudflare Images) | Transformación/optimización al servir. |
| `vars` | Número de WhatsApp, URL pública, flags. |

### 9.3 Capa de datos

**Drizzle ORM** sobre D1 con queries tipadas:

```ts
// app/lib/db/queries.ts (ejemplo)
export async function searchProducts(db: D1Database, q: string) {
  return db.query.products.findMany({
    where: and(
      eq(products.active, true),
      or(like(products.name, `%${q}%`), like(products.code, `%${q}%`))
    ),
    limit: 24,
  });
}
```

### 9.4 API interna del CMS

Acciones RESTful internas (solo accesibles autenticadas) para CRUD de productos, categorías, banners, imágenes, cotizaciones y ajustes. Todas validadas con **Zod** y protegidas con **sesión + CSRF**.

### 9.5 Generador de WhatsApp

```ts
// app/lib/whatsapp.ts
export function buildWhatsAppLink(product, settings) {
  const msg = `¡Hola eventoarte! 👋 Quiero cotizar:%0A` +
    `🛍️ ${product.name}%0A` +
    `🔖 Código: ${product.code}%0A` +
    `📦 Cantidad mínima: ${product.minQty} u%0A` +
    `🔗 https://eventoarte.co/producto/${product.slug}`;
  return `https://wa.me/${settings.waNumber}?text=${msg}`;
}
```

---

## 10. Arquitectura del CMS

### 10.1 Principios

- **Mobile-first absoluto.** Diseñado como **app nativa** (bottom navigation, sheets, acciones grandes).
- **Cero jerga.** Lenguaje claro, íconos grandes, feedback inmediato.
- **Tolerante a errores.** Autosave de borradores, confirmaciones antes de eliminar, deshacer.
- **Accesible para persona mayor:** tipografía base grande, contraste alto, botones grandes (mín. 48px touch target).

### 10.2 Roles

| Rol | Permisos |
|---|---|
| **Administrador** (1, la persona mayor) | Todo: productos, categorías, banners, contenido, ajustes, seguridad. |
| *(Futuro)* Editor | Solo productos y cotizaciones. |

> Aunque ahora hay un solo rol, el modelo de datos y la auth se diseñan multi-rol desde el inicio para no rehacer (Sección 15).

### 10.3 Pantallas del CMS

1. **Login** — PIN o correo+contraseña. Sesión con cookie httpOnly.
2. **Dashboard** — Tarjetas grandes: "Cotizaciones nuevas (3)", "Productos activos (48)", botón "+ Nuevo producto".
3. **Productos** — Lista tipo app con foto, buscador y filtros. Acciones: editar, duplicar, activar/desactivar, eliminar (con confirmación).
4. **Editor de producto** — Formulario por secciones plegables (Sección 5.4): fotos (drag&drop), datos básicos, precio, specs, personalización, visibilidad.
5. **Destacados** — Lista arrastrable (drag&drop) para ordenar el carrusel del Home.
6. **Categorías y ocasiones** — CRUD + reordenar arrastrando.
7. **Banners** — Editar imagen, título, subtítulo, CTA, enlace.
8. **Cotizaciones** — Bandeja con las solicitudes recibidas, marcar como atendida.
9. **Contenido del Home/Footer** — Textos, imágenes, redes, WhatsApp.
10. **Ajustes** — SEO global (title, description), favicon, logo, datos de la empresa.
11. **Seguridad** — Cambiar contraseña, cerrar sesiones.

### 10.4 UX móvil del CMS

- **Bottom navigation:** Productos · Destacados · Cotizaciones · Ajustes.
- **FAB "+":** acceso rápido a "Nuevo producto".
- **Sheets/modales** para ediciones rápidas, en lugar de pantallas nuevas.
- **Drag & drop** con `dnd-kit` (funciona con toque: mantén pulsado para arrastrar).
- **Subida de fotos desde la galería o cámara** del celular.
- **Feedback háptico/visual** al guardar.

### 10.5 Funcionalidades CMS solicitadas (cobertura)

Todas las funciones del prompt están contempladas: CRUD productos, duplicar, múltiples imágenes + reordenar, edición de descripción/materiales/precios/tipo de precio/tiempo de fabricación/peso/medidas/cantidad mínima/personalización, activar/desactivar, destacar + ordenar arrastrando, CRUD categorías + orden, banners, imágenes Home, footer, WhatsApp, redes, SEO, titles, metadatos, favicon, logo — **todo sin conocimientos técnicos**.

---

## 11. Modelo de base de datos

D1 (SQLite) con **Drizzle ORM**. Esquema relacional normalizado y preparado para escalar.

### 11.1 Tablas principales

```sql
-- Categorías (por tipo de producto)
categories (
  id            INTEGER PK,
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  description   TEXT,
  image_key     TEXT,           -- referencia a R2
  sort_order    INTEGER DEFAULT 0,
  active        INTEGER DEFAULT 1,
  seo_title     TEXT,
  seo_desc      TEXT,
  created_at    INTEGER,
  updated_at    INTEGER
)

-- Ocasiones (cumpleaños, baby shower...)
occasions (
  id            INTEGER PK,
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  icon          TEXT,
  sort_order    INTEGER DEFAULT 0,
  active        INTEGER DEFAULT 1
)

-- Productos
products (
  id            INTEGER PK,
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  code          TEXT UNIQUE NOT NULL,      -- ej. MAR-SAF-01
  category_id   INTEGER REFERENCES categories(id),
  short_desc    TEXT,
  long_desc     TEXT,
  -- precio
  price         REAL NOT NULL,
  price_type    TEXT DEFAULT 'desde',      -- 'unitario' | 'desde' | 'por_cantidad'
  min_qty       INTEGER DEFAULT 1,
  -- specs
  material      TEXT,
  colors        TEXT,                       -- JSON: ["Rojo","Azul"]
  dimensions    TEXT,                       -- "30x25x10 cm"
  weight        TEXT,                       -- "180 g"
  lead_time     TEXT,                       -- "5-7 días"
  customization TEXT,                       -- "Bordado de nombre"
  -- estado
  active        INTEGER DEFAULT 1,
  featured      INTEGER DEFAULT 0,
  featured_order INTEGER DEFAULT 0,
  -- seo
  seo_title     TEXT,
  seo_desc      TEXT,
  og_image_key  TEXT,
  created_at    INTEGER,
  updated_at    INTEGER
)

-- Relación producto ↔ ocasión (muchos a muchos)
product_occasions (
  product_id    INTEGER REFERENCES products(id),
  occasion_id   INTEGER REFERENCES occasions(id),
  PRIMARY KEY (product_id, occasion_id)
)

-- Imágenes de producto (ordenadas)
product_images (
  id            INTEGER PK,
  product_id    INTEGER REFERENCES products(id),
  r2_key        TEXT NOT NULL,
  alt_text      TEXT,
  sort_order    INTEGER DEFAULT 0
)

-- Banners del Home
banners (
  id            INTEGER PK,
  title         TEXT,
  subtitle      TEXT,
  cta_text      TEXT,
  cta_link      TEXT,
  image_key     TEXT,
  sort_order    INTEGER DEFAULT 0,
  active        INTEGER DEFAULT 1
)

-- Solicitudes de cotización
quotes (
  id            INTEGER PK,
  product_id    INTEGER REFERENCES products(id),  -- nullable (cotización general)
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT,
  quantity      INTEGER,
  event_date    TEXT,
  occasion      TEXT,
  message       TEXT,
  source        TEXT,                          -- 'whatsapp' | 'form'
  status        TEXT DEFAULT 'nueva',          -- 'nueva'|'atendida'|'cerrada'
  created_at    INTEGER
)

-- Contenido global (footer, textos, redes, WhatsApp, SEO global)
settings (
  key           TEXT PK,
  value         TEXT                           -- JSON según el key
)
-- Ejemplos de keys: 'site.whatsapp', 'site.instagram', 'footer.text',
-- 'seo.default_title', 'seo.default_desc', 'branding.logo_key', 'branding.favicon_key'

-- Usuarios del CMS
users (
  id            INTEGER PK,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,                 -- argon2/scrypt
  role          TEXT DEFAULT 'admin',
  active        INTEGER DEFAULT 1,
  created_at    INTEGER
)

-- Sesiones (cookie httpOnly referencia este id)
sessions (
  id            TEXT PK,                       -- token aleatorio
  user_id       INTEGER REFERENCES users(id),
  expires_at    INTEGER,
  created_at    INTEGER
)
```

### 11.2 Índices recomendados

```sql
CREATE INDEX idx_products_slug       ON products(slug);
CREATE INDEX idx_products_code       ON products(code);
CREATE INDEX idx_products_category   ON products(category_id);
CREATE INDEX idx_products_featured   ON products(featured, active);
CREATE INDEX idx_images_product      ON product_images(product_id, sort_order);
CREATE INDEX idx_po_occasion         ON product_occasions(occasion_id);
CREATE INDEX idx_quotes_status       ON quotes(status, created_at);
CREATE INDEX idx_categories_sort     ON categories(sort_order);
```

### 11.3 Migraciones

Gestionadas con **Drizzle Kit** (`drizzle-kit generate` / `migrate`), versionadas en el repo y aplicadas en deploy.

---

## 12. Estrategia SEO

Objetivo: **posicionar eventoarte.co** en búsquedas locales de recordatorios y productos para eventos en Colombia ("recordatorios baby shower", "morrales para cumpleaños", "loncheras personalizadas", etc.).

### 12.1 URLs amigables

- Slugs legibles: `/producto/morral-tematico-safari`, `/categoria/loncheras-personalizadas`, `/ocasion/baby-shower`.
- Minúsculas, sin acentos ni caracteres especiales, con guiones.
- Redirecciones 301 gestionadas si un slug cambia (tabla de redirecciones).

### 12.2 Metadatos por página

- **`<title>`** único por página (≤60 chars), con palabra clave + marca.
- **`meta description`** persuasiva (≤155 chars).
- Edición manual desde el CMS por producto/categoría, con **valores por defecto** inteligentes.

### 12.3 Open Graph y Twitter Cards

- `og:title`, `og:description`, `og:image` (imagen optimizada), `og:url`, `og:type` (`product` en fichas, `website` en resto).
- `twitter:card=summary_large_image`.

### 12.4 Datos estructurados (Schema.org)

JSON-LD inyectado según la página:

```jsonld
// Ficha de producto
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Morral temático Safari",
  "sku": "MAR-SAF-01",
  "image": ["https://eventoarte.co/cdn-cgi/image/.../safari.jpg"],
  "description": "...",
  "brand": { "@type": "Brand", "name": "eventoarte.co" },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "COP",
    "price": "12000",
    "availability": "https://schema.org/PreOrder",
    "url": "https://eventoarte.co/producto/morral-tematico-safari"
  }
}
```

También: `Organization` (global), `WebSite` + `SearchAction`, `BreadcrumbList` por página, `FAQPage` en `/faq`.

### 12.5 Sitemap dinámico

- Resource route `/sitemap.xml` que consulta D1 y genera el XML con todas las URLs activas (productos, categorías, ocasiones, páginas estáticas), `lastmod`, `changefreq` y `priority`.
- Se regenera al guardar cambios en el CMS (invalidación de caché).

### 12.6 Robots.txt

```
User-agent: *
Allow: /
Disallow: /admin
Sitemap: https://eventoarte.co/sitemap.xml
```

### 12.7 Canonical

- `<link rel="canonical">` en todas las páginas para evitar contenido duplicado (ej. variantes de filtros).

### 12.8 Optimización de imágenes (SEO + performance)

- **Cloudflare Images:** conversión a AVIF/WebP, resize responsive (`width=auto`), lazy loading.
- `alt` descriptivo en cada imagen (editables desde el CMS).
- LCP: imagen principal del hero y primera imagen de tarjeta con `fetchpriority="high"`.

### 12.9 SEO técnico adicional

- HTML semántico (`<main>`, `<article>`, `<nav>`, `<header>`, `<footer>`).
- Un solo `<h1>` por página.
- `hreflang` opcional si en el futuro se añade multi-país.
- Core Web Vitals en verde (Sección 13).
- Consola Google Search Console + Bing Webmaster conectadas.

---

## 13. Estrategia de rendimiento

**Objetivo: PageSpeed > 95 en Mobile y Desktop.**

### 13.1 Arquitectura de rendimiento

| Palanca | Implementación |
|---|---|
| **Edge compute** | Cloudflare Workers: SSR a <50ms desde Colombia. |
| **Prerender** | Páginas estáticas (`/cotizar`, legales) servidas como HTML precompilado. |
| **Caché edge** | `Cache-Control` + Cache API en rutas de catálogo/categoría. |
| **Imágenes** | R2 + Cloudflare Images (AVIF/WebP, responsive). |
| **Lazy loading** | Imágenes fuera de viewport con `loading="lazy"`. |
| **Fonts** | Autohospedadas, `font-display: swap`, `preload` display. |
| **JS mínimo** | Code-splitting por ruta; `/admin` aislado del bundle público. |
| **CSS** | Tailwind purgado, crítico inline. |
| **Prefetch** | Enlaces visibles con `prefetch` al hover/intento de click. |

### 13.2 Core Web Vitals — metas

| Métrica | Meta | Estrategia |
|---|---|---|
| **LCP** | < 2.0s | Hero optimizado, `fetchpriority=high`, SSR edge. |
| **CLS** | < 0.05 | `width/height` en todas las imágenes y reservas de espacio. |
| **INP** | < 200ms | JS mínimo, interacciones optimizadas. |

### 13.3 Monitoreo

- **Cloudflare Observability** + Web Analytics (sin cookies, gratis).
- **Real User Monitoring** vía `web-vitals` reportando a un endpoint interno.
- Lighthouse CI en PRs (GitHub Actions).

### 13.4 Componentes y arquitectura

- Componentes **reutilizables** (Sección 7) → menos código, mejor mantenimiento.
- Arquitectura **escalable** por capas (routes → lib → db).

---

## 14. Estrategia de seguridad

Aplicamos **OWASP Top 10** adaptado a un Worker + D1 sin checkout.

### 14.1 Autenticación y sesiones (CMS)

- Login con **correo + contraseña fuerte** (o PIN de 6 dígitos como opción accesible).
- Contraseñas hasheadas con **scrypt/argon2** (nunca en texto plano).
- Sesión con **cookie `httpOnly`, `Secure`, `SameSite=Lax`** referenciando un token aleatorio en la tabla `sessions`.
- **Expiración** y renovación; cierre de sesión revoca el token.
- **Rate limiting** en `/admin/login` (bloqueo tras N intentos).

### 14.2 Protección CSRF

- **Tokens CSRF** por sesión en todos los `POST` del CMS (doble submit cookie + header).

### 14.3 Protección XSS

- React escapa el contenido por defecto.
- **CSP (Content-Security-Policy)** estricta: sin `unsafe-inline`, nonces para estilos/scripts necesarios.
- Cabeceras: `X-Content-Type-Options`, `X-Frame-Options` o `frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`.

### 14.4 Protección SQL Injection

- **Drizzle ORM** usa **queries parametrizadas** siempre; cero concatenación de SQL.
- Validación de inputs con **Zod** antes de tocar la base.

### 14.5 Otros

- **Rate limiting** en formulario de cotización (anti-spam) + **honeypot** + **Turnstile** de Cloudflare (anti-bot sin CAPTCHA molesto).
- Subida de imágenes: validación de **tipo MIME + extensión + tamaño**, almacenamiento en R2 (no ejecutable).
- `/admin` bloqueado en `robots.txt` y con `noindex`.
- Secretos en **Cloudflare secrets** (nunca en el repo).
- Backups de D1 automatizados.
- HTTPS forzado por Cloudflare.

### 14.6 Accesibilidad (WCAG 2.1 AA)

- Contraste de color validado (Sección 6.2).
- Navegable por teclado, foco visible.
- `alt` en imágenes, labels en formularios, ARIA donde aplica.
- Tipografía base legible (≥16px), soporte para `prefers-reduced-motion`.

---

## 15. Escalabilidad

La arquitectura se diseña **modular** para añadir futuras capacidades **sin rehacer**:

### 15.1 Módulos futuros previstos

| Módulo futuro | Cómo se incorpora sin rehacer |
|---|---|
| **Carrito + Checkout** | Nuevas tablas `carts`, `orders`, `order_items`. La ficha de producto y el CMS ya exponen precio/cantidad. Se añade un paso, no se reestructura. |
| **Pagos** | Integración con Wompi/Stripe como pasarela en una nueva `action`; no afecta al catálogo. |
| **Cuentas de cliente** | Nuevas tablas `customers`, `customer_sessions`; las cotizaciones ya guardan `email/teléfono`. |
| **Pedidos / estados** | Tabla `orders` con flujo de estados; el CMS ya tiene patrón de bandeja (`quotes`). |
| **Inventario/stock** | Campo `stock` en `products` + lógica de disponibilidad. Hoy simplemente se omite. |
| **Facturación** | Integración con sistema contable colombiano vía API; tablas `invoices`. |
| **Multiusuario + roles** | `users.role` ya existe; basta añadir permisos por rol. |
| **Multi-país/idioma** | Internacionalización de rutas + `hreflang`. |

### 15.2 Principios de escalabilidad técnica

- **Cloudflare Workers** escala automáticamente (serverless).
- **D1** soporta lectura replicada; para más escritura se puede fragmentar o pasar a **Hyperdrive** si en el futuro se migra a Postgres.
- **R2** escala en almacenamiento sin egress.
- **Código desacoplado**: la capa `lib/` aísla lógica de rutas y UI → cambios localizados.

---

## 16. Plan de desarrollo por fases

El desarrollo se estructura en **6 fases secuenciales**, cada una entregando valor funcional verificable.

### Fase 0 — Fundaciones (setup)
- Crear repo en GitHub y proyecto en Cloudflare.
- Inicializar **React Router v7 + `@cloudflare/vite-plugin`**.
- Configurar **Tailwind + shadcn/ui + design tokens** (Sección 6).
- Crear D1, bucket R2, habilitar Cloudflare Images.
- Esquema **Drizzle** completo (Sección 11) + migración inicial.
- CI básico (lint + build).

**Entregable:** proyecto desplegado en un subdominio de preview, con "hello world" renderizado desde D1.

### Fase 1 — Catálogo público
- Layout público (Header, Footer, nav, buscador).
- Home (banner, grids de categoría/ocasión, destacados, catálogo).
- Rutas `/catalogo`, `/categoria/:slug`, `/ocasion/:slug` con filtros y orden.
- `<ProductCard />`, `<FilterBar />`, lazy loading.
- Datos seed (categorías, ocasiones, ~10 productos de ejemplo).

**Entregable:** sitio navegable y rápido con productos reales de muestra.

### Fase 2 — Ficha de producto + cotización
- `/producto/:slug` con galería, specs, precio, personalización.
- `<WhatsAppButton />` con mensaje precargado.
- `<QuoteForm />` (modal + página `/cotizar`).
- Tabla `quotes` y guardado de solicitudes.
- Productos relacionados.

**Entregable:** flujo completo de cotización funcionando de punta a punta.

### Fase 3 — CMS mobile-first
- Auth (`/admin/login`, sesiones, CSRF).
- Dashboard + bottom navigation.
- CRUD productos con `<ImageUploader />` (R2) y `<DragOrderList />`.
- Destacados con drag&drop.
- Categorías/ocasiones, banners, contenido, ajustes, cotizaciones.
- Seguridad (rate limit, CSP, noindex).

**Entregable:** la administradora puede gestionar todo el catálogo desde el celular.

### Fase 4 — SEO, performance y seguridad (hardening)
- Meta dinámica, Open Graph, Schema.org, canonical.
- `/sitemap.xml` y `/robots.txt` dinámicos.
- Optimización de imágenes end-to-end (LCP).
- Core Web Vitals en verde, Lighthouse >95.
- CSP estricta, cabeceras, Turnstile en formularios.
- Páginas legales y `/faq`.

**Entregable:** sitio indexable, rápido y seguro, listo para producción.

### Fase 5 — Pulido y lanzamiento
- QA cross-browser y responsive (mobile/tablet/desktop).
- Ajustes de copy y microcopy.
- Conexión con Google Search Console / Analytics.
- Migración a dominio definitivo `eventoarte.co`.
- Lanzamiento + capacitación de la administradora (guía rápida ilustrada).

**Entregable:** sitio en producción en `eventoarte.co`.

---

## 17. Cronograma estimado

> Estimaciones orientativas para un desarrollo enfocado. Asumen contenido (fotos, textos) por parte del cliente a tiempo.

| Fase | Duración | Hitos |
|---|---|---|
| **F0** Fundaciones | 1 semana | Repo + infra + schema |
| **F1** Catálogo público | 2 semanas | Home + listados + filtros |
| **F2** Ficha + cotización | 1.5 semanas | Ficha + WhatsApp + form |
| **F3** CMS | 2.5 semanas | CRUD completo mobile-first |
| **F4** SEO/perf/seg | 1.5 semanas | >95 PageSpeed, SEO completo |
| **F5** Pulido/lanzamiento | 1 semana | QA, dominio, capacitación |
| **Total** | **≈ 9–10 semanas** | Producción |

---

## 18. Riesgos técnicos

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| La administradora no se siente cómoda con el CMS | Media | Alto | Mobile-first extremo, capacitación ilustrada, soporte inicial, iteración según feedback. |
| Contenido (fotos/textos) se retrasa | Alta | Medio | Datos seed de calidad para no bloquear desarrollo; cargar contenido en paralelo. |
| Cloudflare Images excede 5k/mes en Free | Baja | Bajo | Plan Paid (~$5/mes) si escala; usar caché agresiva para reducir transformaciones únicas. |
| Límites de escritura de D1 | Baja | Medio | Operaciones de escritura casi solo desde el CMS (volumen bajo); lecturas replicadas. |
| Cambios tardíos de alcance | Media | Medio | Documento técnico aprobado antes de programar; fases entregan valor verificable. |
| SEO lento en posicionarse | Alta | Medio | Empezar SEO desde F1, contenido de calidad, Schema.org, blog/faq futuro. |
| Pérdida de datos | Baja | Alto | Backups D1 automáticos + export periódico de settings. |

---

## 19. Recomendaciones futuras

1. **Blog / Guías de eventos** — contenido SEO de cola larga ("ideas de recordatorios para baby shower") para atraer tráfico orgánico.
2. **PWA instalable** — que los clientes puedan "instalar" el catálogo.
3. **Galería de eventos reales** — fotos de clientes (con permiso) como prueba social.
4. **Plantillas de cotización** — paquetes predefinidos por número de invitados.
5. **Integración con Instagram Shopping** — sincronizar catálogo.
6. **Email marketing** — captar correo en el formulario para newsletters de temporada.
7. **Módulo de carrito/pagos** cuando el volumen lo justifique (Sección 15).
8. **Analítica avanzada** — embudos de conversión (vista → cotización).

---

## 20. Justificación de decisiones y tabla final de validación

### 20.1 Justificación del stack

| Decisión | Alternativa descartada | Razón |
|---|---|---|
| **React Router v7 (Remix)** | TanStack Start (menos maduro), Next.js en CF (beta vía OpenNext), Astro (CMS más complejo) | GA y de **primera clase** en Cloudflare con Vite plugin nativo; SSR maduro, loader/action por ruta, ecosistema y docs SEO/CMS consolidados. |
| **Cloudflare Workers** | VPS tradicional / Vercel | Edge global, serverless, costos bajos, latencia mínima desde Colombia. |
| **D1 (SQLite)** | Postgres externo / KV | Relacional, gratuito, replicado en lectura, ideal para un catálogo; suficiente ahora y migrable vía Hyperdrive después. |
| **R2 + Cloudflare Images** | Imágenes en D1 / externo | R2 sin egress + transformación automática AVIF/WebP/responsive. |
| **Drizzle ORM** | Prisma / SQL crudo | Type-safe, ligero, queries parametrizadas (seguras), excelente soporte D1. |
| **Tailwind + shadcn/ui** | CSS puro / Material UI | Utility-first rápido + componentes accesibles y personalizables, bundle mínimo tras purge. |
| **dnd-kit** | Librerías legacy | Accesible, soporta toque móvil, ideal para ordenar imágenes/destacados en el CMS. |
| **Zod** | Validación manual | Type-safe, reutilizable en cliente y servidor. |

### 20.2 Justificación de diseño

| Decisión | Razón |
|---|---|
| **Catálogo sin carrito/pagos** | Los pedidos de eventos requieren negociación (cantidad, personalización, plazo); el checkout rígido añadiría fricción. El KPI es la cotización. |
| **Cotización por WhatsApp** | Canal preferido en Colombia; mensaje precargado reduce fricción y acelera el contacto. |
| **Categorías por ocasión + tipo** | El usuario piensa en *la celebración*, no solo en el producto; doble entrada mejora conversión y SEO. |
| **CMS mobile-first app-like** | La administradora es una persona mayor que trabaja desde el celular; debe sentirse como una app nativa. |
| **Paleta cálida (coral/mostaza/sage)** | Festiva y alegre (eventos) sin perder seriedad comercial; diferenciación frente al marrón/cuero de competidores. |
| **Tipografía redondeada (Baloo 2) + Inter** | Cercana y legible; transmite calidez sin sacrificar lectura. |

### 20.3 Tabla final de validación (revisar antes de programar)

| # | Decisión | Valor propuesto | ¿Confirmar? |
|---|---|---|---|
| 1 | Nombre del proyecto | **eventoarte.co** | ☐ |
| 2 | Modelo de negocio | Catálogo sin carrito/pagos → cotización por WhatsApp + formulario | ☐ |
| 3 | Framework | React Router v7 (Remix) en Cloudflare Workers | ☐ |
| 4 | Base de datos | Cloudflare D1 + Drizzle ORM | ☐ |
| 5 | Imágenes | R2 + Cloudflare Images | ☐ |
| 6 | UI | Tailwind CSS + shadcn/ui | ☐ |
| 7 | Dominio | eventoarte.co | ☐ |
| 8 | Paleta principal | Coral `#E8645A` + Mostaza `#F2B544` + Sage `#7FA88C` | ☐ |
| 9 | Tipografía | Baloo 2 (títulos) + Inter (texto) | ☐ |
| 10 | Categorías iniciales | Morrales/Kits, Loncheras, Tulas, Cangureras, Piñatería, Recordatorios | ☐ |
| 11 | Ocasiones iniciales | Cumpleaños, Baby shower, Quinceaños, Bautizos/Comuniones, Bodas | ☐ |
| 12 | CMS roles | 1 administrador ahora; multi-rol preparado | ☐ |
| 13 | Filtros públicos | Solo categoría + precio (+ ocasión como transversal) | ☐ |
| 14 | Buscador | Por nombre y código | ☐ |
| 15 | Formato de entrega | Documento técnico Markdown (este archivo) | ☐ |

---

## ✅ Próximo paso

Este documento es la **base técnica aprobable**. Una vez confirmes la **tabla de validación (20.3)** (o indiques ajustes), pasamos a la **fase de implementación** empezando por la **Fase 0 — Fundaciones**.

> *Documento generado para eventoarte.co · 2026-08-02 · Pendiente de aprobación final del cliente.*
