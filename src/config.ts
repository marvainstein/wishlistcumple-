/**
 * Conexión a Supabase para las reservas compartidas.
 * Son claves públicas (publishable): están pensadas para ir en el navegador.
 * Se pueden sobreescribir con VITE_SUPABASE_URL / VITE_SUPABASE_KEY.
 */
export const SUPABASE_URL: string =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://jxkyxisirfqysjyejlrt.supabase.co';

export const SUPABASE_KEY: string =
  import.meta.env.VITE_SUPABASE_KEY ?? 'sb_publishable_8xkmfMKaGqMV__-HHV4jfg_S9fbQ3-X';

/** Foto de fondo de toda la página (en /public). */
export const SCENE_IMAGE = 'scene/paisaje.jpg';

/** Foto del sol (en /public), recortada cuadrada y centrada en el sol. */
export const SUN_IMAGE = 'scene/sol.jpg';

/**
 * Cara que se superpone en el centro del sol (archivo en /public, por ejemplo
 * "scene/luli-sol.jpg"). Si queda vacío, se ve el sol de la foto tal cual.
 */
export const SUN_FACE: string | undefined = 'scene/luli-sol.jpg';

/**
 * Canción que suena al entrar (archivo en /public). Si el archivo no existe,
 * la web funciona igual y el botón de música no aparece.
 */
export const MUSIC_SRC = 'audio/cancion.mp3';
