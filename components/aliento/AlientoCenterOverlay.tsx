import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { lightColors } from '@/theme/light';
import { cardShadow } from '@/theme/shadows';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type AlientoCenterOverlayContentProps = {
  emoji: string;
  remitenteAlias: string;
  onDismiss: () => void;
};

export function AlientoCenterOverlayContent({
  emoji,
  remitenteAlias,
  onDismiss,
}: AlientoCenterOverlayContentProps) {
  const backdrop = useSharedValue(0);
  const cardScale = useSharedValue(0.6);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    backdrop.value = withTiming(1, { duration: 220 });
    contentOpacity.value = withTiming(1, { duration: 200 });
    cardScale.value = withSpring(1, {
      damping: 12,
      stiffness: 160,
      mass: 0.85,
    });
  }, [emoji, remitenteAlias, backdrop, cardScale, contentOpacity]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdrop.value * 0.5,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
      <Animated.View
        style={[styles.backdrop, backdropStyle]}
        pointerEvents="none"
      />
      <Animated.View style={[styles.card, cardStyle]} accessibilityRole="alert">
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.title}>@{remitenteAlias}</Text>
        <Text style={styles.subtitle}>te envió un aliento</Text>
      </Animated.View>
    </View>
  );
}

type AlientoCenterOverlayProps = AlientoCenterOverlayContentProps & {
  visible: boolean;
};

/** Modal aparte; en detalle de desafío usar AlientoCenterOverlayContent en el BottomSheet. */
export function AlientoCenterOverlay({
  visible,
  emoji,
  remitenteAlias,
  onDismiss,
}: AlientoCenterOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible
      animationType="none"
      statusBarTranslucent
      presentationStyle="overFullScreen">
      <AlientoCenterOverlayContent
        emoji={emoji}
        remitenteAlias={remitenteAlias}
        onDismiss={onDismiss}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000',
  },
  card: {
    alignItems: 'center',
    backgroundColor: lightColors.surface,
    borderRadius: radius.card,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
    minWidth: 260,
    ...cardShadow,
  },
  emoji: {
    fontSize: 72,
    lineHeight: 80,
  },
  title: {
    ...typography.title2,
    fontFamily: 'Inter_700Bold',
    color: lightColors.primaryDark,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.subhead,
    textAlign: 'center',
    color: lightColors.labelSecondary,
  },
});
