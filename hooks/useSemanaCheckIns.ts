import { useCallback, useEffect, useState } from 'react';
import { listarCheckIns } from '@/services/api/checkIns';
import { hoyCalendario, sumarDias, weekdayIndexMondayFirst } from '@/lib/fechas';

export function useSemanaCheckIns(
  desafioId: string | null,
  zonaHoraria: string,
  activo: boolean,
) {
  const [activeDays, setActiveDays] = useState<boolean[]>(Array(7).fill(false));

  const cargar = useCallback(async () => {
    if (!desafioId || !activo) {
      setActiveDays(Array(7).fill(false));
      return;
    }
    try {
      const hoy = hoyCalendario(zonaHoraria);
      const inicioSemana = sumarDias(hoy, -6);
      const res = await listarCheckIns(desafioId, 1, 50);
      const diasSet = new Set(
        res.data
          .map((c) => c.dia)
          .filter((dia) => dia >= inicioSemana && dia <= hoy),
      );
      const flags = Array(7).fill(false);
      for (let offset = 0; offset < 7; offset += 1) {
        const dia = sumarDias(inicioSemana, offset);
        const idx = weekdayIndexMondayFirst(dia, zonaHoraria);
        if (diasSet.has(dia)) {
          flags[idx] = true;
        }
      }
      setActiveDays(flags);
    } catch {
      setActiveDays(Array(7).fill(false));
    }
  }, [activo, desafioId, zonaHoraria]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { activeDays, recargarSemana: cargar };
}
