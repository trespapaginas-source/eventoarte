/**
 * Datos de muestra para previsualizar el diseño mientras D1 está vacío.
 * Estos datos NO se usan en producción; son reemplazados al cargar el seed real.
 *
 * IMPORTANTE: Las categorías son de PRODUCTO (Morrales, Loncheras, Cartucheras...),
 * no de evento. El tipo de evento (cumpleaños, bautizo...) se especifica en cada producto.
 */

export const sampleCategories = [
  { name: "Morrales", slug: "morrales", icon: "🎒", image: "/images/productos/fotos/morral-safari.jpg" },
  { name: "Loncheras", slug: "loncheras", icon: "🥪", image: "/images/productos/fotos/lonchera.jpg" },
  { name: "Cartucheras", slug: "cartucheras", icon: "✏️", image: "/images/productos/fotos/cartuchera.jpg" },
  { name: "Tulas", slug: "tulas", icon: "👜", image: "/images/productos/fotos/tula.jpg" },
  { name: "Cangureras", slug: "cangureras", icon: "👛", image: "/images/productos/fotos/cangurera.jpg" },
  { name: "Recordatorios", slug: "recordatorios", icon: "🎁", image: "/images/productos/fotos/recordatorio.jpg" },
  { name: "Piñatería", slug: "pinateria", icon: "🎉", image: "/images/productos/fotos/pinateria.jpg" },
];

// Mantiene compatibilidad con código existente que usa sampleOccasions
export const sampleOccasions = sampleCategories;

export interface SampleProduct {
  id: number;
  name: string;
  slug: string;
  code: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  shortDesc: string;
  longDesc: string;
  price: number;
  priceType: "unitario" | "desde" | "por_cantidad";
  minQty: number;
  material: string;
  colors: string[];
  dimensions: string;
  weight: string;
  leadTime: string;
  customization: string;
  eventType: string; // Cumpleaños, Bautizo, Baby shower, etc.
  active: boolean;
  featured: boolean;
  featuredOrder: number;
  isNew?: boolean;
  isBestseller?: boolean;
  seoTitle: string | null;
  seoDesc: string | null;
  ogImageKey: string | null;
  createdAt: number;
  updatedAt: number;
  image: string;
  gallery: string[];
}

export const sampleProducts: SampleProduct[] = [
  {
    id: 1,
    name: "Morral Infantil Safari",
    slug: "morral-infantil-safari",
    code: "MAR-SAF-01",
    categoryId: 1,
    categoryName: "Morrales",
    categorySlug: "morrales",
    shortDesc: "Morral de lona con temática safari, ideal para cumpleaños infantiles. Personalizado con nombre.",
    longDesc:
      "Morral fabricado en lona resistente con temática safari. Incluye bordado del nombre del cumpleañero y detalles decorativos. Perfecto como recuerdo de cumpleaños infantiles, con materiales de alta calidad y acabados premium.",
    price: 12500,
    priceType: "desde",
    minQty: 25,
    material: "Lona 100% algodón",
    colors: ["Beige", "Verde oliva", "Terracota"],
    dimensions: "30 × 25 × 10 cm",
    weight: "180 g",
    leadTime: "5-7 días hábiles",
    customization: "Bordado de nombre + temática a elección",
    eventType: "Cumpleaños infantil",
    active: true,
    featured: true,
    featuredOrder: 1,
    isBestseller: true,
    seoTitle: null,
    seoDesc: null,
    ogImageKey: null,
    createdAt: 0,
    updatedAt: 0,
    image: "/images/productos/fotos/morral-safari.jpg",
    gallery: ["/images/productos/fotos/morral-safari.jpg"],
  },
  {
    id: 2,
    name: "Lonchera Térmica Personalizada",
    slug: "lonchera-termica-personalizada",
    code: "LON-PER-02",
    categoryId: 2,
    categoryName: "Loncheras",
    categorySlug: "loncheras",
    shortDesc: "Lonchera térmica con nombre y temática del evento. Mantiene temperatura por horas.",
    longDesc:
      "Lonchera térmica de neopreno con personalización full color. Incluye el nombre y la temática del evento. Ideal para recordatorios de cumpleaños, commenciones y celebraciones escolares.",
    price: 9500,
    priceType: "desde",
    minQty: 30,
    material: "Neopreno 3mm",
    colors: ["Azul", "Rosa", "Verde", "Amarillo"],
    dimensions: "22 × 18 × 8 cm",
    weight: "120 g",
    leadTime: "4-6 días hábiles",
    customization: "Estampado full color con nombre y diseño",
    eventType: "Cumpleaños / Escolar",
    active: true,
    featured: true,
    featuredOrder: 2,
    isNew: true,
    seoTitle: null,
    seoDesc: null,
    ogImageKey: null,
    createdAt: 0,
    updatedAt: 0,
    image: "/images/productos/fotos/lonchera.jpg",
    gallery: ["/images/productos/fotos/lonchera.jpg"],
  },
  {
    id: 3,
    name: "Cartuchera Decorada Premium",
    slug: "cartuchera-decorada-premium",
    code: "CAR-DEC-03",
    categoryId: 3,
    categoryName: "Cartucheras",
    categorySlug: "cartucheras",
    shortDesc: "Cartuchera cilíndrica con detalles bordados y nombre personalizado.",
    longDesc:
      "Cartuchera elegante con acabados premium. Personalización con nombre bordado y detalles decorativos según la ocasión. Perfecta como recuerdo de cumpleaños, baby shower y eventos escolares.",
    price: 7800,
    priceType: "desde",
    minQty: 30,
    material: "Lona + forro interior",
    colors: ["Rosa", "Azul", "Morado", "Verde menta"],
    dimensions: "20 × 8 cm",
    weight: "90 g",
    leadTime: "4-6 días hábiles",
    customization: "Bordado de nombre + diseño a elección",
    eventType: "Cumpleaños / Baby shower",
    active: true,
    featured: true,
    featuredOrder: 3,
    seoTitle: null,
    seoDesc: null,
    ogImageKey: null,
    createdAt: 0,
    updatedAt: 0,
    image: "/images/productos/fotos/cartuchera.jpg",
    gallery: ["/images/productos/fotos/cartuchera.jpg"],
  },
  {
    id: 4,
    name: "Tula Elegante para Quinceaños",
    slug: "tula-elegante-quinceanos",
    code: "TUL-QUI-04",
    categoryId: 4,
    categoryName: "Tulas",
    categorySlug: "tulas",
    shortDesc: "Tula de tela premium con monograma bordado. Elegante recuerdo para quinceaños.",
    longDesc:
      "Tula fabricada en tela premium con monograma bordado de la quinceañera. Un recuerdo elegante y funcional para celebrar los 15 años. Disponible en colores a coordinar con la decoración del evento.",
    price: 18500,
    priceType: "desde",
    minQty: 20,
    material: "Tela premium / Lona",
    colors: ["Rosé", "Champán", "Morado", "Negro", "Blanco"],
    dimensions: "40 × 35 cm",
    weight: "220 g",
    leadTime: "7-10 días hábiles",
    customization: "Bordado de monograma + color a elección",
    eventType: "Quinceaños",
    active: true,
    featured: true,
    featuredOrder: 4,
    isBestseller: true,
    seoTitle: null,
    seoDesc: null,
    ogImageKey: null,
    createdAt: 0,
    updatedAt: 0,
    image: "/images/productos/fotos/tula.jpg",
    gallery: ["/images/productos/fotos/tula.jpg"],
  },
  {
    id: 5,
    name: "Caja Recordatorio Premium",
    slug: "caja-recordatorio-premium",
    code: "REC-CAJ-05",
    categoryId: 6,
    categoryName: "Recordatorios",
    categorySlug: "recordatorios",
    shortDesc: "Caja decorativa con dulces y etiqueta personalizada. El recuerdo perfecto.",
    longDesc:
      "Caja recordatorio premium con acabados elegantes, lazo decorativo y etiqueta personalizada con el nombre del homenajeado y la fecha del evento. Se entrega lista para regalar. Disponible con dulces incluidos.",
    price: 6500,
    priceType: "desde",
    minQty: 50,
    material: "Cartón premium + tela",
    colors: ["Dorado", "Rosé", "Azul cielo", "Verde sage", "Personalizado"],
    dimensions: "12 × 12 × 6 cm",
    weight: "90 g",
    leadTime: "3-5 días hábiles",
    customization: "Etiqueta personalizada + lazo a coordinar",
    eventType: "Bautizo / Comunión / Boda",
    active: true,
    featured: true,
    featuredOrder: 5,
    isNew: true,
    seoTitle: null,
    seoDesc: null,
    ogImageKey: null,
    createdAt: 0,
    updatedAt: 0,
    image: "/images/productos/fotos/recordatorio.jpg",
    gallery: ["/images/productos/fotos/recordatorio.jpg"],
  },
  {
    id: 6,
    name: "Cangurera Temática Infantil",
    slug: "cangurera-tematica-infantil",
    code: "CAN-TEM-06",
    categoryId: 5,
    categoryName: "Cangureras",
    categorySlug: "cangureras",
    shortDesc: "Cangurera pequeña con diseño para repartir en la fiesta infantil.",
    longDesc:
      "Cangurera compacta y práctica, ideal para repartir como recuerdo en fiestas infantiles. Personalización con nombre y temática. Perfecta para dulces o pequeños obsequios.",
    price: 5500,
    priceType: "desde",
    minQty: 40,
    material: "Lona suave",
    colors: ["Naranja", "Rosa", "Turquesa", "Amarillo"],
    dimensions: "20 × 14 cm",
    weight: "80 g",
    leadTime: "3-5 días hábiles",
    customization: "Estampado con nombre + temática",
    eventType: "Cumpleaños infantil",
    active: true,
    featured: false,
    featuredOrder: 0,
    seoTitle: null,
    seoDesc: null,
    ogImageKey: null,
    createdAt: 0,
    updatedAt: 0,
    image: "/images/productos/fotos/cangurera.jpg",
    gallery: ["/images/productos/fotos/cangurera.jpg"],
  },
  {
    id: 7,
    name: "Piñata Estrella Tradicional",
    slug: "pinata-estrella-tradicional",
    code: "PIN-EST-07",
    categoryId: 7,
    categoryName: "Piñatería",
    categorySlug: "pinateria",
    shortDesc: "Piñata estrella de colores vibrantes, la clásica de toda fiesta infantil.",
    longDesc:
      "Piñata estrella tradicional de colores vibrantes, fabricada con papel de china y cartón resistente. Incluye el palo para romperla. Disponible en diferentes tamaños y combinaciones de color según la temática del evento.",
    price: 35000,
    priceType: "unitario",
    minQty: 1,
    material: "Cartón + papel de china",
    colors: ["Multicolor", "Personalizado"],
    dimensions: "50 × 50 cm",
    weight: "1.2 kg",
    leadTime: "2-4 días hábiles",
    customization: "Colores a coordinar con la temática",
    eventType: "Cumpleaños infantil",
    active: true,
    featured: false,
    featuredOrder: 0,
    seoTitle: null,
    seoDesc: null,
    ogImageKey: null,
    createdAt: 0,
    updatedAt: 0,
    image: "/images/productos/fotos/pinateria.jpg",
    gallery: ["/images/productos/fotos/pinateria.jpg"],
  },
  {
    id: 8,
    name: "Morral Escolar Personalizado",
    slug: "morral-escolar-personalizado",
    code: "MAR-ESC-08",
    categoryId: 1,
    categoryName: "Morrales",
    categorySlug: "morrales",
    shortDesc: "Morral robusto para uso escolar con nombre bordado y diseño a elección.",
    longDesc:
      "Morral escolar de alta resistencia con personalización de nombre y temática. Ideal para commemoraciones escolares, graduaciones y eventos educativos. Capacioso y duradero.",
    price: 22000,
    priceType: "desde",
    minQty: 25,
    material: "Lona reforzada",
    colors: ["Verde", "Azul marino", "Negro", "Burdeo"],
    dimensions: "40 × 32 × 15 cm",
    weight: "320 g",
    leadTime: "7-10 días hábiles",
    customization: "Bordado de nombre + logo/escudo opcional",
    eventType: "Escolar / Empresarial",
    active: true,
    featured: false,
    featuredOrder: 0,
    seoTitle: null,
    seoDesc: null,
    ogImageKey: null,
    createdAt: 0,
    updatedAt: 0,
    image: "/images/productos/fotos/morral-escolar.jpg",
    gallery: ["/images/productos/fotos/morral-escolar.jpg"],
  },
];

// Helper para buscar por slug de categoría
export function getProductsByCategory(slug: string): SampleProduct[] {
  return sampleProducts.filter((p) => p.categorySlug === slug);
}

export function getCategoryBySlug(slug: string) {
  return sampleCategories.find((c) => c.slug === slug);
}
