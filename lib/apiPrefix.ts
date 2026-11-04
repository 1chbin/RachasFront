const DEFAULT_PREFIX = '/v2';

export function resolveApiPathPrefix(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_PREFIX?.trim();
  if (!fromEnv) {
    return DEFAULT_PREFIX;
  }
  const normalized = fromEnv.startsWith('/') ? fromEnv : `/${fromEnv}`;
  return normalized.replace(/\/$/, '') || DEFAULT_PREFIX;
}

export function apiPath(path: string): string {
  const prefix = resolveApiPathPrefix();
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${prefix}${suffix}`;
}
