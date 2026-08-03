import { Link } from "react-router";

/**
 * Logo de recuerdos.store — marca única + wordmark.
 *
 * El ícono usa el MISMO degradado de marca que los tokens CSS
 * (azul pastel → lila → rosa pastel) para consistencia total.
 * `variant="mark"` dibuja solo el ícono (cuadrado redondeado con la "r");
 * `variant="full"` añade el wordmark `recuerdos.store`.
 *
 * Único punto de verdad para la marca gráfica: lo usan header, footer,
 * AdminShell y login.
 */

const GRAD_STOPS = (
  <>
    <stop offset="0%" stopColor="#7ca8e8" />
    <stop offset="45%" stopColor="#a894d9" />
    <stop offset="100%" stopColor="#f2a0bd" />
  </>
);

function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="recuerdos-brand" x1="0" y1="0" x2="1" y2="1">
          {GRAD_STOPS}
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#recuerdos-brand)" />
      <text
        x="30"
        y="44"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="38"
        fontWeight="700"
        fill="#ffffff"
        textAnchor="middle"
        letterSpacing="-1"
      >
        r
      </text>
      <circle cx="46" cy="20" r="4.5" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}

export interface LogoProps {
  variant?: "full" | "mark";
  size?: number;
  to?: string;
  className?: string;
  /** Tamaño tipográfico del wordmark (clase Tailwind). Default text-2xl. */
  textClassName?: string;
}

export function Logo({
  variant = "full",
  size = 28,
  to,
  className,
  textClassName = "text-2xl",
}: LogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <Mark size={size} />
      {variant === "full" ? (
        <span
          className={`font-display font-extrabold tracking-tight text-brand-ink ${textClassName}`}
        >
          recuerdos<span className="text-brand-ink-light">.store</span>
        </span>
      ) : null}
    </span>
  );

  if (to) {
    return (
      <Link to={to} className="transition-opacity hover:opacity-80">
        {content}
      </Link>
    );
  }
  return content;
}

export { Mark as LogoMark };
