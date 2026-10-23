export const WEB_DEV_API = 'http://localhost:3000';
export const ANDROID_EMULATOR_HOST = '10.0.2.2';
export const ANDROID_DEFAULT_API = `http://${ANDROID_EMULATOR_HOST}:3000`;

function trimTrailingSlash(url: string): string {
  return url.replace(/\/$/, '');
}

function hostnameFromApiUrl(apiUrl: string): string | null {
  try {
    return new URL(apiUrl).hostname;
  } catch {
    return null;
  }
}

/** Host típico de emulador o LAN para Expo Go; en web el navegador debe usar localhost. */
export function isPrivateLanOrEmulatorHost(host: string): boolean {
  if (host === ANDROID_EMULATOR_HOST) {
    return true;
  }
  if (host === 'localhost' || host === '127.0.0.1') {
    return false;
  }

  const parts = host.split('.').map((segment) => Number(segment));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return false;
  }

  const [a, b] = parts;
  if (a === 10) {
    return true;
  }
  if (a === 192 && b === 168) {
    return true;
  }
  if (a === 172 && b >= 16 && b <= 31) {
    return true;
  }
  return false;
}

export type ResolveApiBaseUrlInput = {
  platformOS: string;
  apiUrlFromEnv?: string;
  apiUrlWebFromEnv?: string;
};

export function resolveApiBaseUrl(input: ResolveApiBaseUrlInput): string {
  const fromEnv = input.apiUrlFromEnv
    ? trimTrailingSlash(input.apiUrlFromEnv)
    : undefined;
  const webOverride = input.apiUrlWebFromEnv
    ? trimTrailingSlash(input.apiUrlWebFromEnv)
    : undefined;

  if (input.platformOS === 'web') {
    if (webOverride) {
      return webOverride;
    }
    if (!fromEnv) {
      return WEB_DEV_API;
    }
    const host = hostnameFromApiUrl(fromEnv);
    if (host && isPrivateLanOrEmulatorHost(host)) {
      return WEB_DEV_API;
    }
    return fromEnv;
  }

  return fromEnv ?? ANDROID_DEFAULT_API;
}
