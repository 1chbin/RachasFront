import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CategoriaIcon } from '@/components/desafio/CategoriaIcon';
import { BadgeEstado } from '@/components/ui/BadgeEstado';
import { metaCategoria } from '@/lib/categorias';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { lightColors } from '@/theme/light';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { ResumenInicioItem } from '@/types/api';

type DesafioCardProps = {
  item: ResumenInicioItem;
  onPress: () => void;
  onCheckIn: () => void;
  checkInLoading?: boolean;
};

export function DesafioCard({
  item,
  onPress,
  onCheckIn,
  checkInLoading,
}: DesafioCardProps) {
  const { desafio } = item;
  const meta = metaCategoria(desafio.categoria);
  return (
    <View style={styles.cardOuter}>
      <View style={[styles.accent, { backgroundColor: meta.tint }]} />
      <View style={styles.card}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.header, pressed && styles.cardPressed]}>
        <View style={styles.titleRow}>
          <CategoriaIcon categoria={desafio.categoria} size="sm" align="start" />
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{desafio.nombre}</Text>
            <Text style={styles.categoria}>{meta.label}</Text>
          </View>
          <BadgeEstado estado={desafio.estado} />
        </View>
      </Pressable>
      <View style={styles.metrics}>
        <View style={styles.metricCell}>
          <Text style={styles.metricValue}>{item.rachaActual}</Text>
          <Text style={styles.metricLabel}>Racha</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricCell}>
          <Text style={styles.metricValue}>#{item.posicion}</Text>
          <Text style={styles.metricLabel}>Puesto</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricCell}>
          <Text style={styles.metricValue}>{item.puntosTotales}</Text>
          <Text style={styles.metricLabel}>Puntos</Text>
        </View>
      </View>
      <PrimaryButton
        label={item.checkInHoy ? 'Check-in de hoy hecho' : 'Check-in de hoy'}
        onPress={onCheckIn}
        disabled={item.checkInHoy || desafio.estado !== 'ACTIVO' || checkInLoading}
      />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: lightColors.surface,
  },
  accent: {
    width: 4,
  },
  card: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardPressed: {
    opacity: 0.92,
  },
  header: {
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.headline,
  },
  categoria: {
    ...typography.footnote,
    fontFamily: 'Inter_600SemiBold',
    color: lightColors.labelSecondary,
  },
  metrics: {
    flexDirection: 'row',
    backgroundColor: lightColors.background,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  metricCell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: lightColors.separator,
    marginVertical: spacing.xs,
  },
  metricValue: {
    ...typography.headline,
    color: lightColors.streak,
    fontFamily: 'Inter_700Bold',
  },
  metricLabel: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
