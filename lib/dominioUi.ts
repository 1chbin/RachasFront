import type { CheckIn } from '@/types/api';

export type PuntosCheckIn = {
  total: number;
  bonusPorRacha: number;
};

export function puntosTotalesDeCheckIn(
  puntos: CheckIn['puntos'] | number | undefined,
): number {
  if (typeof puntos === 'number') {
    return puntos;
  }
  if (puntos && typeof puntos === 'object' && 'total' in puntos) {
    return puntos.total;
  }
  return 0;
}

export function etiquetaEstadoDesafio(estado: string): string {
  const conocidos = new Set([
    'PROGRAMADO',
    'ACTIVO',
    'PAUSADO',
    'FINALIZADO',
    'CANCELADO',
  ]);
  if (conocidos.has(estado)) {
    return estado;
  }
  return estado || 'DESCONOCIDO';
}
