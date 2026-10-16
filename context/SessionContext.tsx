import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  clearStoredUsuarioId,
  getStoredUsuarioId,
  setStoredUsuarioId,
} from '@/lib/session';
import { obtenerUsuario } from '@/services/api/usuarios';
import type { Usuario } from '@/types/api';

type SessionContextValue = {
  ready: boolean;
  usuarioId: string | null;
  usuario: Usuario | null;
  iniciarSesion: (id: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  refrescarUsuario: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const cargarUsuario = useCallback(async (id: string) => {
    const data = await obtenerUsuario(id);
    setUsuario(data);
  }, []);

  useEffect(() => {
    (async () => {
      const id = await getStoredUsuarioId();
      setUsuarioId(id);
      setReady(true);

      if (!id) {
        return;
      }

      try {
        await cargarUsuario(id);
      } catch {
        await clearStoredUsuarioId();
        setUsuarioId(null);
        setUsuario(null);
      }
    })();
  }, [cargarUsuario]);

  const iniciarSesion = useCallback(
    async (id: string) => {
      await setStoredUsuarioId(id);
      setUsuarioId(id);
      await cargarUsuario(id);
    },
    [cargarUsuario],
  );

  const cerrarSesion = useCallback(async () => {
    await clearStoredUsuarioId();
    setUsuarioId(null);
    setUsuario(null);
  }, []);

  const refrescarUsuario = useCallback(async () => {
    if (!usuarioId) return;
    await cargarUsuario(usuarioId);
  }, [cargarUsuario, usuarioId]);

  const value = useMemo(
    () => ({
      ready,
      usuarioId,
      usuario,
      iniciarSesion,
      cerrarSesion,
      refrescarUsuario,
    }),
    [ready, usuarioId, usuario, iniciarSesion, cerrarSesion, refrescarUsuario],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession debe usarse dentro de SessionProvider');
  }
  return ctx;
}
