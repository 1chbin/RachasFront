import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CategoriaIcon } from '@/components/desafio/CategoriaIcon';
import { CheckInRowButton } from '@/components/home/CheckInRowButton';
import { BadgeEstado } from '@/components/ui/BadgeEstado';
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

function fechasDesafioValidas(inicio: string, fin: string): boolean {
  return Boolean(
    inicio?.trim() &&
      fin?.trim() &&
      /^\d{4}-\d{2}-\d{2}$/.test(inicio.trim()) &&
      /^\d{4}-\d{2}-\d{2}$/.test(fin.trim()) &&
      fin >= inicio,
  );
}

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
  const inicio = desafio.fechaInicio?.trim() ?? '';
  const fin = desafio.finalizaEn?.trim() ?? '';
  const rangook = fechasDesafioValidas(inicio, fin);
  const totalDias = rangook ? diasInclusiveCalendario(inicio, fin) : 1;
  const rawTranscurridos = rangook
    ? diferenciaDiasCalendario(inicio, hoy) + 1
    : 0;
  const transcurridos = rangook
    ? Math.min(totalDias, Math.max(0, rawTranscurridos))
    : 0;
  const progress = totalDias > 0 ? transcurridos / totalDias : 0;
  const showCheckIn = desafio.estado === 'ACTIVO' && !item.checkInHoy;
  const showDone = item.checkInHoy;

  return (
    <View style={styles.card}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && styles.pressed]}>
        <View style={styles.headerRow}>
          <CategoriaIcon categoria={desafio.categoria} size="lg" align="start" />
          <View style={styles.body}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={2}>
                {desafio.nombre}
              </Text>
              <View style={styles.badgeWrap}>
                <BadgeEstado estado={desafio.estado} />
              </View>
            </View>
            <Text style={styles.categoria}>{meta.label}</Text>
          </View>
        </View>
        <View style={styles.progressRow}>
          <ProgressBar progress={progress} height={12} style={styles.progressBar} />
          <Text style={styles.fraction} numberOfLines={1}>
            {rangook ? `${transcurridos}/${totalDias}` : '—'}
          </Text>
        </View>
      </Pressable>

      {showCheckIn || showDone ? (
        <View style={styles.actionZone}>
          <View style={styles.separator} />
          {showDone ? (
            <Text style={styles.doneToday}>Check-in de hoy listo</Text>
          ) : (
            <CheckInRowButton
              label={checkInLoading ? 'Registrando…' : 'Check-in de hoy'}
              onPress={onCheckIn}
              disabled={checkInLoading}
            />
          )}
        </View>
      ) : null}
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
    transform: [{ scale: 0.99 }],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 4,
    paddingTop: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  badgeWrap: {
    flexShrink: 0,
    maxWidth: '42%',
  },
  title: {
    ...typography.headline,
    flex: 1,
    minWidth: 0,
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
    minWidth: 0,
  },
  progressBar: {
    flex: 1,
    minWidth: 0,
  },
  fraction: {
    ...typography.footnote,
    fontFamily: 'Inter_600SemiBold',
    color: lightColors.primary,
    flexShrink: 0,
    minWidth: 44,
    maxWidth: 72,
    textAlign: 'right',
  },
  actionZone: {
    gap: spacing.md,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: lightColors.separator,
  },
  doneToday: {
    ...typography.subhead,
    fontFamily: 'Inter_600SemiBold',
    color: lightColors.success,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
