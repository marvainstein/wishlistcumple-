import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchReservedIds, reserveRemote, unreserveRemote } from './reservationsApi';
import { readJSON, writeJSON } from './storage';

/**
 * Estado de reservas.
 *  - online: reservas compartidas en Supabase (todos ven lo mismo).
 *  - local:  si Supabase no responde, se guardan en este navegador nomás.
 * "mine" son los regalos que reservaste vos desde este navegador (podés deshacerlos).
 */

export type SyncMode = 'connecting' | 'online' | 'local';
export type ReserveResult = 'ok' | 'taken' | 'error';

const TOKEN_KEY = 'wishos.token';
const MINE_KEY = 'wishos.mine';
const LOCAL_KEY = 'wishos.localReserved';
const REFRESH_MS = 45_000;

function getToken(): string {
  let token = readJSON<string | null>(TOKEN_KEY, null);
  if (!token) {
    token = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    writeJSON(TOKEN_KEY, token);
  }
  return token;
}

export function useReservations() {
  const [mode, setMode] = useState<SyncMode>('connecting');
  const [reserved, setReserved] = useState<Set<string>>(() => new Set());
  const [mine, setMine] = useState<Set<string>>(() => new Set(readJSON<string[]>(MINE_KEY, [])));
  const tokenRef = useRef<string>('');
  if (!tokenRef.current) tokenRef.current = getToken();

  const saveMine = (next: Set<string>) => {
    setMine(next);
    writeJSON(MINE_KEY, [...next]);
  };

  const goLocal = useCallback(() => {
    setMode('local');
    setReserved(new Set(readJSON<string[]>(LOCAL_KEY, [])));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const ids = await fetchReservedIds();
      setReserved(new Set(ids));
      setMode('online');
    } catch {
      goLocal();
    }
  }, [goLocal]);

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    const timer = window.setInterval(refresh, REFRESH_MS);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.clearInterval(timer);
    };
  }, [refresh]);

  const reserve = useCallback(
    async (id: string): Promise<ReserveResult> => {
      if (mode !== 'local') {
        try {
          const ok = await reserveRemote(id, tokenRef.current);
          await refresh();
          if (!ok) return 'taken';
          saveMine(new Set(mine).add(id));
          return 'ok';
        } catch {
          return 'error';
        }
      }
      const next = new Set(reserved).add(id);
      setReserved(next);
      writeJSON(LOCAL_KEY, [...next]);
      saveMine(new Set(mine).add(id));
      return 'ok';
    },
    [mode, reserved, mine, refresh],
  );

  const unreserve = useCallback(
    async (id: string): Promise<boolean> => {
      const nextMine = new Set(mine);
      nextMine.delete(id);
      if (mode !== 'local') {
        try {
          await unreserveRemote(id, tokenRef.current);
          await refresh();
          saveMine(nextMine);
          return true;
        } catch {
          return false;
        }
      }
      const next = new Set(reserved);
      next.delete(id);
      setReserved(next);
      writeJSON(LOCAL_KEY, [...next]);
      saveMine(nextMine);
      return true;
    },
    [mode, reserved, mine, refresh],
  );

  return { mode, reserved, mine, reserve, unreserve };
}

export type Reservations = ReturnType<typeof useReservations>;
