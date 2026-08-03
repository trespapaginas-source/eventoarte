import type { Route } from "./+types/producto";
import { Link } from "react-router";
import { PublicLayout } from "~/components/layout/PublicLayout";
import { buildWhatsAppProductLink } from "~/lib/whatsapp";
import { formatCOP, priceTypeLabel } from "~/lib/format";
import { sampleProducts } from "~/lib/sample-data";
import { cloudflareContext } from "~/lib/cloudflare-context";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Producto — eventoarte.co" },
    {
      name: "description",
      content: "Cotiza este producto personalizado para tu evento con eventoarte.co.",
    },
    { property: "og:type", content: "product" },
  ];
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const product = sampleProducts.find((p) => p.slug === params.slug) ?? null;

  if (!product) {
    throw new Response("Producto no encontrado", { status: 404 });
  }

  const related = sampleProducts
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 4);

  const waLink = buildWhatsAppProductLink(
    { name: product.name, code: product.code, minQty: product.minQty, slug: product.slug },
    env.WA_NUMBER,
    env.PUBLIC_URL,
  );

  return { product, related, waLink, waNumber: env.WA_NUMBER, publicUrl: env.PUBLIC_URL };
}

export default function Producto({ loaderData }: Route.ComponentProps) {
  const { product, related, waLink, waNumber } = loaderData;
  const p = product;
  const image = p.image ?? p.gallery?.[0];

  return (
    <PublicLayout waNumber={waNumber}>
      <div className="container-page py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-xs text-brand-ink-soft" aria-label="Migas de pan">
          <Link to="/" className="hover:text-brand-coral">Inicio</Link>
          <span className="mx-2">/</span>
          <Link to="/catalogo" className="hover:text-brand-coral">Catálogo</Link>
          <span className="mx-2">/</span>
          <Link to={`/categoria/${p.categorySlug}`} className="hover:text-brand-coral capitalize">
            {p.categoryName}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-brand-ink">{p.name}</span>
        </nav>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Galería */}
          <div>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-brand-cream">
              {/* Badges */}
              <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
                {p.isNew ? (
                  <span className="rounded-pill bg-brand-mustard px-3 py-1 text-[11px] font-bold uppercase text-white">
                    Nuevo
                  </span>
                ) : null}
                {p.isBestseller ? (
                  <span className="rounded-pill bg-brand-coral px-3 py-1 text-[11px] font-bold uppercase text-white">
                    Más vendido
                  </span>
                ) : null}
              </div>
              <img
                src={image}
                alt={p.name}
                className="aspect-square w-full object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-coral">
              {p.categoryName}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-brand-ink md:text-4xl">
              {p.name}
            </h1>
            <p className="mt-1 font-mono text-sm text-brand-ink-soft">Ref. {p.code}</p>

            <p className="mt-5 text-lg leading-relaxed text-brand-ink-soft">{p.shortDesc}</p>

            {/* Precio */}
            <div className="mt-6 rounded-xl border border-border bg-brand-cream p-5">
              <p className="font-display text-3xl font-bold text-brand-ink">
                {priceTypeLabel(p.priceType)}{formatCOP(p.price)}
              </p>
              <p className="mt-1 text-sm text-brand-ink-soft">
                Cantidad mínima de pedido: <strong>{p.minQty}</strong> {p.minQty === 1 ? "unidad" : "unidades"}
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-pill bg-whatsapp px-6 py-3.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-105"
              >
                💬 Cotizar por WhatsApp
              </a>
              <Link
                to="/cotizar"
                className="inline-flex items-center justify-center rounded-pill border-2 border-brand-coral px-6 py-3.5 text-sm font-bold text-brand-coral transition-colors hover:bg-brand-coral hover:text-white"
              >
                📝 Formulario
              </Link>
            </div>

            {/* Especificaciones */}
            <div className="mt-8">
              <h2 className="mb-4 font-display text-lg font-bold text-brand-ink">
                Especificaciones
              </h2>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Spec label="Material" value={p.material} />
                <Spec label="Medidas" value={p.dimensions} />
                <Spec label="Peso" value={p.weight} />
                <Spec label="Tiempo de fabricación" value={p.leadTime} />
                <Spec label="Personalización" value={p.customization} />
                <Spec label="Ideal para" value={p.eventType} />
              </dl>
            </div>

            {/* Colores disponibles */}
            {p.colors && p.colors.length > 0 ? (
              <div className="mt-6">
                <h2 className="mb-3 font-display text-lg font-bold text-brand-ink">
                  Colores disponibles
                </h2>
                <div className="flex flex-wrap gap-2">
                  {p.colors.map((c) => (
                    <span
                      key={c}
                      className="rounded-pill border border-border bg-surface px-4 py-1.5 text-sm text-brand-ink-soft"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Descripción larga */}
        {p.longDesc ? (
          <section className="mt-14">
            <h2 className="mb-4 font-display text-2xl font-bold text-brand-ink">Descripción</h2>
            <p className="max-w-3xl leading-relaxed text-brand-ink-soft">{p.longDesc}</p>
          </section>
        ) : null}

        {/* Relacionados */}
        {related && related.length > 0 ? (
          <section className="mt-16">
            <h2 className="mb-6 font-display text-2xl font-bold text-brand-ink">
              Productos relacionados
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {related.map((rp) => (
                <Link
                  key={rp.id}
                  to={`/producto/${rp.slug}`}
                  className="group block overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="aspect-4/3 overflow-hidden bg-brand-cream">
                    <img
                      src={rp.image}
                      alt={rp.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-sm leading-snug group-hover:text-brand-coral">
                      {rp.name}
                    </h3>
                    <p className="mt-1 font-mono text-xs text-brand-ink-soft">Ref. {rp.code}</p>
                    <p className="mt-2 font-bold text-brand-ink">
                      {priceTypeLabel(rp.priceType)}{formatCOP(rp.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </PublicLayout>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-brand-ink-soft">
        {label}
      </dt>
      <dd className="mt-1 font-medium text-brand-ink">{value}</dd>
    </div>
  );
}
