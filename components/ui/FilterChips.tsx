import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { lightColors } from '@/theme/light';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type ChipOption<T extends string> = {
  value: T | '';
  label: string;
  left?: ReactNode;
};

type FilterChipsProps<T extends string> = {
  options: readonly ChipOption<T>[];
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
        const active = value === option.value;
        return (
          <Pressable
            key={option.label}
            onPress={() => onChange(active ? '' : option.value)}
            style={[styles.chip, active && styles.chipActive]}>
            {option.left ? <View style={styles.left}>{option.left}</View> : null}
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {option.label}
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
    marginBottom: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.chip,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightColors.tabBarBorder,
    gap: 6,
  },
  chipActive: {
    backgroundColor: lightColors.primarySoft,
    borderColor: lightColors.primary,
  },
  left: {
    marginRight: 2,
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
