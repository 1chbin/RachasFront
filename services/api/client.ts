import { getApiBaseUrl } from '@/lib/apiBaseUrl';
import { apiPath } from '@/lib/apiPrefix';
import { connectionHelpMessage } from '@/lib/serverConfig';
import { getStoredIdToken, setStoredIdToken } from '@/lib/authToken';
import { ApiError } from '@/lib/errors';
import { refreshFirebaseIdToken } from '@/services/auth/googleSignIn';
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

const APP_VERSION =
  Constants.expoConfig?.version ??
  (Constants as { manifest?: { version?: string } }).manifest?.version ??
  '1.1.0';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
};

let onUnauthorized: (() => void) | null = null;
let onUpgradeRequired: (() => void) | null = null;

export function setApiUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export function setApiUpgradeRequiredHandler(handler: (() => void) | null) {
  onUpgradeRequired = handler;
}

export function getAppVersion(): string {
  return APP_VERSION;
}

async function resolveAuthHeader(): Promise<string | null> {
  const stored = await getStoredIdToken();
  if (stored) {
    return stored;
  }
  return refreshFirebaseIdToken();
}

const API_REQUEST_TIMEOUT_MS = 15_000;

async function fetchWithAuth<T>(
  path: string,
  options: RequestOptions,
  retryOn401: boolean,
): Promise<T> {
  const { method = 'GET', body, auth = false } = options;
  const requestId = Crypto.randomUUID();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'x-request-id': requestId,
    'x-app-version': APP_VERSION,
    'x-platform': Platform.OS,
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
  const baseUrl = getApiBaseUrl();
  const requestUrl = `${baseUrl}${apiPath(path)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);
  try {
    response = await fetch(requestUrl, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        `Tiempo de espera agotado (${API_REQUEST_TIMEOUT_MS / 1000}s) al conectar con ${baseUrl}. ¿Está corriendo RachasBack? Probá ${baseUrl}/health.`,
      );
    }
    const detail =
      error instanceof Error && error.message
        ? error.message
        : 'Network request failed';
    throw new Error(`${connectionHelpMessage(baseUrl)} (${detail})`);
  } finally {
    clearTimeout(timeoutId);
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
    if (response.status === 426) {
      onUpgradeRequired?.();
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

export async function apiRequestPublic<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  return fetchWithAuth(path, { ...options, auth: false }, false);
}

export { getApiBaseUrl } from '@/lib/apiBaseUrl';

export async function syncIdTokenFromFirebase(): Promise<string | null> {
  const token = await refreshFirebaseIdToken();
  if (token) {
    await setStoredIdToken(token);
  }
  return token;
}
