import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { lightColors } from '@/theme/light';
import { minTouchTarget, radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type CheckInRowButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function CheckInRowButton({ label, onPress, disabled }: CheckInRowButtonProps) {
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
        end={{ x: 1, y: 0 }}
        style={styles.gradient}>
        <View style={styles.row}>
          <Ionicons
            name="checkmark-circle-outline"
            size={18}
            color={lightColors.primaryForeground}
          />
          <Text style={styles.label}>{label}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.button,
    overflow: 'hidden',
    width: '100%',
  },
  gradient: {
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    ...typography.subhead,
    fontFamily: 'Inter_600SemiBold',
    color: lightColors.primaryForeground,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
