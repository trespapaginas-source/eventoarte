/**
 * Generador de enlaces de WhatsApp con mensaje precargado.
 *
 * El número depende de la marca activa (Recordarte / Bella Arte),
 * resuelto en el loader y pasado como parte de la BrandConfig.
 * Formato internacional SIN "+" ni espacios (ej: 573102737264).
 */

import type { BrandConfig } from "./brand";

export interface WhatsAppProduct {
  name: string;
  code: string;
  minQty: number;
  slug: string;
}

/**
 * Link de WhatsApp para cotizar un producto concreto.
 * Usa el nombre de la marca activa en el saludo.
 */
export function buildWhatsAppProductLink(
  product: WhatsAppProduct,
  brand: BrandConfig,
  publicUrl: string,
): string {
  const lines = [
    `¡Hola ${brand.name}! Quiero cotizar:`,
    `• ${product.name}`,
    `• Código: ${product.code}`,
    `• Cantidad mínima: ${product.minQty} u`,
    `• ${publicUrl}/producto/${product.slug}`,
  ];
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${brand.whatsapp}?text=${text}`;
}

/**
 * Link de WhatsApp genérico (sin producto).
 * Usa el nombre de la marca activa en el saludo.
 */
export function buildWhatsAppGeneralLink(brand: BrandConfig): string {
  const text = encodeURIComponent(
    `¡Hola ${brand.name}! Quiero solicitar una cotización para un evento.`,
  );
  return `https://wa.me/${brand.whatsapp}?text=${text}`;
}

/** Link simple wa.me sin mensaje (para botones compactos del header/footer). */
export function buildWhatsAppSimpleLink(brand: BrandConfig): string {
  return `https://wa.me/${brand.whatsapp}`;
}

