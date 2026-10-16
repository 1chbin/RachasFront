import { ReactNode, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ListRow } from '@/components/ui/ListRow';
import { lightColors } from '@/theme/light';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type SelectOption<T extends string> = {
  value: T | '';
  label: string;
  left?: ReactNode;
};

type SelectFieldProps<T extends string> = {
  label: string;
  value: T | '';
  options: SelectOption<T>[];
  onChange: (value: T | '') => void;
  accessibilityHint?: string;
  isLast?: boolean;
};

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  accessibilityHint,
  isLast = true,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value) ?? options[0];

  const elegir = (next: T | '') => {
    onChange(next);
    setOpen(false);
  };

  return (
    <>
      <ListRow
        title={label}
        detail={selected?.label ?? 'Todos'}
        onPress={() => setOpen(true)}
        isLast={isLast}
      />
      <BottomSheet visible={open} onClose={() => setOpen(false)} size="compact">
        <Text style={styles.sheetTitle}>{label}</Text>
        {options.map((option, index) => (
          <ListRow
            key={option.value || '__all__'}
            title={option.label}
            left={option.left}
            onPress={() => elegir(option.value)}
            isLast={index === options.length - 1}
            detail={option.value === value ? '✓' : undefined}
          />
        ))}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  sheetTitle: {
    ...typography.title2,
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing.md,
  },
});
