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
import { router } from 'expo-router';
import { obtenerMe } from '@/services/api/usuarios';
import { setApiUnauthorizedHandler, setApiUpgradeRequiredHandler } from '@/services/api/client';
import { track, flushAnalyticsQueue } from '@/services/analytics/track';
import { disconnectSocket } from '@/services/realtime/socketClient';
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
    disconnectSocket();
    await signOutFirebase().catch(() => undefined);
    await clearStoredIdToken();
    setUsuario(null);
  }, []);

  const cargarPerfil = useCallback(async () => {
    const data = await obtenerMe();
    setUsuario(data);
    await track('ingreso_exitoso', { requiere_alias: Boolean(data.requiereAlias) });
    await flushAnalyticsQueue().catch(() => undefined);
  }, []);

  const refrescarUsuario = useCallback(async () => {
    await cargarPerfil();
  }, [cargarPerfil]);

  const cerrarSesion = useCallback(async () => {
    await limpiarSesion();
  }, [limpiarSesion]);

  useEffect(() => {
    setApiUpgradeRequiredHandler(() => {
      router.replace('/actualizar');
    });
    return () => setApiUpgradeRequiredHandler(null);
  }, []);

  useEffect(() => {
    setApiUnauthorizedHandler(() => {
      void limpiarSesion().then(() => {
        router.replace('/(auth)/ingreso');
      });
    });
    return () => setApiUnauthorizedHandler(null);
  }, [limpiarSesion]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = await getStoredIdToken();
      if (!cancelled) {
        setReady(true);
      }
      if (stored && !cancelled) {
        try {
          await cargarPerfil();
        } catch {
          await clearStoredIdToken();
          if (!cancelled) {
            setUsuario(null);
          }
        }
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
