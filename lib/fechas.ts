import type { EstadoDesafio } from '@/types/api';

export function hoyCalendario(zonaHoraria: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: zonaHoraria }).format(
    new Date(),
  );
}

export function sumarDias(fecha: string, dias: number): string {
  const date = new Date(`${fecha}T12:00:00`);
  date.setDate(date.getDate() + dias);
  return date.toISOString().slice(0, 10);
}

export function diferenciaDiasCalendario(desde: string, hasta: string): number {
  const inicio = new Date(`${desde}T12:00:00`).getTime();
  const fin = new Date(`${hasta}T12:00:00`).getTime();
  return Math.round((fin - inicio) / 86_400_000);
}

export function diasInclusiveCalendario(desde: string, hasta: string): number {
  return diferenciaDiasCalendario(desde, hasta) + 1;
}

export function fechasEnRango(inicio: string, fin: string): string[] {
  if (fin < inicio) return [];
  const fechas: string[] = [];
  let cursor = inicio;
  while (cursor <= fin) {
    fechas.push(cursor);
    cursor = sumarDias(cursor, 1);
  }
  return fechas;
}

export type ValidacionRangoDesafio = {
  valido: boolean;
  mensaje?: string;
};

export function validarRangoDesafio(
  fechaInicio: string,
  fechaFin: string,
  hoyMinimo: string,
): ValidacionRangoDesafio {
  if (!fechaInicio || !fechaFin) {
    return { valido: false, mensaje: 'Elegí inicio y fin en el calendario' };
  }
  if (fechaInicio < hoyMinimo) {
    return { valido: false, mensaje: 'La fecha de inicio no puede estar en el pasado' };
  }
  if (fechaFin < fechaInicio) {
    return { valido: false, mensaje: 'La fecha de fin no puede ser anterior al inicio' };
  }
  const duracion = diasInclusiveCalendario(fechaInicio, fechaFin);
  if (duracion < 3) {
    return { valido: false, mensaje: 'El desafío debe durar al menos 3 días' };
  }
  if (duracion > 90) {
    return { valido: false, mensaje: 'El desafío no puede durar más de 90 días' };
  }
  return { valido: true };
}

export function formatearFechaCorta(fecha: string): string {
  const [year, month, day] = fecha.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

function pluralDias(n: number): string {
  return n === 1 ? '1 día' : `${n} días`;
}

export function textoTiempoDesafio(
  estado: EstadoDesafio,
  fechaInicio: string,
  fechaFin: string,
  hoy: string,
): string {
  if (estado === 'FINALIZADO') return 'Finalizado';
  if (estado === 'CANCELADO') return 'Cancelado';

  if (estado === 'PROGRAMADO') {
    const hastaInicio = diferenciaDiasCalendario(hoy, fechaInicio);
    if (hastaInicio <= 0) return 'Empieza hoy';
    if (hastaInicio === 1) return 'Empieza mañana';
    return `Empieza en ${pluralDias(hastaInicio)}`;
  }

  const restantes = diferenciaDiasCalendario(hoy, fechaFin);
  if (restantes < 0) return 'Plazo vencido';
  if (restantes === 0) return 'Termina hoy';
  if (restantes === 1) return 'Último día';
  return `Quedan ${pluralDias(restantes)}`;
}

export function progresoDesafio(
  fechaInicio: string,
  fechaFin: string,
  hoy: string,
): number {
  const total = diferenciaDiasCalendario(fechaInicio, fechaFin);
  if (total <= 0) return 1;
  const transcurrido = diferenciaDiasCalendario(fechaInicio, hoy);
  return Math.min(1, Math.max(0, transcurrido / total));
}
