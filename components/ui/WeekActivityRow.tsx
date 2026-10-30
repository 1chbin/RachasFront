import { StyleSheet, Text, View } from 'react-native';
import { lightColors } from '@/theme/light';
import { typography } from '@/theme/typography';

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const DOT_SIZE_DEFAULT = 28;
const DOT_SIZE_GLASS = 32;

type WeekActivityRowProps = {
  activeDays: boolean[];
  variant?: 'default' | 'heroGlass';
  todayIndex?: number;
};

export function WeekActivityRow({
  activeDays,
  variant = 'default',
  todayIndex,
}: WeekActivityRowProps) {
  const days = activeDays.length === 7 ? activeDays : Array(7).fill(false);
  const onGlass = variant === 'heroGlass';
  const dotSize = onGlass ? DOT_SIZE_GLASS : DOT_SIZE_DEFAULT;

  return (
    <View style={styles.row}>
      {DAY_LABELS.map((label, index) => {
        const active = days[index];
        const isTodayPending =
          onGlass && todayIndex === index && !active;
        return (
          <View key={label} style={styles.cell}>
            <View
              style={[
                styles.dot,
                { width: dotSize, height: dotSize, borderRadius: dotSize / 2 },
                onGlass && styles.dotGlass,
                onGlass && active && styles.dotGlassActive,
                !onGlass && active && styles.dotActive,
              ]}>
              {active ? (
                <Text
                  style={[
                    styles.check,
                    onGlass && styles.checkGlassActive,
                    !onGlass && styles.checkDefaultActive,
                  ]}>
                  ✓
                </Text>
              ) : isTodayPending ? (
                <Text style={styles.checkPending}>✓</Text>
              ) : null}
            </View>
            <Text style={[styles.label, onGlass && styles.labelGlass]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cell: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  dot: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    backgroundColor: lightColors.primaryDark,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  dotGlass: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderColor: 'rgba(196, 181, 253, 0.65)',
  },
  dotGlassActive: {
    backgroundColor: lightColors.primary,
    borderColor: lightColors.primary,
  },
  check: {
    fontFamily: 'Inter_700Bold',
  },
  checkDefaultActive: {
    fontSize: 13,
    color: lightColors.primaryForeground,
  },
  checkGlassActive: {
    fontSize: 16,
    color: lightColors.primaryForeground,
  },
  checkPending: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: 'rgba(124, 58, 237, 0.28)',
  },
  label: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.98)',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  labelGlass: {
    color: lightColors.labelSecondary,
  },
});
