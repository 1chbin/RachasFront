import { getApiBaseUrl } from '@/lib/apiBaseUrl';
import { connectionHelpMessageForHealthFailure } from '@/lib/serverConfig';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

/** Por intento: RachasBack usa Mongo lazy; el primer /health puede dar 503 hasta que conecte. */
const HEALTH_ATTEMPT_TIMEOUT_MS = 10_000;
const HEALTH_MAX_ATTEMPTS = 5;
const HEALTH_RETRY_DELAY_MS = 1_500;

function delayMs(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isRequestAborted(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  if (error.name === 'AbortError') {
    return true;
  }
  const message = error.message.toLowerCase();
  return message.includes('cancel') || message.includes('abort');
}

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
      let lastStatus: number | undefined;
      let lastError: unknown;

      attemptLoop: for (let attempt = 0; attempt < HEALTH_MAX_ATTEMPTS; attempt += 1) {
        if (cancelled) {
          return;
        }
        if (attempt > 0) {
          await delayMs(HEALTH_RETRY_DELAY_MS);
        }
        if (cancelled) {
          return;
        }

        try {
          const response = await Promise.race([
            fetch(healthUrl, {
              method: 'GET',
              headers: { Accept: 'application/json' },
            }),
            delayMs(HEALTH_ATTEMPT_TIMEOUT_MS).then(() => {
              throw new Error('AbortError: health timeout');
            }),
          ]);
          lastStatus = response.status;
          if (cancelled) {
            return;
          }
          if (response.ok) {
            setState({ checked: true, ok: true, healthUrl, message: null });
            return;
          }
          // 503 suele ser Mongo aún conectándose (lazy) o Atlas; reintentar unas veces.
          if (response.status === 503 && attempt < HEALTH_MAX_ATTEMPTS - 1) {
            console.warn(
              '[dev] RachasBack health 503 (reintentando):',
              healthUrl,
              `intento ${attempt + 1}/${HEALTH_MAX_ATTEMPTS}`,
            );
            continue attemptLoop;
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
          return;
        } catch (error) {
          lastError = error;
          if (cancelled) {
            return;
          }
          if (isRequestAborted(error) && attempt < HEALTH_MAX_ATTEMPTS - 1) {
            console.warn(
              '[dev] RachasBack health timeout (reintentando):',
              healthUrl,
              `intento ${attempt + 1}/${HEALTH_MAX_ATTEMPTS}`,
            );
            continue attemptLoop;
          }
          const msg = connectionHelpMessageForHealthFailure(baseUrl, 'network');
          console.warn('[dev] RachasBack no alcanzable:', healthUrl, error);
          setState({
            checked: true,
            ok: false,
            healthUrl,
            message: msg,
          });
          return;
        }
      }

      if (cancelled) {
        return;
      }
      const msg = connectionHelpMessageForHealthFailure(
        baseUrl,
        lastStatus !== undefined ? 'http_error' : 'network',
        lastStatus,
      );
      console.warn('[dev] RachasBack health agotó reintentos:', healthUrl, {
        lastStatus,
        lastError,
      });
      setState({
        checked: true,
        ok: false,
        healthUrl,
        message: msg,
      });
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
