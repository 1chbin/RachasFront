import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CategoriaIcon } from '@/components/desafio/CategoriaIcon';
import { BadgeEstado } from '@/components/ui/BadgeEstado';
import { GradientButton } from '@/components/ui/GradientButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { metaCategoria } from '@/lib/categorias';
import {
  diasInclusiveCalendario,
  diferenciaDiasCalendario,
  hoyCalendario,
} from '@/lib/fechas';
import { lightColors } from '@/theme/light';
import { cardShadow } from '@/theme/shadows';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { ResumenInicioItem } from '@/types/api';

type ChallengeHomeCardProps = {
  item: ResumenInicioItem;
  zonaHoraria: string;
  onPress: () => void;
  onCheckIn: () => void;
  checkInLoading?: boolean;
};

export function ChallengeHomeCard({
  item,
  zonaHoraria,
  onPress,
  onCheckIn,
  checkInLoading,
}: ChallengeHomeCardProps) {
  const { desafio } = item;
  const meta = metaCategoria(desafio.categoria);
  const hoy = hoyCalendario(zonaHoraria);
  const totalDias = diasInclusiveCalendario(desafio.fechaInicio, desafio.fechaFin);
  const transcurridos = Math.min(
    totalDias,
    Math.max(0, diferenciaDiasCalendario(desafio.fechaInicio, hoy) + 1),
  );
  const progress = totalDias > 0 ? transcurridos / totalDias : 0;

  return (
    <View style={styles.card}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && styles.pressed]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: meta.soft }]}>
          <CategoriaIcon categoria={desafio.categoria} size="sm" align="start" />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={2}>{desafio.nombre}</Text>
          <Text style={styles.categoria}>{meta.label}</Text>
        </View>
        <BadgeEstado estado={desafio.estado} />
      </View>
      <View style={styles.progressRow}>
        <ProgressBar progress={progress} />
        <Text style={styles.fraction}>
          {transcurridos}/{totalDias}
        </Text>
      </View>
      <View style={styles.metrics}>
        <Text style={styles.metric}>Racha {item.rachaActual}</Text>
        <Text style={styles.metric}>#{item.posicion}</Text>
        <Text style={styles.metric}>{item.puntosTotales} pts</Text>
      </View>
      </Pressable>
      <GradientButton
        label={
          item.checkInHoy
            ? 'Check-in de hoy hecho'
            : checkInLoading
              ? 'Registrando…'
              : 'Check-in de hoy'
        }
        onPress={onCheckIn}
        disabled={
          item.checkInHoy || desafio.estado !== 'ACTIVO' || checkInLoading
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: lightColors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
    ...cardShadow,
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.headline,
    fontFamily: 'Inter_700Bold',
  },
  categoria: {
    ...typography.footnote,
    color: lightColors.labelSecondary,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fraction: {
    ...typography.footnote,
    fontFamily: 'Inter_600SemiBold',
    color: lightColors.primary,
    minWidth: 36,
    textAlign: 'right',
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    ...typography.caption,
    fontFamily: 'Inter_600SemiBold',
    color: lightColors.labelSecondary,
  },
});
