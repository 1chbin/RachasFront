import type { EstadoDesafio } from '@/types/api';

export function hoyCalendario(zonaHoraria: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: zonaHoraria }).format(
    new Date(),
  );
}

/** Lun = 0 … Dom = 6, según calendario en la zona dada. */
export function weekdayIndexMondayFirst(fecha: string, zonaHoraria: string): number {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: zonaHoraria,
    weekday: 'short',
  }).format(new Date(`${fecha}T12:00:00`));
  const map: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  return map[weekday] ?? 0;
}

export function indiceDiaSemanaActual(zonaHoraria: string): number {
  return weekdayIndexMondayFirst(hoyCalendario(zonaHoraria), zonaHoraria);
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

function esFechaCalendarioValida(value: string): boolean {
  const s = value?.trim() ?? '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return false;
  }
  const t = new Date(`${s}T12:00:00`).getTime();
  return !Number.isNaN(t);
}

function rangoDesafioValido(fechaInicio: string, fechaFin: string): boolean {
  return (
    esFechaCalendarioValida(fechaInicio) &&
    esFechaCalendarioValida(fechaFin) &&
    fechaFin.trim() >= fechaInicio.trim()
  );
}

export function textoTiempoDesafio(
  estado: EstadoDesafio,
  fechaInicio: string,
  fechaFin: string,
  hoy: string,
): string {
  if (estado === 'FINALIZADO') return 'Finalizado';
  if (estado === 'CANCELADO') return 'Cancelado';

  if (!esFechaCalendarioValida(hoy)) {
    return 'Fechas no disponibles';
  }

  if (estado === 'PROGRAMADO') {
    if (!esFechaCalendarioValida(fechaInicio)) {
      return 'Fechas no disponibles';
    }
    const hastaInicio = diferenciaDiasCalendario(hoy, fechaInicio);
    if (Number.isNaN(hastaInicio)) {
      return 'Fechas no disponibles';
    }
    if (hastaInicio <= 0) return 'Empieza hoy';
    if (hastaInicio === 1) return 'Empieza mañana';
    return `Empieza en ${pluralDias(hastaInicio)}`;
  }

  if (!rangoDesafioValido(fechaInicio, fechaFin)) {
    return 'Fechas no disponibles';
  }

  const restantes = diferenciaDiasCalendario(hoy, fechaFin);
  if (Number.isNaN(restantes)) {
    return 'Fechas no disponibles';
  }
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
  if (!rangoDesafioValido(fechaInicio, fechaFin) || !esFechaCalendarioValida(hoy)) {
    return 0;
  }
  const total = diferenciaDiasCalendario(fechaInicio, fechaFin);
  if (total <= 0 || Number.isNaN(total)) return 1;
  const transcurrido = diferenciaDiasCalendario(fechaInicio, hoy);
  if (Number.isNaN(transcurrido)) return 0;
  return Math.min(1, Math.max(0, transcurrido / total));
}
