import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { obtenerResumenInicio } from '@/services/api/inicio';
import { mensajeErrorAmigable } from '@/lib/errors';
import type { ResumenInicioItem } from '@/types/api';

export function useResumenInicio(usuarioId: string | null) {
  const [items, setItems] = useState<ResumenInicioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!usuarioId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerResumenInicio(usuarioId);
      setItems(data.desafios);
    } catch (err) {
      setError(mensajeErrorAmigable(err));
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  return { items, loading, error, recargar: cargar };
}
