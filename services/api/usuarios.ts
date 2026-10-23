import { apiRequest } from './client';
import type { Usuario } from '@/types/api';

export function obtenerMe() {
  return apiRequest<Usuario>('/usuarios/me', { auth: true });
}

export function actualizarUsuario(body: {
  nombre?: string;
  zonaHoraria?: string;
}) {
  return apiRequest<Usuario>('/usuarios/me', {
    method: 'PATCH',
    body,
    auth: true,
  });
}

export function actualizarAlias(alias: string) {
  return apiRequest<Usuario>('/usuarios/me/alias', {
    method: 'PATCH',
    body: { alias },
    auth: true,
  });
}
