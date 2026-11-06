import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { lightColors } from '@/theme/light';
import { typography } from '@/theme/typography';

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const DOT_SIZE_DEFAULT = 28;
const DOT_SIZE_GLASS = 30;

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
        const isTodayPending = onGlass && todayIndex === index && !active;
        return (
          <View key={label} style={styles.cell}>
            <View
              style={[
                styles.dot,
                { width: dotSize, height: dotSize, borderRadius: dotSize / 2 },
                onGlass && styles.dotGlass,
                onGlass && active && styles.dotGlassActive,
                onGlass && isTodayPending && styles.dotGlassPending,
                !onGlass && active && styles.dotActive,
              ]}>
              {active ? (
                onGlass ? (
                  <Ionicons
                    name="checkmark"
                    size={22}
                    color={lightColors.primaryForeground}
                    style={styles.checkIconGlass}
                  />
                ) : (
                  <Text style={[styles.check, styles.checkDefaultActive]}>✓</Text>
                )
              ) : isTodayPending ? (
                // Solo borde (dotGlassPending): un ícono circular dentro se veía como "doble aro" roto.
                null
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
    minWidth: 0,
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
    borderColor: 'rgba(255,255,255,0.92)',
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#5B21B6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  dotGlassPending: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderColor: lightColors.primary,
    borderWidth: 2.5,
  },
  checkIconGlass: {
    marginTop: 1,
  },
  check: {
    fontFamily: 'Inter_700Bold',
  },
  checkDefaultActive: {
    fontSize: 13,
    color: lightColors.primaryForeground,
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
