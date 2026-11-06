import { getApiBaseUrl } from '@/lib/apiBaseUrl';
import { connectionHelpMessageForHealthFailure } from '@/lib/serverConfig';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

const HEALTH_TIMEOUT_MS = 8_000;

export type DevBackReachabilityState = {
  checked: boolean;
  ok: boolean;
  healthUrl: string;
  message: string | null;
};

export function useDevBackReachability(): DevBackReachabilityState {
  const [state, setState] = useState<DevBackReachabilityState>({
    checked: false,
    ok: true,
    healthUrl: '',
    message: null,
  });
  const alertShown = useRef(false);

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    const baseUrl = getApiBaseUrl();
    const healthUrl = `${baseUrl}/health`;
    let cancelled = false;

    (async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
      try {
        const response = await fetch(healthUrl, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        if (cancelled) {
          return;
        }
        if (response.ok) {
          setState({ checked: true, ok: true, healthUrl, message: null });
          return;
        }
        const msg = connectionHelpMessageForHealthFailure(
          baseUrl,
          'http_error',
          response.status,
        );
        console.warn('[dev] RachasBack health:', response.status, healthUrl);
        setState({
          checked: true,
          ok: false,
          healthUrl,
          message: msg,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }
        const msg = connectionHelpMessageForHealthFailure(baseUrl, 'network');
        console.warn('[dev] RachasBack no alcanzable:', healthUrl, error);
        setState({
          checked: true,
          ok: false,
          healthUrl,
          message: msg,
        });
      } finally {
        clearTimeout(timeoutId);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!__DEV__ || !state.checked || state.ok || alertShown.current) {
      return;
    }
    alertShown.current = true;
    Alert.alert(
      'Back no alcanzable (dev)',
      `${state.message ?? ''}\n\nProbado: ${state.healthUrl}\n\nVer RachasFront/README.md → Red dev.`,
    );
  }, [state]);

  return state;
}
