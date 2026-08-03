import { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/producto";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PublicLayout } from "~/components/layout/PublicLayout";
import { ProductCard } from "~/components/catalog/ProductCard";
import { buildWhatsAppProductLink } from "~/lib/whatsapp";
import { formatCOP, priceTypeLabel } from "~/lib/format";
import { sampleProducts, type SampleProduct } from "~/lib/sample-data";
import { cloudflareContext } from "~/lib/cloudflare-context";
import { productJsonLd, breadcrumbJsonLd } from "~/lib/seo";

const PUBLIC_URL = "https://recuerdos.store";

// En React Router v8 el `data` del loader no siempre se tipa en meta args.
// Para máxima robustez, resolvemos el producto desde params.slug directamente.
export function meta({ params }: Route.MetaArgs) {
  const product = sampleProducts.find((p) => p.slug === params.slug);
  if (!product) {
    return [
      { title: "Producto no encontrado — recuerdos.store" },
      { name: "description", content: "El producto que buscas no está disponible." },
    ];
  }
  const url = `${PUBLIC_URL}/producto/${product.slug}`;
  const image = product.image ?? product.gallery?.[0];
  return [
    { title: `${product.name} — recuerdos.store` },
    {
      name: "description",
      content:
        product.seoDesc ??
        `${product.shortDesc} Cotiza ${product.name} personalizado para tu evento.`,
    },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "product" },
    { property: "og:title", content: product.name },
    { property: "og:description", content: product.shortDesc },
    { property: "og:url", content: url },
    { property: "og:image", content: `${PUBLIC_URL}${image}` },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const product = sampleProducts.find((p) => p.slug === params.slug) ?? null;

  if (!product) {
    throw new Response("Producto no encontrado", { status: 404 });
  }

  // Relacionados: misma categoría primero, después mismos eventos
  const sameCat = sampleProducts.filter(
    (p) => p.categorySlug === product.categorySlug && p.id !== product.id,
  );
  const fallback = sampleProducts.filter(
    (p) =>
      p.id !== product.id &&
      p.categorySlug !== product.categorySlug &&
      p.eventType === product.eventType,
  );
  const related = [...sameCat, ...fallback].slice(0, 4);

  const waLink = buildWhatsAppProductLink(
    { name: product.name, code: product.code, minQty: product.minQty, slug: product.slug },
    env.WA_NUMBER,
    env.PUBLIC_URL,
  );

  // Datos para JSON-LD
  const publicUrl = env.PUBLIC_URL.replace(/\/$/, "");
  const url = `${publicUrl}/producto/${product.slug}`;
  const image = product.image ?? product.gallery?.[0];

  const jsonLdProduct = productJsonLd({
    name: product.name,
    sku: product.code,
    description: product.shortDesc,
    image: `${publicUrl}${image}`,
    price: product.price,
    url,
  });

  const jsonLdBreadcrumb = breadcrumbJsonLd([
    { name: "Inicio", url: `${publicUrl}/` },
    { name: "Catálogo", url: `${publicUrl}/catalogo` },
    { name: product.categoryName, url: `${publicUrl}/categoria/${product.categorySlug}` },
    { name: product.name, url },
  ]);

  return {
    product,
    related,
    waLink,
    waNumber: env.WA_NUMBER,
    publicUrl,
    jsonLdProduct,
    jsonLdBreadcrumb,
  };
}

export default function Producto({ loaderData }: Route.ComponentProps) {
  const { product, related, waLink, waNumber, jsonLdProduct, jsonLdBreadcrumb } = loaderData;
  const p = product;

  // Detección de scroll para activar la barra inferior fija (sticky bar)
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;

    // Mostrar la barra solo cuando el CTA principal sale del viewport
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        // El CTA ya NO es visible -> mostramos la barra pegajosa
        setStickyVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px 0px -20px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const priceText = `${priceTypeLabel(p.priceType)}${formatCOP(p.price)}`;

  return (
    <PublicLayout waNumber={waNumber}>
      {/* Datos estructurados SEO (Schema.org) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      <div className="container-page pb-24 pt-6 md:pb-12 md:pt-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-[11px] text-brand-ink-light" aria-label="Migas de pan">
          <Link to="/" className="transition-colors hover:text-brand-ink">
            Inicio
          </Link>
          <span className="mx-1.5">/</span>
          <Link to="/catalogo" className="transition-colors hover:text-brand-ink">
            Catálogo
          </Link>
          <span className="mx-1.5">/</span>
          <Link
            to={`/categoria/${p.categorySlug}`}
            className="capitalize transition-colors hover:text-brand-ink"
          >
            {p.categoryName}
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-brand-ink-soft">{p.name}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
          {/* ===== Galería ===== */}
          <ProductGallery product={p} />

          {/* ===== Info minimalista ===== */}
          <div className="flex flex-col">
            {/* Overline categoría */}
            <p className="text-[10px] font-medium uppercase tracking-[2px] text-brand-ink-light">
              {p.categoryName}
            </p>

            {/* Nombre */}
            <h1 className="mt-2 text-2xl font-medium leading-tight text-brand-ink md:text-3xl">
              {p.name}
            </h1>

            {/* Referencia (sin "unidad disponible") */}
            <p className="mt-1.5 font-mono text-[11px] text-brand-ink-light">
              Ref. {p.code}
            </p>

            {/* Descripción breve */}
            <p className="mt-4 text-sm leading-relaxed text-brand-ink-soft">
              {p.shortDesc}
            </p>

            {/* Precio */}
            <p className="mt-5 text-2xl font-semibold text-brand-ink">{priceText}</p>
            <p className="mt-1 text-[11px] text-brand-ink-light">
              Pedidos desde {p.minQty} {p.minQty === 1 ? "unidad" : "unidades"}
            </p>

            {/* CTA principal (referencia para el IntersectionObserver) */}
            <div ref={ctaRef} className="mt-6">
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center border border-brand-ink bg-brand-ink px-6 py-3.5 text-xs font-medium uppercase tracking-[1.5px] text-white transition-all hover:bg-transparent hover:text-brand-ink"
              >
                Cotizar
              </a>
              <p className="mt-2 text-center text-[11px] text-brand-ink-light">
                Te respondemos por WhatsApp con la cotización a la medida
              </p>
            </div>

            {/* ===== Acordeones (Descripción / Características / Cuidados) ===== */}
            <div className="mt-8 divide-y divide-border border-y border-border">
              <Accordion title="Descripción" defaultOpen>
                <p className="leading-relaxed">{p.longDesc || p.shortDesc}</p>
                {p.audience ? (
                  <p className="mt-3">
                    <span className="font-medium text-brand-ink">Ideal para: </span>
                    <span className="capitalize">
                      {p.eventType} · Público {audienceLabel(p.audience)}
                    </span>
                  </p>
                ) : null}
              </Accordion>

              <Accordion title="Características">
                <dl className="space-y-2.5">
                  <SpecRow label="Material" value={p.material} />
                  <SpecRow label="Medidas" value={p.dimensions} />
                  <SpecRow label="Peso" value={p.weight} />
                  <SpecRow label="Personalización" value={p.customization} />
                  <SpecRow label="Tiempo de fabricación" value={p.leadTime} />
                </dl>
                {p.colors && p.colors.length > 0 ? (
                  <div className="mt-4">
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-[1px] text-brand-ink">
                      Colores disponibles
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.colors.map((c) => (
                        <span
                          key={c}
                          className="border border-border bg-surface px-2.5 py-1 text-[11px] text-brand-ink-soft"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </Accordion>

              <Accordion title="Cuidados">
                <ul className="space-y-1.5">
                  {careInstructions(p).map((tip, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-gradient-brand" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Accordion>
            </div>
          </div>
        </div>

        {/* ===== Te puede interesar ===== */}
        {related && related.length > 0 ? (
          <section className="mt-16 md:mt-20">
            <h2 className="mb-6 text-center text-xs font-medium uppercase tracking-[2px] text-brand-ink md:text-left md:tracking-[3px]">
              Te puede interesar
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {related.map((rp) => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {/* ===== Barra inferior fija (sticky) ===== */}
      <StickyCotizarBar
        product={p}
        priceText={priceText}
        waLink={waLink}
        visible={stickyVisible}
      />
    </PublicLayout>
  );
}

/* ============================================================
   Componentes auxiliares
   ============================================================ */

function Accordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-[11px] font-medium uppercase tracking-[1.5px] text-brand-ink">
          {title}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          className={`shrink-0 text-brand-ink-soft transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open ? <div className="pb-5 text-sm text-brand-ink-soft">{children}</div> : null}
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-3">
      <dt className="w-32 shrink-0 text-[11px] font-medium uppercase tracking-[0.5px] text-brand-ink-light">
        {label}
      </dt>
      <dd className="flex-1 text-brand-ink-soft">{value}</dd>
    </div>
  );
}

function StickyCotizarBar({
  product,
  priceText,
  waLink,
  visible,
}: {
  product: SampleProduct;
  priceText: string;
  waLink: string;
  visible: boolean;
}) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 transform border-t border-border bg-surface/95 backdrop-blur transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      role="region"
      aria-label="Cotización rápida"
    >
      <div className="container-page flex items-center justify-between gap-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-brand-ink">{product.name}</p>
          <p className="mt-0.5 text-sm font-semibold text-brand-ink">{priceText}</p>
        </div>
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center justify-center border border-brand-ink bg-brand-ink px-6 py-3 text-xs font-medium uppercase tracking-[1.5px] text-white transition-all hover:bg-transparent hover:text-brand-ink"
        >
          Cotizar
        </a>
      </div>
    </div>
  );
}

/* ============================================================
   Galería de producto (imagen principal + thumbnails)
   ============================================================ */

/**
 * Resuelve la lista de URLs de imagen de un producto.
 * Soporta datos de muestra (p.gallery / p.image) y productos de BD
 * (array `images` con r2Key servidas vía /media/*).
 */
function resolveGallery(product: SampleProduct): string[] {
  // Producto de BD: el loader adjunta `images` con r2Key
  const imgs = (product as any).images as
    | { r2Key: string; sortOrder: number }[]
    | undefined;
  if (Array.isArray(imgs) && imgs.length > 0) {
    const sorted = [...imgs].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return sorted.map((i) => `/media/${i.r2Key}`);
  }
  // Datos de muestra
  if (Array.isArray(product.gallery) && product.gallery.length > 0) {
    return product.gallery;
  }
  return product.image ? [product.image] : [];
}

function ProductGallery({ product }: { product: SampleProduct }) {
  const gallery = resolveGallery(product);
  const [activeIdx, setActiveIdx] = useState(0);

  // Si el producto cambia (navegación client-side), resetear el índice
  useEffect(() => {
    setActiveIdx(0);
  }, [product.id]);

  const hasMultiple = gallery.length > 1;
  const active = gallery[activeIdx] ?? gallery[0] ?? "";

  const go = (dir: -1 | 1) => {
    setActiveIdx((prev) => {
      if (gallery.length <= 1) return 0;
      const next = (prev + dir + gallery.length) % gallery.length;
      return next;
    });
  };

  return (
    <div>
      {/* Imagen principal */}
      <div
        className="group relative overflow-hidden border border-border bg-surface-off"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
        tabIndex={hasMultiple ? 0 : -1}
        role={hasMultiple ? "group" : undefined}
        aria-label={hasMultiple ? "Galería de imágenes (usa flechas)" : undefined}
      >
        {/* Badges discretos */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {product.isNew ? (
            <span className="bg-gradient-brand px-2.5 py-1 text-[10px] font-medium uppercase tracking-[1px] text-white">
              Nuevo
            </span>
          ) : null}
          {product.isBestseller ? (
            <span className="bg-brand-ink px-2.5 py-1 text-[10px] font-medium uppercase tracking-[1px] text-white">
              Más vendido
            </span>
          ) : null}
        </div>

        {/* Contador (solo si hay múltiples) */}
        {hasMultiple ? (
          <span className="absolute right-3 top-3 z-10 bg-brand-ink/70 px-2 py-0.5 text-[10px] font-medium text-white">
            {activeIdx + 1} / {gallery.length}
          </span>
        ) : null}

        <img
          src={active}
          alt={product.name}
          className="aspect-square w-full object-cover"
        />

        {/* Flechas de navegación (desktop hover) */}
        {hasMultiple ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Imagen anterior"
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/80 text-brand-ink opacity-0 backdrop-blur transition-opacity hover:bg-white group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Imagen siguiente"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/80 text-brand-ink opacity-0 backdrop-blur transition-opacity hover:bg-white group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </>
        ) : null}
      </div>

      {/* Thumbnails */}
      {hasMultiple ? (
        <div className="mt-3 grid grid-cols-6 gap-2">
          {gallery.map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              type="button"
              onClick={() => setActiveIdx(idx)}
              aria-label={`Ver imagen ${idx + 1}`}
              aria-current={idx === activeIdx}
              className={`relative aspect-square overflow-hidden border bg-surface-off transition-all ${
                idx === activeIdx
                  ? "border-brand-ink ring-1 ring-brand-ink"
                  : "border-border hover:border-brand-ink-light"
              }`}
            >
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ============================================================
   Helpers de presentación
   ============================================================ */

function audienceLabel(audience: string): string {
  switch (audience) {
    case "ninas":
      return "niñas";
    case "ninos":
      return "niños";
    default:
      return "unisex";
  }
}

/**
 * Genera instrucciones de cuidado razonables según el material del producto.
 * El catálogo no tiene un campo "cuidados" todavía, así que se infiere.
 */
function careInstructions(p: SampleProduct): string[] {
  const mat = (p.material || "").toLowerCase();

  if (mat.includes("neopreno")) {
    return [
      "Limpiar con un paño húmedo y jabón suave.",
      "No usar lejía ni solventes agresivos.",
      "Secar al aire libre, lejos de fuentes de calor directo.",
      "No planchar.",
    ];
  }
  if (mat.includes("cartón")) {
    return [
      "Mantener en lugar seco y alejado de la humedad.",
      "Evitar la exposición prolongada al sol para conservar los colores.",
      "Limpiar con un pincel suave o paño seco.",
      "No exponer a líquidos directamente.",
    ];
  }
  if (mat.includes("tela premium") || mat.includes("lona")) {
    return [
      "Lavar a mano con agua fría y detergente suave.",
      "No usar lejía ni blanqueadores.",
      "Secar al aire libre, extendido y a la sombra.",
      "Planchar a baja temperatura si es necesario, evitando el estampado.",
    ];
  }
  if (mat.includes("papel")) {
    return [
      "Mantener en lugar seco y fresco.",
      "Manipular con manos limpias para evitar manchas.",
      "Alejar de fuentes de calor y humedad.",
    ];
  }
  return [
    "Limpiar con un paño suave y seco.",
    "Evitar la exposición prolongada al sol.",
    "Guardar en lugar seco cuando no se use.",
  ];
}
