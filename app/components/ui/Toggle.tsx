import type { LucideIcon } from "lucide-react";

/**
 * Botón del CMS — variantes sólida (negro), outline y fantasma.
 * Coherente con el estilo del sitio público.
 */

type Variant = "solid" | "outline" | "ghost" | "danger";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-1.5 text-xs font-medium uppercase tracking-[1.5px] transition-all disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  solid: "border border-brand-ink bg-brand-ink text-white hover:bg-transparent hover:text-brand-ink",
  outline: "border border-border bg-surface text-brand-ink hover:border-brand-ink",
  ghost: "bg-transparent text-brand-ink-soft hover:bg-surface-off hover:text-brand-ink",
  danger:
    "border border-error bg-error text-white hover:bg-transparent hover:text-error",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5",
  md: "px-5 py-2.5",
};

export function Button({
  variant = "solid",
  size = "md",
  icon: Icon,
  iconSize = 14,
  type = "button",
  children,
  className = "",
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  iconSize?: number;
  type?: "button" | "submit" | "reset";
  children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {Icon ? <Icon size={iconSize} strokeWidth={1.5} /> : null}
      {children}
    </button>
  );
}
