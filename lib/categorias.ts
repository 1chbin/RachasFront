import { Ionicons } from '@expo/vector-icons';
import { lightColors } from '@/theme/light';
import type { CategoriaDesafio } from '@/types/api';

type IoniconName = keyof typeof Ionicons.glyphMap;

export type MetaCategoria = {
  label: string;
  icon: IoniconName;
  tint: string;
  soft: string;
};

const META: Record<CategoriaDesafio, MetaCategoria> = {
  SALUD: {
    label: 'Salud',
    icon: 'fitness-outline',
    tint: '#E11D48',
    soft: '#FFE4E6',
  },
  ESTUDIO: {
    label: 'Estudio',
    icon: 'book-outline',
    tint: '#2563EB',
    soft: '#DBEAFE',
  },
  FINANZAS: {
    label: 'Finanzas',
    icon: 'wallet-outline',
    tint: '#059669',
    soft: '#D1FAE5',
  },
  BIENESTAR: {
    label: 'Bienestar',
    icon: 'leaf-outline',
    tint: '#7C3AED',
    soft: lightColors.primarySoft,
  },
  OTRO: {
    label: 'Otro',
    icon: 'ellipsis-horizontal-circle-outline',
    tint: lightColors.muted,
    soft: lightColors.background,
  },
};

export const CATEGORIAS_ORDEN: CategoriaDesafio[] = [
  'SALUD',
  'ESTUDIO',
  'FINANZAS',
  'BIENESTAR',
  'OTRO',
];

export function metaCategoria(categoria: CategoriaDesafio): MetaCategoria {
  return META[categoria] ?? META.OTRO;
}

/** Colores unificados para barra de progreso del desafío (la categoría va en el borde izquierdo). */
export function coloresProgresoDesafio() {
  return {
    track: lightColors.primarySoft,
    fill: lightColors.primary,
  };
}

export const ESTADOS_ORDEN = [
  'PROGRAMADO',
  'ACTIVO',
  'FINALIZADO',
  'CANCELADO',
] as const;

export function etiquetaEstado(estado: string): string {
  switch (estado) {
    case 'ACTIVO':
      return 'En curso';
    case 'PROGRAMADO':
      return 'Programado';
    case 'FINALIZADO':
      return 'Finalizado';
    case 'CANCELADO':
      return 'Cancelado';
    default:
      return estado;
  }
}
