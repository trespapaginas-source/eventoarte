import { Link } from "react-router";
import type { Product } from "~/lib/db/schema";

/**
 * Tarjeta de producto — Sección 7.3 del Documento Técnico.
 * Contiene: imagen, nombre, código, precio, cantidad mínima y botones Ver/Cotizar.
 */

function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

const priceTypeLabel: Record<string, string> = {
  unitario: "",
  desde: "Desde ",
  por_cantidad: "Por cantidad: ",
};

export interface ProductCardProps {
  product: Product & { images?: { r2Key: string; altText: string | null }[] };
  waNumber?: string;
  publicUrl?: string;
}

export function ProductCard({ product, waNumber, publicUrl }: ProductCardProps) {
  const firstImage = product.images?.[0];
  const href = `/producto/${product.slug}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-shadow hover:shadow-md">
      <Link to={href} className="block aspect-4/3 overflow-hidden bg-brand-cream">
        {firstImage ? (
          <img
            src={`/media/${firstImage.r2Key}`}
            alt={firstImage.altText ?? product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🎁</div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link to={href} className="hover:text-brand-coral">
          <h3 className="font-display text-lg leading-snug">{product.name}</h3>
        </Link>
        <p className="font-mono text-xs text-brand-ink-soft">#{product.code}</p>

        <p className="mt-auto text-lg font-semibold text-brand-ink">
          {priceTypeLabel[product.priceType]}
          {formatCOP(product.price)}
        </p>
        <p className="text-xs text-brand-ink-soft">Cantidad mín: {product.minQty} u</p>

        <div className="mt-2 flex gap-2">
          <Link
            to={href}
            className="flex-1 rounded-md border border-brand-coral px-3 py-2 text-center text-sm font-semibold text-brand-coral transition-colors hover:bg-brand-coral hover:text-white"
          >
            Ver producto
          </Link>
          {waNumber && publicUrl ? (
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                `¡Hola! Quiero cotizar ${product.name} (#${product.code}).`,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-whatsapp px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-whatsapp-dark"
              aria-label={`Cotizar ${product.name} por WhatsApp`}
            >
              💬
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
