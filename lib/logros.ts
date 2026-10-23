export type Logro = {
  id: string;
  titulo: string;
  emoji: string;
  color: string;
};

export function calcularLogros(params: {
  mejorRacha: number;
  completados: number;
  activos: number;
}): Logro[] {
  const logros: Logro[] = [];
  if (params.mejorRacha >= 3) {
    logros.push({
      id: 'racha-3',
      titulo: 'Racha 3+',
      emoji: '🔥',
      color: '#F97316',
    });
  }
  if (params.mejorRacha >= 7) {
    logros.push({
      id: 'racha-7',
      titulo: 'Semana firme',
      emoji: '⭐',
      color: '#7C3AED',
    });
  }
  if (params.completados >= 1) {
    logros.push({
      id: 'primer-fin',
      titulo: 'Primer logro',
      emoji: '🏆',
      color: '#22C55E',
    });
  }
  if (params.completados >= 3) {
    logros.push({
      id: 'tres-fin',
      titulo: '3 finalizados',
      emoji: '💎',
      color: '#3B82F6',
    });
  }
  if (params.activos >= 2) {
    logros.push({
      id: 'multidesafio',
      titulo: 'Multiracha',
      emoji: '🎯',
      color: '#A78BFA',
    });
  }
  return logros;
}
