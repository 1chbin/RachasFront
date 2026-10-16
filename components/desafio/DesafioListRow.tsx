import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CategoriaIcon } from '@/components/desafio/CategoriaIcon';
import { BadgeEstado } from '@/components/ui/BadgeEstado';
import { coloresProgresoDesafio, metaCategoria } from '@/lib/categorias';
import { progresoDesafio, textoTiempoDesafio } from '@/lib/fechas';
import { lightColors } from '@/theme/light';
import { minTouchTarget, radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { DesafioResumen } from '@/types/api';

type DesafioListRowProps = {
  desafio: DesafioResumen;
  hoy: string;
  onPress: () => void;
};

export function DesafioListRow({
  desafio,
  hoy,
  onPress,
}: DesafioListRowProps) {
  const meta = metaCategoria(desafio.categoria);
  const progresoColores = coloresProgresoDesafio();
  const tiempo = textoTiempoDesafio(
    desafio.estado,
    desafio.fechaInicio,
    desafio.fechaFin,
    hoy,
  );
  const progreso = progresoDesafio(desafio.fechaInicio, desafio.fechaFin, hoy);
  const mostrarProgreso =
    desafio.estado === 'ACTIVO' || desafio.estado === 'PROGRAMADO';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.outer, pressed && styles.pressed]}>
      <View style={[styles.accent, { backgroundColor: meta.tint }]} />
      <View style={styles.row}>
        <View style={styles.iconCol}>
          <CategoriaIcon categoria={desafio.categoria} align="start" />
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {desafio.nombre}
            </Text>
            <BadgeEstado estado={desafio.estado} />
          </View>
          <Text style={styles.categoria}>{meta.label}</Text>
          {desafio.descripcion ? (
            <Text style={styles.descripcion} numberOfLines={1}>
              {desafio.descripcion}
            </Text>
          ) : null}
          <Text
            style={[
              styles.tiempo,
              desafio.estado === 'ACTIVO' && styles.tiempoActivo,
            ]}>
            {tiempo}
          </Text>
          {mostrarProgreso ? (
            <View style={[styles.progressTrack, { backgroundColor: progresoColores.track }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.round(progreso * 100)}%`,
                    backgroundColor: progresoColores.fill,
                  },
                ]}
              />
            </View>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={lightColors.muted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: lightColors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  accent: {
    width: 4,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingRight: spacing.lg,
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    minHeight: minTouchTarget,
  },
  pressed: {
    opacity: 0.7,
  },
  iconCol: {
    paddingTop: 2,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    ...typography.headline,
    flex: 1,
  },
  categoria: {
    ...typography.footnote,
    fontFamily: 'Inter_600SemiBold',
    color: lightColors.labelSecondary,
  },
  descripcion: {
    ...typography.footnote,
    color: lightColors.muted,
  },
  tiempo: {
    ...typography.subhead,
    fontFamily: 'Inter_600SemiBold',
    color: lightColors.labelSecondary,
    marginTop: 2,
  },
  tiempoActivo: {
    color: lightColors.streak,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: 5,
    borderRadius: 3,
  },
});
