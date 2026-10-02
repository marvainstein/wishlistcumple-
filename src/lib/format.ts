/** "https://www.mercadolibre.com.ar/..." -> "mercadolibre.com.ar" */
export function storeName(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

/** nombre de archivo "de época" para la barra de título: "molinillo-cafe.wish" */
export function wishFile(id: string): string {
  return `${id}.wish`;
}
