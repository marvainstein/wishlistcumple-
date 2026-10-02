/**
 * Conexión a Supabase para las reservas compartidas.
 * Son claves públicas (publishable): están pensadas para ir en el navegador.
 * Se pueden sobreescribir con VITE_SUPABASE_URL / VITE_SUPABASE_KEY.
 */
export const SUPABASE_URL: string =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://jxkyxisirfqysjyejlrt.supabase.co';

export const SUPABASE_KEY: string =
  import.meta.env.VITE_SUPABASE_KEY ?? 'sb_publishable_8xkmfMKaGqMV__-HHV4jfg_S9fbQ3-X';

/**
 * Cara del sol: una foto (archivo en /public, por ejemplo "luli-sol.jpg").
 * Si queda vacío, el sol lleva una carita dibujada.
 */
export const SUN_FACE: string | undefined = undefined;
