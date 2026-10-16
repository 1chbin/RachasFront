import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { lightColors } from '@/theme/light';
import { typography } from '@/theme/typography';

type StreakBurstProps = {
  visible: boolean;
  from: number;
  to: number;
  onComplete: () => void;
};

export function StreakBurst({ visible, from, to, onComplete }: StreakBurstProps) {
  const [displayCount, setDisplayCount] = useState(from);
  const backdrop = useSharedValue(0);
  const flameScale = useSharedValue(0.4);
  const flameGray = useSharedValue(1);
  const countOpacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);

    setDisplayCount(from);
    backdrop.value = 0;
    flameScale.value = 0.4;
    flameGray.value = 1;
    countOpacity.value = 0;

    backdrop.value = withTiming(1, { duration: 200 });
    countOpacity.value = withDelay(200, withTiming(1, { duration: 150 }));
    flameScale.value = withDelay(
      80,
      withSpring(1, { damping: 9, stiffness: 180, mass: 0.8 }),
    );
    flameGray.value = withDelay(120, withTiming(0, { duration: 350 }));

    const countTimer = setTimeout(() => {
      setDisplayCount(to);
    }, 300);

    const closeTimer = setTimeout(() => {
      backdrop.value = withTiming(0, { duration: 220 }, (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      });
      countOpacity.value = withTiming(0, { duration: 180 });
    }, 1100);

    return () => {
      clearTimeout(countTimer);
      clearTimeout(closeTimer);
    };
  }, [visible, from, to, backdrop, flameScale, flameGray, countOpacity, onComplete]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdrop.value * 0.45,
  }));

  const flameWrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  const grayFlameStyle = useAnimatedStyle(() => ({
    opacity: flameGray.value,
  }));

  const colorFlameStyle = useAnimatedStyle(() => ({
    opacity: 1 - flameGray.value,
  }));

  const countStyle = useAnimatedStyle(() => ({
    opacity: countOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
        <View style={styles.center}>
          <Animated.View style={[styles.flameWrap, flameWrapStyle]}>
            <Animated.View style={[styles.flameLayer, grayFlameStyle]}>
              <Ionicons name="flame" size={88} color={lightColors.muted} />
            </Animated.View>
            <Animated.View style={[styles.flameLayer, colorFlameStyle]}>
              <Ionicons name="flame" size={88} color={lightColors.streak} />
            </Animated.View>
          </Animated.View>
          <Animated.View style={countStyle}>
            <Text style={styles.count}>{displayCount}</Text>
          </Animated.View>
          <Text style={styles.hint}>días de racha</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000',
  },
  center: {
    alignItems: 'center',
    gap: 8,
  },
  flameWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontSize: 56,
    lineHeight: 60,
    fontFamily: 'Inter_700Bold',
    color: lightColors.streak,
    textAlign: 'center',
  },
  hint: {
    ...typography.subhead,
    color: lightColors.label,
    fontFamily: 'Inter_600SemiBold',
  },
});
