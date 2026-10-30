import * as Haptics from 'expo-haptics';
import { usePathname } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { AlientoTopToast } from '@/components/aliento/AlientoTopToast';
import { useSession } from '@/context/SessionContext';
import type { AlientoRecibidoPayload } from '@/lib/alientoEmojis';
import { listarMisDesafios } from '@/services/api/desafios';
import { REALTIME_EVENT } from '@/services/realtime/realtimeEvents';
import {
  ensureSocketConnected,
  getSocket,
  suscribirDesafio,
} from '@/services/realtime/socketClient';
import type { DesafioResumen } from '@/types/api';

const DISMISS_MS = 3500;

type ToastNotification = {
  visible: boolean;
  emoji: string;
  remitenteAlias: string;
  desafioNombre?: string;
};

export type CenterAlientoState = {
  visible: boolean;
  emoji: string;
  remitenteAlias: string;
  desafioId: string;
};

const initialToast: ToastNotification = {
  visible: false,
  emoji: '',
  remitenteAlias: '',
};

type AlientoNotificationsContextValue = {
  refrescarSuscripcionesAliento: () => Promise<void>;
  centerAliento: CenterAlientoState | null;
  dismissCenterAliento: () => void;
};

const AlientoNotificationsContext =
  createContext<AlientoNotificationsContextValue | null>(null);

function esDesafioVigente(estado: DesafioResumen['estado']): boolean {
  return estado === 'ACTIVO' || estado === 'PROGRAMADO';
}

function desafioIdEnPathname(pathname: string): string | null {
  const match = pathname.match(/^\/desafio\/([^/]+)/);
  return match?.[1] ?? null;
}

export function AlientoNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready, usuarioId } = useSession();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const [toastNotification, setToastNotification] =
    useState<ToastNotification>(initialToast);
  const [centerAliento, setCenterAliento] = useState<CenterAlientoState | null>(
    null,
  );
  const desafiosRef = useRef<Map<string, string>>(new Map());
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const dismissCenterAliento = useCallback(() => {
    clearDismissTimer();
    setCenterAliento((prev) => (prev ? { ...prev, visible: false } : null));
  }, [clearDismissTimer]);

  const hideToast = useCallback(() => {
    clearDismissTimer();
    setToastNotification((prev) => ({ ...prev, visible: false }));
  }, [clearDismissTimer]);

  const showNotification = useCallback(
    (payload: AlientoRecibidoPayload) => {
      clearDismissTimer();
      const openId = desafioIdEnPathname(pathnameRef.current);
      const useCenter =
        openId !== null && openId === payload.desafioId;
      const desafioNombre = desafiosRef.current.get(payload.desafioId);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => undefined,
      );

      if (useCenter) {
        setToastNotification((prev) => ({ ...prev, visible: false }));
        setCenterAliento({
          visible: true,
          emoji: payload.emoji,
          remitenteAlias: payload.remitenteAlias,
          desafioId: payload.desafioId,
        });
      } else {
        setCenterAliento((prev) => (prev ? { ...prev, visible: false } : null));
        setToastNotification({
          visible: true,
          emoji: payload.emoji,
          remitenteAlias: payload.remitenteAlias,
          desafioNombre,
        });
      }

      dismissTimerRef.current = setTimeout(() => {
        if (useCenter) {
          setCenterAliento((prev) => (prev ? { ...prev, visible: false } : null));
        } else {
          setToastNotification((prev) => ({ ...prev, visible: false }));
        }
        dismissTimerRef.current = null;
      }, DISMISS_MS);
    },
    [clearDismissTimer],
  );

  const refrescarSuscripcionesAliento = useCallback(async () => {
    if (!usuarioId) {
      return;
    }
    const socket = await ensureSocketConnected();
    if (!socket) {
      return;
    }

    try {
      const desafios = await listarMisDesafios();
      const vigentes = desafios.filter((d) => esDesafioVigente(d.estado));
      desafiosRef.current = new Map(vigentes.map((d) => [d.id, d.nombre]));
      await Promise.all(
        vigentes.map((d) =>
          suscribirDesafio(d.id).catch(() => ({ ok: false as const, message: '' })),
        ),
      );
    } catch {
      // Sin bloquear la app si falla el listado.
    }
  }, [usuarioId]);

  useEffect(() => {
    if (!ready || !usuarioId) {
      return;
    }

    let cancelled = false;
    let cleanupSocket: (() => void) | undefined;

    const onAliento = (payload: AlientoRecibidoPayload) => {
      if (payload.destinatarioUsuarioId !== usuarioId) {
        return;
      }
      showNotification(payload);
    };

    void (async () => {
      await refrescarSuscripcionesAliento();
      if (cancelled) {
        return;
      }
      const socket = await ensureSocketConnected();
      if (cancelled || !socket) {
        return;
      }
      socket.on(REALTIME_EVENT.ALIENTO_RECIBIDO, onAliento);

      const onReconnect = () => {
        void refrescarSuscripcionesAliento();
      };
      socket.io.on('reconnect', onReconnect);

      cleanupSocket = () => {
        socket.off(REALTIME_EVENT.ALIENTO_RECIBIDO, onAliento);
        socket.io.off('reconnect', onReconnect);
      };
    })();

    const appSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refrescarSuscripcionesAliento();
      }
    });

    return () => {
      cancelled = true;
      cleanupSocket?.();
      appSub.remove();
      clearDismissTimer();
    };
  }, [
    ready,
    usuarioId,
    refrescarSuscripcionesAliento,
    showNotification,
    clearDismissTimer,
  ]);

  const value = useMemo(
    () => ({
      refrescarSuscripcionesAliento,
      centerAliento,
      dismissCenterAliento,
    }),
    [refrescarSuscripcionesAliento, centerAliento, dismissCenterAliento],
  );

  return (
    <AlientoNotificationsContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        <AlientoTopToast
          visible={toastNotification.visible}
          emoji={toastNotification.emoji}
          remitenteAlias={toastNotification.remitenteAlias}
          desafioNombre={toastNotification.desafioNombre}
          onDismiss={hideToast}
        />
      </View>
    </AlientoNotificationsContext.Provider>
  );
}

export function useAlientoNotifications() {
  const ctx = useContext(AlientoNotificationsContext);
  if (!ctx) {
    throw new Error(
      'useAlientoNotifications debe usarse dentro de AlientoNotificationsProvider',
    );
  }
  return ctx;
}

export function useAlientoCenterForDesafio(desafioId: string | undefined) {
  const ctx = useContext(AlientoNotificationsContext);
  if (!ctx || !desafioId || !ctx.centerAliento) {
    return {
      visible: false,
      emoji: '',
      remitenteAlias: '',
      dismiss: () => undefined,
    };
  }
  const match = ctx.centerAliento.desafioId === desafioId;
  return {
    visible: match && ctx.centerAliento.visible,
    emoji: ctx.centerAliento.emoji,
    remitenteAlias: ctx.centerAliento.remitenteAlias,
    dismiss: ctx.dismissCenterAliento,
  };
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
