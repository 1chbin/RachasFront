import { resolveApiBaseUrl } from '@/lib/apiBaseUrl';
import { getStoredIdToken, setStoredIdToken } from '@/lib/authToken';
import { ApiError } from '@/lib/errors';
import { refreshFirebaseIdToken } from '@/services/auth/googleSignIn';
import { Platform } from 'react-native';

const baseUrl = resolveApiBaseUrl({
  platformOS: Platform.OS,
  apiUrlFromEnv: process.env.EXPO_PUBLIC_API_URL,
  apiUrlWebFromEnv: process.env.EXPO_PUBLIC_API_URL_WEB,
});

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
};

let onUnauthorized: (() => void) | null = null;

export function setApiUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

async function resolveAuthHeader(): Promise<string | null> {
  const stored = await getStoredIdToken();
  if (stored) {
    return stored;
  }
  return refreshFirebaseIdToken();
}

async function fetchWithAuth<T>(
  path: string,
  options: RequestOptions,
  retryOn401: boolean,
): Promise<T> {
  const { method = 'GET', body, auth = false } = options;
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = await resolveAuthHeader();
    if (!token) {
      throw new ApiError(401, 'No hay sesión activa');
    }
    headers.Authorization = `Bearer ${token}`;
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

  if (auth && response.status === 401 && retryOn401) {
    const refreshed = await refreshFirebaseIdToken();
    if (refreshed) {
      return fetchWithAuth(path, options, false);
    }
    onUnauthorized?.();
    throw new ApiError(401, 'Sesión vencida');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      onUnauthorized?.();
    }
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

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  return fetchWithAuth(path, options, true);
}

export function getApiBaseUrl(): string {
  return baseUrl;
}

export async function syncIdTokenFromFirebase(): Promise<string | null> {
  const token = await refreshFirebaseIdToken();
  if (token) {
    await setStoredIdToken(token);
  }
  return token;
}
