import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { DateRangeCalendar } from '@/components/crear/DateRangeCalendar';
import { CategoriaIcon } from '@/components/desafio/CategoriaIcon';
import { GroupedSection } from '@/components/ui/GroupedSection';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { SelectField } from '@/components/ui/SelectField';
import { TextField } from '@/components/ui/TextField';
import { CATEGORIAS_ORDEN, metaCategoria } from '@/lib/categorias';
import { mensajeErrorAmigable } from '@/lib/errors';
import { sumarDias, hoyCalendario, validarRangoDesafio } from '@/lib/fechas';
import { crearDesafio } from '@/services/api/desafios';
import { useSession } from '@/context/SessionContext';
import { lightColors } from '@/theme/light';
import { spacing } from '@/theme/spacing';
import type { CategoriaDesafio } from '@/types/api';

export default function CrearScreen() {
  const { usuario } = useSession();
  const hoy = hoyCalendario(usuario?.zonaHoraria ?? 'America/Argentina/Buenos_Aires');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState<CategoriaDesafio>('SALUD');
  const [fechaInicio, setFechaInicio] = useState(hoy);
  const [fechaFin, setFechaFin] = useState(sumarDias(hoy, 6));
  const [maxParticipantes, setMaxParticipantes] = useState('10');
  const [guardando, setGuardando] = useState(false);

  const rangoValido = validarRangoDesafio(fechaInicio, fechaFin, hoy).valido;

  const categoriaOptions = useMemo(
    () =>
      CATEGORIAS_ORDEN.map((c) => ({
        value: c,
        label: metaCategoria(c).label,
        left: <CategoriaIcon categoria={c} size="sm" />,
      })),
    [],
  );

  const guardar = async () => {
    if (!rangoValido) return;
    setGuardando(true);
    try {
      const desafio = await crearDesafio({
        nombre,
        descripcion: descripcion || undefined,
        categoria,
        fechaInicio,
        fechaFin,
        maxParticipantes: Number(maxParticipantes),
      });
      router.push(`/desafio/${desafio.id}`);
    } catch (err) {
      alert(mensajeErrorAmigable(err));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Screen title="Nuevo desafío">
      <View style={styles.form}>
        <GroupedSection title="Información">
          <TextField grouped placeholder="Nombre (3-60)" value={nombre} onChangeText={setNombre} />
          <View style={styles.divider} />
          <TextField
            grouped
            placeholder="Descripción (opcional)"
            value={descripcion}
            onChangeText={setDescripcion}
          />
        </GroupedSection>

        <GroupedSection title="Categoría">
          <SelectField
            label="Elegí una categoría"
            value={categoria}
            options={categoriaOptions}
            onChange={(value) => {
              if (value) setCategoria(value);
            }}
            isLast
          />
        </GroupedSection>

        <GroupedSection title="Fechas y cupo">
          <DateRangeCalendar
            hoyMinimo={hoy}
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
            onChange={({ fechaInicio: inicio, fechaFin: fin }) => {
              setFechaInicio(inicio);
              setFechaFin(fin);
            }}
          />
          <View style={styles.divider} />
          <TextField
            grouped
            placeholder="Máx. participantes (2-20)"
            keyboardType="number-pad"
            value={maxParticipantes}
            onChangeText={setMaxParticipantes}
          />
        </GroupedSection>

        <PrimaryButton
          label="Crear desafío"
          onPress={guardar}
          disabled={guardando || nombre.length < 3 || !rangoValido}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: lightColors.separator,
    marginLeft: spacing.lg,
  },
});
