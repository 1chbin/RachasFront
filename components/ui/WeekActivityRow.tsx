import { StyleSheet, Text, View } from 'react-native';
import { lightColors } from '@/theme/light';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

type WeekActivityRowProps = {
  activeDays: boolean[];
};

export function WeekActivityRow({ activeDays }: WeekActivityRowProps) {
  const days = activeDays.length === 7 ? activeDays : Array(7).fill(false);

  return (
    <View style={styles.row}>
      {DAY_LABELS.map((label, index) => {
        const active = days[index];
        return (
          <View key={label} style={styles.cell}>
            <View style={[styles.dot, active && styles.dotActive]}>
              {active ? (
                <Text style={styles.check}>✓</Text>
              ) : null}
            </View>
            <Text style={styles.label}>{label}</Text>
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
    marginTop: spacing.md,
  },
  cell: {
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    backgroundColor: lightColors.surface,
  },
  check: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: lightColors.primary,
  },
  label: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Inter_600SemiBold',
  },
});
