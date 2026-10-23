import { apiRequest } from './client';
import type { ResumenInicio } from '@/types/api';

export function obtenerResumenInicio() {
  return apiRequest<ResumenInicio>('/usuarios/me/inicio', {
    auth: true,
  });
}
