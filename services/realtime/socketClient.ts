import { io, Socket } from 'socket.io-client';
import { resolveWsBaseUrl } from '@/lib/wsBaseUrl';
import { getStoredIdToken } from '@/lib/authToken';
import { refreshFirebaseIdToken } from '@/services/auth/googleSignIn';
import {
  REALTIME_EVENT,
  type SuscribirAck,
} from '@/services/realtime/realtimeEvents';

let socket: Socket | null = null;
let connecting: Promise<Socket | null> | null = null;

async function resolveToken(): Promise<string | null> {
  const stored = await getStoredIdToken();
  if (stored) {
    return stored;
  }
  return refreshFirebaseIdToken();
}

function attachSocket(instance: Socket): Socket {
  socket = instance;
  return instance;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }
  socket = null;
  connecting = null;
}

export async function ensureSocketConnected(): Promise<Socket | null> {
  const token = await resolveToken();
  if (!token) {
    return null;
  }

  if (socket?.connected) {
    socket.auth = { token };
    return socket;
  }

  if (socket && !socket.connected) {
    socket.auth = { token };
    socket.connect();
    return new Promise((resolve) => {
      const onConnect = () => {
        socket?.off('connect_error', onError);
        resolve(socket);
      };
      const onError = () => {
        socket?.off('connect', onConnect);
        resolve(null);
      };
      socket?.once('connect', onConnect);
      socket?.once('connect_error', onError);
    });
  }

  if (connecting) {
    return connecting;
  }

  connecting = (async () => {
    let activeToken = token;
    const url = resolveWsBaseUrl();
    const instance = io(url, {
      autoConnect: true,
      auth: { token: activeToken },
      transports: ['websocket', 'polling'],
    });

    const connected = await new Promise<Socket | null>((resolve) => {
      const finish = (value: Socket | null) => {
        instance.off('connect', onConnect);
        instance.off('connect_error', onConnectError);
        resolve(value);
      };

      const onConnect = () => finish(attachSocket(instance));

      const onConnectError = async () => {
        const refreshed = await refreshFirebaseIdToken();
        if (refreshed && refreshed !== activeToken) {
          activeToken = refreshed;
          instance.auth = { token: refreshed };
          instance.connect();
          return;
        }
        instance.disconnect();
        finish(null);
      };

      instance.on('connect', onConnect);
      instance.on('connect_error', onConnectError);
    });

    connecting = null;
    return connected;
  })();

  return connecting;
}

export async function suscribirDesafio(
  desafioId: string,
): Promise<SuscribirAck> {
  const instance = await ensureSocketConnected();
  if (!instance) {
    return { ok: false, message: 'No hay sesión activa' };
  }

  return new Promise((resolve) => {
    instance.emit(
      REALTIME_EVENT.DESAFIO_SUSCRIBIR,
      { desafioId },
      (ack: SuscribirAck | undefined) => {
        resolve(ack ?? { ok: false, message: 'Sin respuesta del servidor' });
      },
    );
  });
}

export async function desuscribirDesafio(desafioId: string): Promise<void> {
  const instance = getSocket();
  if (!instance?.connected) {
    return;
  }

  return new Promise((resolve) => {
    instance.emit(
      REALTIME_EVENT.DESAFIO_DESUSCRIBIR,
      { desafioId },
      () => resolve(),
    );
  });
}

export async function resuscribirDesafio(
  desafioId: string,
): Promise<SuscribirAck> {
  const token = await refreshFirebaseIdToken();
  if (token && socket) {
    socket.auth = { token };
  }
  if (socket && !socket.connected) {
    socket.connect();
    await new Promise<void>((resolve) => {
      if (socket?.connected) {
        resolve();
        return;
      }
      socket?.once('connect', () => resolve());
      socket?.once('connect_error', () => resolve());
    });
  }
  return suscribirDesafio(desafioId);
}

export async function enviarAliento(input: {
  desafioId: string;
  destinatarioUsuarioId: string;
  emojiId: string;
}): Promise<SuscribirAck> {
  const instance = await ensureSocketConnected();
  if (!instance) {
    return { ok: false, message: 'No hay sesión activa' };
  }

  const suscripcion = await suscribirDesafio(input.desafioId);
  if (!suscripcion.ok) {
    return suscripcion;
  }

  return new Promise((resolve) => {
    instance.emit(
      REALTIME_EVENT.ALIENTO_ENVIAR,
      input,
      (ack: SuscribirAck | undefined) => {
        resolve(ack ?? { ok: false, message: 'Sin respuesta del servidor' });
      },
    );
  });
}
