import { apiRequest } from './client';
import type { CheckIn, Paginated } from '@/types/api';

export function registrarCheckIn(
  desafioId: string,
  body: { dia: string; nota?: string; valor?: number },
) {
  return apiRequest<CheckIn>(`/desafios/${desafioId}/check-ins`, {
    method: 'POST',
    body,
    auth: true,
  });
}

export function deshacerUltimoCheckIn(desafioId: string) {
  return apiRequest<{ mensaje: string }>(
    `/desafios/${desafioId}/check-ins/ultimo`,
    { method: 'DELETE', auth: true },
  );
}

export function listarCheckIns(
  desafioId: string,
  usuarioId: string,
  page = 1,
  limit = 20,
) {
  const query = new URLSearchParams({
    usuarioId,
    page: String(page),
    limit: String(limit),
  });
  return apiRequest<Paginated<CheckIn>>(
    `/desafios/${desafioId}/check-ins?${query.toString()}`,
  );
}
