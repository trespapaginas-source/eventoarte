/**
 * Utilidades de formato reutilizables.
 */

export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function priceTypeLabel(type: string): string {
  switch (type) {
    case "desde":
      return "Desde ";
    case "por_cantidad":
      return "Por cantidad: ";
    default:
      return "";
  }
}
