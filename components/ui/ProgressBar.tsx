import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { lightColors } from '@/theme/light';
import { radius } from '@/theme/spacing';

type ProgressBarProps = {
  progress: number;
  height?: number;
};

export function ProgressBar({ progress, height = 8 }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  const width = useSharedValue(clamped);

  useEffect(() => {
    width.value = withTiming(clamped, { duration: 400 });
  }, [clamped, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <Animated.View
        style={[
          styles.fill,
          { height, borderRadius: height / 2 },
          fillStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: lightColors.progressTrack,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    backgroundColor: lightColors.primary,
  },
});
