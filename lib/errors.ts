import { getApiBaseUrl } from '@/lib/apiBaseUrl';
import { connectionHelpMessage } from '@/lib/serverConfig';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function mensajeErrorAmigable(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return error.message || 'Los datos no son válidos.';
      case 403:
        return error.message || 'No tenés permiso para hacer esta acción.';
      case 404:
        return 'No encontramos lo que buscás.';
      case 409:
        return error.message || 'No se puede completar por el estado actual.';
      default:
        return error.message || 'Ocurrió un error en el servidor.';
    }
  }
  if (error instanceof TypeError) {
    return connectionHelpMessage(getApiBaseUrl());
  }
  if (error instanceof Error && error.message === 'Network request failed') {
    return connectionHelpMessage(getApiBaseUrl());
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ocurrió un error inesperado.';
}
