/**
 * LA WISHLIST
 * ------------------------------------------------------------------
 * Para agregar, quitar o editar un regalo, tocá solo este archivo.
 * Las fotos van en /public/products/ y se referencian como "products/archivo.jpg".
 *
 * Campos:
 *  id        identificador único y estable (se usa para las reservas, no lo cambies
 *            una vez publicado o se pierde la reserva de ese regalo).
 *  name      nombre del regalo.
 *  image     foto principal.  imageAlt: descripción de la foto (accesibilidad).
 *  url       link para comprarlo (opcional; sin url no aparece el botón de compra).
 *  linkLabel texto del botón del link si no es una tienda (ej: 'lo organizo yo').
 *  linkReserves true = tocar ese botón abre el link y además lo reserva para todos
 *            (reemplaza a "lo regalo yo"). linkLabelReserved: texto del link una vez reservado.
 *  note      nota personal (opcional).
 *  hearts    1 a 3, qué tanto lo quiero (opcional).
 *  size      talle / variante a comprar (opcional).
 *  reservedBy si alguien ya lo tiene asignado (ej: 'reservado por mis suegros'):
 *            se muestra como reservado para todos, con ese texto, y no se puede reservar.
 *  category, description, price: opcionales; solo se muestran si existen.
 *  look      cómo se presenta en la web:
 *            variant  'hardware' | 'blister' | 'snapshot' | 'window'
 *                     (window es el formato genérico para regalos nuevos)
 *            color    color de plástico de la card
 *            sticker  texto corto del sticker (opcional)
 */

export type PlasticColor = 'tangerine' | 'blueberry' | 'lime' | 'grape' | 'strawberry' | 'bondi' | 'graphite';
export type CardVariant = 'hardware' | 'blister' | 'snapshot' | 'window';

export interface Product {
  id: string;
  name: string;
  image: string;
  imageAlt: string;
  /** true si la foto es provisoria (se muestra una etiqueta "foto provisoria") */
  imageIsPlaceholder?: boolean;
  url?: string;
  /** texto del botón del link cuando no es "ir a comprar" */
  linkLabel?: string;
  linkLabelReserved?: string;
  /** el botón del link también reserva (sin paso de confirmación) */
  linkReserves?: boolean;
  note?: string;
  hearts?: 1 | 2 | 3;
  size?: string;
  /** ya asignado de antemano; el texto se muestra en el cartel */
  reservedBy?: string;
  category?: string;
  description?: string;
  price?: string;
  look?: {
    variant?: CardVariant;
    color?: PlasticColor;
    sticker?: string;
  };
}

export const products: Product[] = [
  {
    id: 'spa-circuito',
    name: 'Sesión de circuito de spa',
    image: 'products/spa-circuito.jpg',
    imageAlt: 'Luli relajándose al sol entre las plantas, con los ojos entrecerrados',
    url: 'https://topsecretspa.com/producto/experiencia-360/',
    note: 'Quiero relajarme así como Luli en la foto. La verdad me vendría bárbaro un spa.',
    hearts: 3,
    look: { variant: 'snapshot', color: 'strawberry', sticker: 'modo Luli' },
  },
  {
    id: 'molinillo-cafe',
    name: 'Molinillo de Café',
    image: 'products/molinillo-cafe.webp',
    imageAlt: 'Molinillo de café eléctrico de acero inoxidable con tolva translúcida llena de granos, display digital y tres botones con luz azul',
    url: 'https://www.mercadolibre.com.ar/molinillo-de-cafe-electrico-cuk-by-gadnic-acero-inoxidable-regulable-fresa-conica-tolva-275g-jarra-100g/p/MLA25021181#polycard_client=search-desktop&be_origin=backend&overlay_label=not_apply&search_layout=grid&position=11&type=product&tracking_id=10039f25-d9a9-4835-8e34-22d219772ecc&wid=MLA1386952901&sid=search',
    note: 'Perfecto para moler los 60 gramos de café para el cold brewcito de verano.',
    hearts: 2,
    look: { variant: 'hardware', color: 'blueberry', sticker: '60 g' },
  },
  {
    id: 'cafe-guatemala-geisha',
    name: 'Café Guatemala Geisha Lavado 250gr',
    image: 'products/cafe-guatemala-geisha.webp',
    imageAlt: 'Bolsa blanca de café Puerto Blest "Guatemala, Santa Rita, Geisha lavado" apoyada sobre un estante de piedra',
    url: 'https://www.cafepuertoblest.com/productos/guatemala-geisha-lavado/?recommendation_source=complementary-carousel&recommender=manual',
    hearts: 3,
    reservedBy: 'reservado por mis suegros',
    look: { variant: 'window', color: 'lime' },
  },
  {
    id: 'vela-glowy',
    name: 'Vela Glowy - Brownish',
    image: 'products/vela-glowy.webp',
    imageAlt: 'Vela de cera de soja en un recipiente de vidrio ámbar acanalado, con la tapa apoyada al lado, bajo la luz del sol',
    url: 'https://www.blancadecocafe.com.ar/productos/vela-glowy/',
    note: 'Me encanta prender velitas y tener rico aroma antes de dormir, sería hermoso.',
    look: { variant: 'window', color: 'tangerine', sticker: 'bonus' },
  },
  {
    id: 'merienda-fifa',
    name: 'Merienda / Cena y Fifa con Waldo y Daro',
    image: 'products/fifa-waldo-daro.jpg',
    imageAlt: 'Dos chicos sentados en el piso frente a un televisor de tubo, jugando al fútbol en la PlayStation y mirando a cámara',
    note: 'Una rica merienda o cenita por el barrio y unos partidos de Fifa.',
    hearts: 3,
    url: 'https://chat.whatsapp.com/Jznw13dDPag9yZs60MCgUf',
    linkLabel: 'lo organizo yo',
    linkLabelReserved: 'ir al grupo de WhatsApp',
    linkReserves: true,
    look: { variant: 'snapshot', color: 'grape', sticker: 'FIFA' },
  },
];
