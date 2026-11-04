export const DEFAULT_API_PORT =
  process.env.EXPO_PUBLIC_API_PORT?.trim() || '3000';

export const ANDROID_EMULATOR_HOST = '10.0.2.2';

export function buildLocalApiUrl(host: string): string {
  return `http://${host}:${DEFAULT_API_PORT}`;
}

export type ParsedBaseUrl = {
  host: string;
  port: string;
  origin: string;
};

export function parseBaseUrl(url: string): ParsedBaseUrl | null {
  try {
    const parsed = new URL(url);
    const port =
      parsed.port ||
      (parsed.protocol === 'https:'
        ? '443'
        : parsed.protocol === 'http:'
          ? '80'
          : DEFAULT_API_PORT);
    return {
      host: parsed.hostname,
      port,
      origin: parsed.origin,
    };
  } catch {
    return null;
  }
}

export function connectionHelpMessage(baseUrl: string): string {
  const parsed = parseBaseUrl(baseUrl);
  const portHint = parsed?.port ?? DEFAULT_API_PORT;
  const host = parsed?.host ?? '';

  if (host === 'localhost' || host === '127.0.0.1') {
    return (
      `No se pudo conectar al servidor en ${baseUrl}. ` +
      `¿Está corriendo RachasBack? En RachasBack/ ejecutá npm run start:dev y probá ${baseUrl}/health en el navegador. ` +
      `En web (tecla w), aunque EXPO_PUBLIC_API_URL sea una IP LAN o 10.0.2.2, la app usa localhost:${portHint} en esta PC.`
    );
  }

  return (
    `No se pudo conectar al servidor en ${baseUrl}. ` +
    `¿Está corriendo RachasBack? Probá ${baseUrl}/health. ` +
    `En Expo Go físico, EXPO_PUBLIC_API_URL debe usar la misma IP que Metro (exp://192.168.x.x:8081) con puerto ${portHint}, no 10.0.2.2. ` +
    `En emulador Android podés usar ${ANDROID_EMULATOR_HOST}:${portHint}.`
  );
}

export function connectionHelpMessageForHealthFailure(
  baseUrl: string,
  failure: 'network' | 'http_error',
  httpStatus?: number,
): string {
  if (
    failure === 'http_error' &&
    httpStatus !== undefined &&
    httpStatus >= 500
  ) {
    return (
      `RachasBack responde en ${baseUrl} pero GET /health devolvió ${httpStatus}. ` +
      `MongoDB Atlas no está conectado: en Atlas → Network Access agregá tu IP pública (o Allow from anywhere en dev). Revisá MONGODB_URI en RachasBack/.env.`
    );
  }
  return connectionHelpMessage(baseUrl);
}

export function connectionReachabilityHint(baseUrl: string): string {
  const parsed = parseBaseUrl(baseUrl);
  const host = parsed?.host ?? '';
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'Si el back no arranca, revisá la terminal de RachasBack (errores Nest). Ver README → Red dev.';
  }
  return 'Usá la misma IP que Metro (exp://192.168.x.x:8081) con puerto EXPO_PUBLIC_API_PORT. Ver README → Red dev.';
}
