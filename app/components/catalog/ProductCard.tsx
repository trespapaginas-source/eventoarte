import { Link } from "react-router";

/**
 * Tarjeta de producto — estilo premium tipo Vélez.
 * Principios aplicados del análisis:
 *  - Imagen ratio 1:1 cuadrada, object-position bottom
 *  - Sin sombras pesadas, hover solo con zoom sutil (scale 1.1)
 *  - Botón outline (uppercase + tracking 1.5px)
 *  - Bordes hairline (#EBECEE)
 *  - Badge tipo cinta para destacados
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
    <article className="group relative flex flex-col bg-surface">
      {/* Badges (cinta vertical para destacados, esquina para nuevos) */}
      {product.isBestseller ? (
        <span className="absolute left-3 top-3 z-10 rounded-pill bg-brand-coral px-3 py-1 text-[10px] font-medium uppercase tracking-[1.5px] text-white">
          Más vendido
        </span>
      ) : null}
      {product.isNew ? (
        <span className="absolute right-3 top-3 z-10 rounded-pill bg-brand-mustard px-3 py-1 text-[10px] font-medium uppercase tracking-[1.5px] text-white">
          Nuevo
        </span>
      ) : null}

      {/* Imagen — ratio 1:1, sin bordes/sombras, zoom sutil al hover */}
      <Link
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
            className="h-full w-full object-cover object-bottom transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl text-brand-ink-light">
            🎁
          </div>
        )}
      </Link>

      {/* Contenido */}
      <div className="flex flex-1 flex-col pt-4">
        {/* Categoría (overline, uppercase tracking) */}
        {product.categoryName ? (
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[2px] text-brand-coral">
            {product.categoryName}
          </p>
        ) : null}

        {/* Nombre */}
        <Link to={href} className="hover:text-brand-coral">
          <h3 className="text-[15px] font-medium leading-snug text-brand-ink transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Código */}
        <p className="mt-1 font-mono text-xs text-brand-ink-light">
          {product.code}
        </p>

        {/* Precio */}
        <div className="mt-auto pt-4">
          <p className="text-lg font-semibold text-brand-ink">
            {priceTypeLabel[product.priceType]}
            {formatCOP(product.price)}
          </p>
          <p className="mt-0.5 text-xs text-brand-ink-soft">
            Mín. {product.minQty} {product.minQty === 1 ? "unidad" : "unidades"}
          </p>

          {/* Botón outline (estilo Vélez) */}
          <Link
            to={href}
            className="mt-3 block w-full border border-brand-ink py-2.5 text-center text-[11px] font-medium uppercase tracking-[1.5px] text-brand-ink transition-all hover:bg-brand-ink hover:text-white"
          >
            Ver producto
          </Link>
        </div>
      </div>
    </article>
  );
}
