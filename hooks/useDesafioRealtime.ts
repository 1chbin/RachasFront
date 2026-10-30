import { useEffect, useRef } from 'react';
import type { CheckIn, FilaRanking } from '@/types/api';
import { REALTIME_EVENT } from '@/services/realtime/realtimeEvents';
import {
  desuscribirDesafio,
  ensureSocketConnected,
  getSocket,
  resuscribirDesafio,
  suscribirDesafio,
} from '@/services/realtime/socketClient';

export type DesafioRealtimeHandlers = {
  usuarioId: string | null;
  onRanking?: (ranking: FilaRanking[]) => void;
  onCheckInAjeno?: (payload: {
    alias: string;
    usuarioId: string;
    checkIn: CheckIn;
  }) => void;
  onReconnect?: () => void;
  onDesafioCancelado?: () => void;
  onParticipanteChange?: () => void;
  onSuscripcionError?: (message: string) => void;
};

type RankingPayload = { desafioId: string; ranking: FilaRanking[] };
type CheckInPayload = {
  desafioId: string;
  usuarioId: string;
  alias: string;
  checkIn: CheckIn;
};

export function useDesafioRealtime(
  desafioId: string | undefined,
  handlers: DesafioRealtimeHandlers,
): void {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!desafioId) {
      return;
    }

    let cancelled = false;
    let teardown: (() => void) | null = null;

    const onRanking = (payload: RankingPayload) => {
      if (payload.desafioId !== desafioId) {
        return;
      }
      handlersRef.current.onRanking?.(payload.ranking ?? []);
    };

    const onCheckIn = (payload: CheckInPayload) => {
      if (payload.desafioId !== desafioId) {
        return;
      }
      const selfId = handlersRef.current.usuarioId;
      if (selfId && payload.usuarioId === selfId) {
        return;
      }
      handlersRef.current.onCheckInAjeno?.({
        alias: payload.alias,
        usuarioId: payload.usuarioId,
        checkIn: payload.checkIn,
      });
    };

    const onCheckInDeshecho = (payload: {
      desafioId: string;
      usuarioId: string;
    }) => {
      if (payload.desafioId !== desafioId) {
        return;
      }
      handlersRef.current.onParticipanteChange?.();
    };

    const onParticipante = (payload: { desafioId: string }) => {
      if (payload.desafioId !== desafioId) {
        return;
      }
      handlersRef.current.onParticipanteChange?.();
    };

    const onCancelado = (payload: { desafioId: string }) => {
      if (payload.desafioId !== desafioId) {
        return;
      }
      handlersRef.current.onDesafioCancelado?.();
    };

    const attachListeners = (
      socket: NonNullable<ReturnType<typeof getSocket>>,
    ) => {
      socket.on(REALTIME_EVENT.RANKING_ACTUALIZADO, onRanking);
      socket.on(REALTIME_EVENT.CHECKIN_REGISTRADO, onCheckIn);
      socket.on(REALTIME_EVENT.CHECKIN_DESHECHO, onCheckInDeshecho);
      socket.on(REALTIME_EVENT.PARTICIPANTE_UNIDO, onParticipante);
      socket.on(REALTIME_EVENT.PARTICIPANTE_ABANDONO, onParticipante);
      socket.on(REALTIME_EVENT.DESAFIO_CANCELADO, onCancelado);
    };

    const detachListeners = (
      socket: NonNullable<ReturnType<typeof getSocket>>,
    ) => {
      socket.off(REALTIME_EVENT.RANKING_ACTUALIZADO, onRanking);
      socket.off(REALTIME_EVENT.CHECKIN_REGISTRADO, onCheckIn);
      socket.off(REALTIME_EVENT.CHECKIN_DESHECHO, onCheckInDeshecho);
      socket.off(REALTIME_EVENT.PARTICIPANTE_UNIDO, onParticipante);
      socket.off(REALTIME_EVENT.PARTICIPANTE_ABANDONO, onParticipante);
      socket.off(REALTIME_EVENT.DESAFIO_CANCELADO, onCancelado);
    };

    const suscribir = async (esReconexion: boolean) => {
      const ack = esReconexion
        ? await resuscribirDesafio(desafioId)
        : await suscribirDesafio(desafioId);
      if (cancelled) {
        return;
      }
      if (!ack.ok) {
        handlersRef.current.onSuscripcionError?.(ack.message);
        return;
      }
      if (esReconexion) {
        handlersRef.current.onReconnect?.();
      }
    };

    void (async () => {
      const socket = await ensureSocketConnected();
      if (cancelled || !socket) {
        return;
      }

      attachListeners(socket);
      await suscribir(false);

      const onReconnect = () => {
        void suscribir(true);
      };
      socket.io.on('reconnect', onReconnect);

      teardown = () => {
        socket.io.off('reconnect', onReconnect);
        detachListeners(socket);
        void desuscribirDesafio(desafioId);
      };

      if (cancelled) {
        teardown();
        teardown = null;
      }
    })();

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [desafioId]);
}
