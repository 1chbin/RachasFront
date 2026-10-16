import { Pressable, StyleSheet, Text } from 'react-native';
import { lightColors } from '@/theme/light';
import { typography } from '@/theme/typography';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'secondary';
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  variant = 'primary',
}: PrimaryButtonProps) {
  const backgroundColor =
    variant === 'danger'
      ? lightColors.danger
      : variant === 'secondary'
        ? lightColors.primarySoft
        : lightColors.primary;
  const color =
    variant === 'secondary' ? lightColors.primaryDark : lightColors.primaryForeground;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
      ]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  label: {
    ...typography.headline,
  },
});
