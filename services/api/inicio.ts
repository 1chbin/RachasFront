import { apiRequest } from './client';
import type { ResumenInicio } from '@/types/api';

export function obtenerResumenInicio(usuarioId: string) {
  return apiRequest<ResumenInicio>(`/usuarios/${usuarioId}/inicio`, {
    auth: true,
  });
}
