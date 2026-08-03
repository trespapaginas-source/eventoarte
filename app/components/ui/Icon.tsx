import type { LucideIcon } from "lucide-react";

/**
 * Wrapper para iconos Lucide con tamaño y trazo consistentes.
 * Estilo editorial minimalista: líneas finas (1.5px), sin relleno.
 *
 * Uso:
 *   <Icon icon={Search} className="text-brand-ink-soft" />
 *   <Icon icon={MessageCircle} size={18} />
 */
export interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  strokeWidth?: number;
  "aria-hidden"?: boolean;
}

export function Icon({
  icon: LucideComponent,
  size = 18,
  className,
  strokeWidth = 1.5,
  ...rest
}: IconProps) {
  return (
    <LucideComponent
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={rest["aria-hidden"] ?? true}
    />
  );
}
