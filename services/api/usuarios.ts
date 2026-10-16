import { apiRequest } from './client';
import type { Usuario } from '@/types/api';

export function listarUsuarios() {
  return apiRequest<Usuario[]>('/usuarios');
}

export function crearUsuario(body: {
  nombre: string;
  alias: string;
  email: string;
  zonaHoraria?: string;
}) {
  return apiRequest<Usuario>('/usuarios', { method: 'POST', body });
}

export function obtenerUsuario(id: string) {
  return apiRequest<Usuario>(`/usuarios/${id}`);
}

export function actualizarUsuario(
  id: string,
  body: { nombre?: string; zonaHoraria?: string },
) {
  return apiRequest<Usuario>(`/usuarios/${id}`, {
    method: 'PATCH',
    body,
    auth: true,
  });
}
