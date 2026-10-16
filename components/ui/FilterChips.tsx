import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { lightColors } from '@/theme/light';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type FilterChipsProps<T extends string> = {
  options: readonly T[];
  value: T | '';
  onChange: (value: T | '') => void;
};

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: FilterChipsProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}>
      {options.map((option) => {
        const active = value === option;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(active ? '' : option)}
            style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    backgroundColor: lightColors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightColors.tabBarBorder,
  },
  chipActive: {
    backgroundColor: lightColors.primarySoft,
    borderColor: lightColors.primary,
  },
  chipText: {
    ...typography.footnote,
    fontFamily: 'Inter_600SemiBold',
    color: lightColors.label,
  },
  chipTextActive: {
    color: lightColors.primaryDark,
  },
});
