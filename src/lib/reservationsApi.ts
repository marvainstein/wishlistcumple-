import { SUPABASE_KEY, SUPABASE_URL } from '../config';

/**
 * Cliente mínimo de la API REST de Supabase (sin SDK, ~0 kB).
 * Tabla: reservations(product_id, created_at). Escritura solo vía las
 * funciones reserve / unreserve, que validan el token de quien reservó.
 */

const headers = {
  apikey: SUPABASE_KEY,
  'Content-Type': 'application/json',
};

const TIMEOUT_MS = 8000;

async function request(path: string, init?: RequestInit): Promise<unknown> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${SUPABASE_URL}${path}`, { ...init, headers, signal: controller.signal });
    if (!res.ok) throw new Error(`Supabase respondió ${res.status}`);
    return await res.json();
  } finally {
    window.clearTimeout(timer);
  }
}

export async function fetchReservedIds(): Promise<string[]> {
  const rows = (await request('/rest/v1/reservations?select=product_id')) as { product_id: string }[];
  return rows.map((r) => r.product_id);
}

/** true si quedó reservado a tu nombre; false si alguien lo reservó antes. */
export async function reserveRemote(productId: string, token: string): Promise<boolean> {
  return (await request('/rest/v1/rpc/reserve', {
    method: 'POST',
    body: JSON.stringify({ p_product_id: productId, p_token: token }),
  })) as boolean;
}

export async function unreserveRemote(productId: string, token: string): Promise<boolean> {
  return (await request('/rest/v1/rpc/unreserve', {
    method: 'POST',
    body: JSON.stringify({ p_product_id: productId, p_token: token }),
  })) as boolean;
}
