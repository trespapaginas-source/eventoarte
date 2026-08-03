/**
 * Generador de enlaces de WhatsApp con mensaje precargado.
 * Sección 9.5 del Documento Técnico.
 *
 * El número se toma de los settings/vars de Cloudflare (WA_NUMBER),
 * en formato internacional SIN "+" ni espacios (ej: 573001234567).
 */

export interface WhatsAppProduct {
  name: string;
  code: string;
  minQty: number;
  slug: string;
}

export function buildWhatsAppProductLink(
  product: WhatsAppProduct,
  waNumber: string,
  publicUrl: string,
): string {
  const lines = [
    "¡Hola eventoarte! Quiero cotizar:",
    `• ${product.name}`,
    `• Código: ${product.code}`,
    `• Cantidad mínima: ${product.minQty} u`,
    `• ${publicUrl}/producto/${product.slug}`,
  ];
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${waNumber}?text=${text}`;
}

export function buildWhatsAppGeneralLink(waNumber: string): string {
  const text = encodeURIComponent(
    "¡Hola eventoarte! Quiero solicitar una cotización para un evento.",
  );
  return `https://wa.me/${waNumber}?text=${text}`;
}
