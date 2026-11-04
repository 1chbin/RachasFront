import { getApiBaseUrl } from './apiBaseUrl';

export function resolveWsBaseUrl(): string {
  const wsFromEnv = process.env.EXPO_PUBLIC_WS_URL?.replace(/\/$/, '');
  if (wsFromEnv) {
    return wsFromEnv;
  }
  return getApiBaseUrl();
}
