import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CategoriaIcon } from '@/components/desafio/CategoriaIcon';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { BadgeEstado } from '@/components/ui/BadgeEstado';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { metaCategoria } from '@/lib/categorias';
import { progresoDesafio, textoTiempoDesafio } from '@/lib/fechas';
import { lightColors } from '@/theme/light';
import { cardShadow } from '@/theme/shadows';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { DesafioResumen } from '@/types/api';

type ChallengeExploreCardProps = {
  desafio: DesafioResumen;
  hoy: string;
  participantAliases?: string[];
  onPress: () => void;
};

export function ChallengeExploreCard({
  desafio,
  hoy,
  participantAliases = [],
  onPress,
}: ChallengeExploreCardProps) {
  const meta = metaCategoria(desafio.categoria);
  const progreso = progresoDesafio(desafio.fechaInicio, desafio.fechaFin, hoy);
  const tiempo = textoTiempoDesafio(
    desafio.estado,
    desafio.fechaInicio,
    desafio.fechaFin,
    hoy,
  );
  const mostrarProgreso =
    desafio.estado === 'ACTIVO' || desafio.estado === 'PROGRAMADO';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: meta.soft }]}>
          <CategoriaIcon categoria={desafio.categoria} size="sm" align="start" />
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>{desafio.nombre}</Text>
            <BadgeEstado estado={desafio.estado} />
          </View>
          <Text style={styles.categoria}>{meta.label}</Text>
          <Text style={styles.tiempo}>{tiempo}</Text>
        </View>
      </View>
      {mostrarProgreso ? (
        <ProgressBar progress={progreso} />
      ) : null}
      {participantAliases.length > 0 ? (
        <View style={styles.social}>
          <AvatarStack aliases={participantAliases} />
          <Text style={styles.socialText}>
            {participantAliases.length} participante
            {participantAliases.length === 1 ? '' : 's'}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: lightColors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
    ...cardShadow,
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    ...typography.headline,
    flex: 1,
    fontFamily: 'Inter_700Bold',
  },
  categoria: {
    ...typography.footnote,
    color: lightColors.labelSecondary,
  },
  tiempo: {
    ...typography.footnote,
    fontFamily: 'Inter_600SemiBold',
    color: lightColors.primary,
  },
  social: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  socialText: {
    ...typography.caption,
    color: lightColors.labelSecondary,
  },
});
