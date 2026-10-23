import { apiRequest } from './client';
import type { DesafioResumen, Paginated, Participante } from '@/types/api';

export function listarDesafios(params: {
  page?: number;
  limit?: number;
  estado?: string;
  categoria?: string;
}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.estado) query.set('estado', params.estado);
  if (params.categoria) query.set('categoria', params.categoria);
  const qs = query.toString();
  return apiRequest<Paginated<DesafioResumen>>(
    `/desafios${qs ? `?${qs}` : ''}`,
    { auth: true },
  );
}

export function obtenerDesafio(id: string) {
  return apiRequest<DesafioResumen>(`/desafios/${id}`, { auth: true });
}

export function crearDesafio(body: {
  nombre: string;
  descripcion?: string;
  categoria: string;
  fechaInicio: string;
  fechaFin: string;
  maxParticipantes?: number;
}) {
  return apiRequest<DesafioResumen>('/desafios', {
    method: 'POST',
    body,
    auth: true,
  });
}

export function unirseDesafio(codigoInvitacion: string) {
  return apiRequest<{ desafio: DesafioResumen }>('/desafios/unirse', {
    method: 'POST',
    body: { codigoInvitacion },
    auth: true,
  });
}

export function abandonarDesafio(id: string) {
  return apiRequest<{ mensaje: string }>(`/desafios/${id}/abandonar`, {
    method: 'POST',
    auth: true,
  });
}

export function cancelarDesafio(id: string) {
  return apiRequest<DesafioResumen>(`/desafios/${id}/cancelar`, {
    method: 'POST',
    auth: true,
  });
}

export function listarParticipantes(desafioId: string) {
  return apiRequest<Participante[]>(`/desafios/${desafioId}/participantes`, {
    auth: true,
  });
}

export function listarMisDesafios() {
  return apiRequest<DesafioResumen[]>('/usuarios/me/desafios', { auth: true });
}
