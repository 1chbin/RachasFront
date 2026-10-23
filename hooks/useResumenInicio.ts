import { useCallback, useEffect, useState } from 'react';
import { obtenerResumenInicio } from '@/services/api/inicio';
import { mensajeErrorAmigable } from '@/lib/errors';
import type { ResumenInicioItem } from '@/types/api';

export function useResumenInicio(activo: boolean) {
  const [items, setItems] = useState<ResumenInicioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async (): Promise<ResumenInicioItem[]> => {
    if (!activo) {
      setItems([]);
      setLoading(false);
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerResumenInicio();
      setItems(data.desafios);
      return data.desafios;
    } catch (err) {
      setError(mensajeErrorAmigable(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, [activo]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { items, loading, error, recargar };
}
