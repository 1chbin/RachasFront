import { getStoredUsuarioId } from '@/lib/session';
import { ApiError } from '@/lib/errors';
import { Platform } from 'react-native';

const ANDROID_EMULATOR_HOST = '10.0.2.2';
const WEB_DEV_API = 'http://localhost:3000';
const ANDROID_DEFAULT_API = `http://${ANDROID_EMULATOR_HOST}:3000`;

function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  const isWebWithEmulatorUrl =
    Platform.OS === 'web' &&
    fromEnv !== undefined &&
    fromEnv.includes(ANDROID_EMULATOR_HOST);

  if (fromEnv && !isWebWithEmulatorUrl) {
    return fromEnv;
  }
  if (Platform.OS === 'web') {
    return WEB_DEV_API;
  }
  return fromEnv ?? ANDROID_DEFAULT_API;
}

const baseUrl = resolveApiBaseUrl();

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, auth = false } = options;
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const usuarioId = await getStoredUsuarioId();
    if (!usuarioId) {
      throw new ApiError(401, 'No hay sesión activa');
    }
    headers['x-usuario-id'] = usuarioId;
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new TypeError('Network request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof payload.message === 'string'
        ? payload.message
        : Array.isArray(payload.message)
          ? payload.message.join(', ')
          : 'Error en la solicitud';
    throw new ApiError(response.status, message);
  }

  return payload as T;
}

export function getApiBaseUrl(): string {
  return baseUrl;
}
