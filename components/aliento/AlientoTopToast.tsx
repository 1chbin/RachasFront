import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lightColors } from '@/theme/light';
import { cardShadow } from '@/theme/shadows';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type AlientoTopToastProps = {
  visible: boolean;
  emoji: string;
  remitenteAlias: string;
  desafioNombre?: string;
  onDismiss: () => void;
};

export function AlientoTopToast({
  visible,
  emoji,
  remitenteAlias,
  desafioNombre,
  onDismiss,
}: AlientoTopToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.value = withSpring(0, { damping: 14, stiffness: 140 });
      opacity.value = withTiming(1, { duration: 200 });
      return;
    }
    translateY.value = withTiming(-120, { duration: 180 });
    opacity.value = withTiming(0, { duration: 150 });
    const t = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(t);
  }, [visible, translateY, opacity]);

  const wrapStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!mounted && !visible) {
    return null;
  }

  return (
    <View
      style={[styles.host, { paddingTop: insets.top + spacing.sm }]}
      pointerEvents="box-none">
      <Animated.View style={wrapStyle}>
        <Pressable
          accessibilityRole="alert"
          onPress={onDismiss}
          style={({ pressed }) => [styles.toast, pressed && styles.toastPressed]}>
          <Text style={styles.emoji}>{emoji}</Text>
          <View style={styles.textBlock}>
            <Text style={styles.title} numberOfLines={1}>
              @{remitenteAlias} te envió un aliento
            </Text>
            {desafioNombre ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {desafioNombre}
              </Text>
            ) : null}
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: spacing.lg,
    elevation: 20,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: lightColors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightColors.primarySoft,
    ...cardShadow,
  },
  toastPressed: {
    opacity: 0.92,
  },
  emoji: {
    fontSize: 32,
    lineHeight: 38,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.subhead,
    fontFamily: 'Inter_600SemiBold',
    color: lightColors.label,
  },
  subtitle: {
    ...typography.footnote,
    color: lightColors.labelSecondary,
  },
});
