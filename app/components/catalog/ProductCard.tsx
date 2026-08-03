import { ArrowRight, Package } from "lucide-react";
import { BrandLink } from "~/lib/brand-links";

/**
 * Tarjeta de producto — estilo premium sobrio (tipo Vélez).
 * La navegación usa BrandLink para respetar el directorio de marca activo.
 * Refinamiento UX:
 *  - Imagen 1:1, zoom sutil al hover
 *  - Padding generoso pero contenido (no inflado)
 *  - Botón discreto: outline fino, texto pequeño, sin gritar
 *  - Jerarquía clara: overline → nombre → código → precio
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
}

export function ProductCard({ product }: ProductCardProps) {
  const href = `/producto/${product.slug}`;
  const image = product.image ?? product.gallery?.[0];

  return (
    <article className="group relative flex flex-col bg-surface">
      {/* Badges discretos (sobrios: tinta para "Más vendido", degradado para "Nuevo") */}
      {product.isBestseller ? (
        <span className="absolute left-3 top-3 z-10 bg-brand-ink px-2.5 py-1 text-[10px] font-medium uppercase tracking-[1px] text-white">
          Más vendido
        </span>
      ) : null}
      {product.isNew ? (
        <span className="absolute right-3 top-3 z-10 bg-gradient-brand px-2.5 py-1 text-[10px] font-medium uppercase tracking-[1px] text-white">
          Nuevo
        </span>
      ) : null}

      {/* Imagen 1:1 con zoom sutil */}
      <BrandLink
        to={href}
        className="block aspect-square overflow-hidden bg-surface-off"
        aria-label={`Ver ${product.name}`}
      >
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-bottom transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-surface-off">
            <Package size={32} strokeWidth={1} className="text-brand-ink-light" />
          </div>
        )}
      </BrandLink>

      {/* Contenido — padding controlado */}
      <div className="flex flex-1 flex-col pt-3.5">
        {/* Overline categoría — acento de marca (degradado) */}
        {product.categoryName ? (
          <p className="text-gradient-brand mb-1 text-[10px] font-semibold uppercase tracking-[2px]">
            {product.categoryName}
          </p>
        ) : null}

        {/* Nombre */}
        <BrandLink to={href} className="hover:opacity-70">
          <h3 className="text-sm font-medium leading-snug text-brand-ink transition-opacity">
            {product.name}
          </h3>
        </BrandLink>

        {/* Código */}
        <p className="mt-0.5 text-[11px] text-brand-ink-light">{product.code}</p>

        {/* Precio */}
        <div className="mt-auto pt-3">
          <p className="text-base font-semibold text-brand-ink">
            {priceTypeLabel[product.priceType]}
            {formatCOP(product.price)}
          </p>
          <p className="mt-0.5 text-[11px] text-brand-ink-soft">
            Mín. {product.minQty} {product.minQty === 1 ? "unidad" : "unidades"}
          </p>
        </div>

        {/* Botón discreto — texto link, no caja grande */}
        <BrandLink
          to={href}
          className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[1.5px] text-brand-ink transition-opacity hover:opacity-70"
        >
          Ver producto
          <ArrowRight size={12} strokeWidth={1.5} />
        </BrandLink>
      </div>
    </article>
  );
}
