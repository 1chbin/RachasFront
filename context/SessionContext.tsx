import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { clearStoredIdToken, getStoredIdToken, setStoredIdToken } from '@/lib/authToken';
import { firebaseAuth } from '@/services/auth/firebaseApp';
import { signOutFirebase } from '@/services/auth/googleSignIn';
import { obtenerMe } from '@/services/api/usuarios';
import { setApiUnauthorizedHandler } from '@/services/api/client';
import type { Usuario } from '@/types/api';

type SessionContextValue = {
  ready: boolean;
  usuarioId: string | null;
  usuario: Usuario | null;
  cerrarSesion: () => Promise<void>;
  refrescarUsuario: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const limpiarSesion = useCallback(async () => {
    await signOutFirebase().catch(() => undefined);
    await clearStoredIdToken();
    setUsuario(null);
  }, []);

  const cargarPerfil = useCallback(async () => {
    const data = await obtenerMe();
    setUsuario(data);
  }, []);

  const refrescarUsuario = useCallback(async () => {
    await cargarPerfil();
  }, [cargarPerfil]);

  const cerrarSesion = useCallback(async () => {
    await limpiarSesion();
  }, [limpiarSesion]);

  useEffect(() => {
    setApiUnauthorizedHandler(() => {
      limpiarSesion();
    });
    return () => setApiUnauthorizedHandler(null);
  }, [limpiarSesion]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = await getStoredIdToken();
      if (stored) {
        try {
          await cargarPerfil();
        } catch {
          await clearStoredIdToken();
          if (!cancelled) {
            setUsuario(null);
          }
        }
      }
      if (!cancelled) {
        setReady(true);
      }
    })();

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (cancelled) {
        return;
      }
      if (!user) {
        const stored = await getStoredIdToken();
        if (!stored) {
          setUsuario(null);
        }
        return;
      }
      try {
        const token = await user.getIdToken();
        await setStoredIdToken(token);
        await cargarPerfil();
      } catch {
        await limpiarSesion();
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [cargarPerfil, limpiarSesion]);

  const usuarioId = usuario?.id ?? null;

  const value = useMemo(
    () => ({
      ready,
      usuarioId,
      usuario,
      cerrarSesion,
      refrescarUsuario,
    }),
    [ready, usuarioId, usuario, cerrarSesion, refrescarUsuario],
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
