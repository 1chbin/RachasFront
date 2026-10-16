import { apiRequest } from './client';
import type { RankingResponse, RachaResponse } from '@/types/api';

export function obtenerRanking(desafioId: string) {
  return apiRequest<RankingResponse>(`/desafios/${desafioId}/ranking`, {
    auth: true,
  });
}

export function obtenerRacha(desafioId: string) {
  return apiRequest<RachaResponse>(`/desafios/${desafioId}/racha`, {
    auth: true,
  });
}
