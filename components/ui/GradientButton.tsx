import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text } from 'react-native';
import { lightColors } from '@/theme/light';
import { minTouchTarget, radius } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type GradientButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function GradientButton({ label, onPress, disabled }: GradientButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <LinearGradient
        colors={
          disabled
            ? [lightColors.muted, lightColors.muted]
            : [lightColors.heroGradientStart, lightColors.heroGradientEnd]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.button,
    overflow: 'hidden',
  },
  gradient: {
    minHeight: minTouchTarget + 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  label: {
    ...typography.headline,
    fontFamily: 'Inter_600SemiBold',
    color: lightColors.primaryForeground,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
