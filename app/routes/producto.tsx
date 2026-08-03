import type { Route } from "./+types/producto";
import { cloudflareContext } from "~/lib/cloudflare-context";
import { Link } from "react-router";
import { PublicLayout } from "~/components/layout/PublicLayout";
import { getDb } from "~/lib/db/client";
import { getProductBySlug, getRelatedProducts } from "~/lib/db/queries";
import { buildWhatsAppProductLink } from "~/lib/whatsapp";
import { formatCOP, priceTypeLabel } from "~/lib/format";
import { sampleProducts } from "~/lib/sample-data";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Producto — eventoarte.co" },
    { name: "description", content: "Cotiza este producto personalizado para tu evento con eventoarte.co." },
    { property: "og:type", content: "product" },
  ];
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const env = context.get(cloudflareContext).env;
  let product: any = sampleProducts.find((p) => p.slug === params.slug) ?? null;
  let related: any[] = [];

  try {
    if (env.DB) {
      const db = getDb(env.DB);
      const found = await getProductBySlug(db, params.slug!);
      if (found) {
        product = found;
        if (found.categoryId) {
          related = (await getRelatedProducts(db, found.categoryId, found.id, 4)) as any;
        }
      }
    }
  } catch {
    /* muestra */
  }

  if (!product) {
    throw new Response("Producto no encontrado", { status: 404 });
  }

  const waLink = buildWhatsAppProductLink(
    { name: product.name, code: product.code, minQty: product.minQty, slug: product.slug },
    env.WA_NUMBER,
    env.PUBLIC_URL,
  );

  return { product, related, waLink, waNumber: env.WA_NUMBER, publicUrl: env.PUBLIC_URL };
}

export default function Producto({ loaderData }: Route.ComponentProps) {
  const { product, related, waLink, waNumber, publicUrl } = loaderData;
  const p = product;

  return (
    <PublicLayout waNumber={waNumber}>
      <div className="container-page py-8">
        <nav className="mb-4 text-sm text-brand-ink-soft" aria-label="Migas de pan">
          <Link to="/" className="hover:text-brand-coral">Inicio</Link> /{" "}
          <Link to="/catalogo" className="hover:text-brand-coral">Catálogo</Link> /{" "}
          <span className="text-brand-ink">{p.name}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Galería */}
          <div className="flex aspect-square items-center justify-center rounded-lg bg-brand-cream text-8xl">
            {p.images?.[0] ? (
              <img src={`/media/${p.images[0].r2Key}`} alt={p.name} className="h-full w-full rounded-lg object-cover" />
            ) : (
              "🎁"
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="text-3xl md:text-4xl">{p.name}</h1>
            <p className="mt-1 font-mono text-sm text-brand-ink-soft">#{p.code}</p>
            <p className="mt-4 text-brand-ink-soft">{p.shortDesc}</p>

            <p className="mt-6 text-3xl font-bold text-brand-ink">
              {priceTypeLabel(p.priceType)}{formatCOP(p.price)}
            </p>
            <p className="text-sm text-brand-ink-soft">Cantidad mínima: {p.minQty} unidades</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-pill bg-whatsapp px-6 py-3 font-semibold text-white shadow-md transition-transform hover:scale-105"
              >
                💬 Cotizar por WhatsApp
              </a>
              <Link
                to="/cotizar"
                className="rounded-pill border border-brand-coral px-6 py-3 font-semibold text-brand-coral hover:bg-brand-coral hover:text-white"
              >
                📝 Formulario
              </Link>
            </div>

            {/* Specs */}
            <dl className="mt-8 grid grid-cols-2 gap-3 text-sm">
              {p.material ? <Spec label="Material" value={p.material} /> : null}
              {p.dimensions ? <Spec label="Medidas" value={p.dimensions} /> : null}
              {p.weight ? <Spec label="Peso" value={p.weight} /> : null}
              {p.leadTime ? <Spec label="Tiempo de fabricación" value={p.leadTime} /> : null}
              {p.customization ? <Spec label="Personalización" value={p.customization} /> : null}
            </dl>
          </div>
        </div>

        {/* Relacionados */}
        {related && related.length > 0 ? (
          <section className="mt-16">
            <h2 className="mb-6 text-2xl">Productos relacionados</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((rp) => (
                <ProductCardLite key={rp.id} product={rp} waNumber={waNumber} publicUrl={publicUrl} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </PublicLayout>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-brand-cream p-3">
      <dt className="text-xs uppercase tracking-wide text-brand-ink-soft">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function ProductCardLite({ product, waNumber, publicUrl }: any) {
  return (
    <Link to={`/producto/${product.slug}`} className="group block overflow-hidden rounded-lg border border-border bg-surface shadow-sm hover:shadow-md">
      <div className="flex aspect-4/3 items-center justify-center bg-brand-cream text-4xl">🎁</div>
      <div className="p-3">
        <h3 className="font-display leading-snug group-hover:text-brand-coral">{product.name}</h3>
        <p className="text-xs font-mono text-brand-ink-soft">#{product.code}</p>
      </div>
    </Link>
  );
}
