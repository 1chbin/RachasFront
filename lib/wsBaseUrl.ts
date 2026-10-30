import { Platform } from 'react-native';
import { resolveApiBaseUrl } from './apiBaseUrl';

export function resolveWsBaseUrl(): string {
  const wsFromEnv = process.env.EXPO_PUBLIC_WS_URL?.replace(/\/$/, '');
  if (wsFromEnv) {
    return wsFromEnv;
  }
  return resolveApiBaseUrl({
    platformOS: Platform.OS,
    apiUrlFromEnv: process.env.EXPO_PUBLIC_API_URL,
    apiUrlWebFromEnv: process.env.EXPO_PUBLIC_API_URL_WEB,
  });
}
