import { Link } from "react-router";

/**
 * Tarjeta de producto — estilo premium inspirado en Vélez.
 * Sección 7.3 del Documento Técnico.
 *
 * Incluye: imagen con ratio fijo, badges (Nuevo / Más vendido), categoría,
 * nombre, código, precio elegante y cantidad mínima.
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
  por_cantidad: "",
};

export interface ProductCardProps {
  product: any;
  waNumber?: string;
  publicUrl?: string;
}

export function ProductCard({ product }: ProductCardProps) {
  const href = `/producto/${product.slug}`;
  const image = product.image ?? product.gallery?.[0];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
        {product.isNew ? (
          <span className="rounded-pill bg-brand-mustard px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
            Nuevo
          </span>
        ) : null}
        {product.isBestseller ? (
          <span className="rounded-pill bg-brand-coral px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
            Más vendido
          </span>
        ) : null}
      </div>

      {/* Imagen */}
      <Link
        to={href}
        className="block aspect-4/3 overflow-hidden bg-brand-cream"
        aria-label={`Ver ${product.name}`}
      >
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl text-brand-ink-soft">
            🎁
          </div>
        )}
      </Link>

      {/* Contenido */}
      <div className="flex flex-1 flex-col p-4">
        {/* Categoría */}
        {product.categoryName ? (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-brand-coral">
            {product.categoryName}
          </p>
        ) : null}

        {/* Nombre */}
        <Link to={href} className="mb-1 hover:text-brand-coral">
          <h3 className="font-display text-base leading-snug text-brand-ink transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Código */}
        <p className="mb-3 font-mono text-xs text-brand-ink-soft">
          Ref. {product.code}
        </p>

        {/* Precio */}
        <div className="mt-auto">
          <p className="font-display text-xl font-bold text-brand-ink">
            {priceTypeLabel[product.priceType]}
            {formatCOP(product.price)}
          </p>
          <p className="mt-0.5 text-xs text-brand-ink-soft">
            Cantidad mínima: {product.minQty} {product.minQty === 1 ? "unidad" : "unidades"}
          </p>
        </div>

        {/* CTA */}
        <Link
          to={href}
          className="mt-3 block rounded-md border border-brand-ink px-4 py-2 text-center text-sm font-semibold text-brand-ink transition-all hover:bg-brand-ink hover:text-white"
        >
          Ver producto
        </Link>
      </div>
    </article>
  );
}
