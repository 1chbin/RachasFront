import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { DateRangeCalendar } from '@/components/crear/DateRangeCalendar';
import { CategoriaIcon } from '@/components/desafio/CategoriaIcon';
import { AppHeader } from '@/components/ui/AppHeader';
import { GradientButton } from '@/components/ui/GradientButton';
import { SelectField } from '@/components/ui/SelectField';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { TextField } from '@/components/ui/TextField';
import { CATEGORIAS_ORDEN, metaCategoria } from '@/lib/categorias';
import { mensajeErrorAmigable } from '@/lib/errors';
import { sumarDias, hoyCalendario, validarRangoDesafio } from '@/lib/fechas';
import { crearDesafio } from '@/services/api/desafios';
import { useSession } from '@/context/SessionContext';
import { lightColors } from '@/theme/light';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
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
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <AppHeader title="Nuevo desafío" />
        <Text style={styles.sectionLabel}>Información</Text>
        <SurfaceCard style={styles.card}>
          <TextField placeholder="Nombre (3-60)" value={nombre} onChangeText={setNombre} />
          <View style={styles.gap} />
          <TextField
            placeholder="Descripción (opcional)"
            value={descripcion}
            onChangeText={setDescripcion}
          />
        </SurfaceCard>

        <Text style={styles.sectionLabel}>Categoría</Text>
        <SurfaceCard padding="md">
          <SelectField
            label="Elegí una categoría"
            value={categoria}
            options={categoriaOptions}
            onChange={(value) => {
              if (value) setCategoria(value);
            }}
            isLast
          />
        </SurfaceCard>

        <Text style={styles.sectionLabel}>Fechas y cupo</Text>
        <SurfaceCard>
          <DateRangeCalendar
            hoyMinimo={hoy}
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
            onChange={({ fechaInicio: inicio, fechaFin: fin }) => {
              setFechaInicio(inicio);
              setFechaFin(fin);
            }}
          />
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <TextField
            placeholder="Cupo de participantes (2-20)"
            keyboardType="number-pad"
            value={maxParticipantes}
            onChangeText={setMaxParticipantes}
          />
        </SurfaceCard>

        <GradientButton
          label={guardando ? 'Creando…' : 'Crear desafío'}
          onPress={guardar}
          disabled={guardando || nombre.length < 3 || !rangoValido}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + spacing.lg,
    gap: spacing.sm,
  },
  sectionLabel: {
    ...typography.subhead,
    fontFamily: 'Inter_600SemiBold',
    color: lightColors.labelSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  card: {
    marginBottom: spacing.sm,
  },
  gap: {
    height: spacing.md,
  },
});
