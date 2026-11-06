import { ErrorUtils } from 'react-native';
import { getLastRequestId } from '@/services/api/client';
import { reportarErrorCliente } from '@/services/api/clientErrors';

let installed = false;

function formatGlobalErrorMessage(error: Error, isFatal: boolean): string {
  const fatal = isFatal ? '[fatal] ' : '';
  const stack = error.stack ? `\n${error.stack}`.slice(0, 1500) : '';
  return `${fatal}${error.name}: ${error.message}${stack}`.slice(0, 1900);
}

/**
 * Registra el manejador global de errores JS (React Native) y, en web, rechazos no manejados.
 * Idempotente.
 */
export function installGlobalErrorHandlers(): void {
  if (installed) {
    return;
  }
  installed = true;

  const previous = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    void reportarErrorCliente({
      mensaje: formatGlobalErrorMessage(error, Boolean(isFatal)),
      pantalla: 'global',
      requestId: getLastRequestId(),
    }).catch(() => undefined);

    if (previous) {
      previous(error, isFatal);
    }
  });

  if (typeof window === 'undefined') {
    return;
  }

  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const err =
      reason instanceof Error
        ? reason
        : new Error(
            typeof reason === 'string' ? reason : 'Unhandled promise rejection',
          );
    void reportarErrorCliente({
      mensaje: formatGlobalErrorMessage(err, false),
      pantalla: 'global_web_promise',
      requestId: getLastRequestId(),
    }).catch(() => undefined);
  };

  const onWindowError = (event: ErrorEvent) => {
    if (!event.error) {
      return;
    }
    const err =
      event.error instanceof Error
        ? event.error
        : new Error(event.message || 'window.error');
    void reportarErrorCliente({
      mensaje: formatGlobalErrorMessage(err, false),
      pantalla: 'global_web_window',
      requestId: getLastRequestId(),
    }).catch(() => undefined);
  };

  window.addEventListener('unhandledrejection', onUnhandledRejection);
  window.addEventListener('error', onWindowError);
}
