import { useEffect } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
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
  style?: StyleProp<ViewStyle>;
};

export function ProgressBar({ progress, height = 8, style }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  const width = useSharedValue(clamped);

  useEffect(() => {
    width.value = withTiming(clamped, { duration: 400 });
  }, [clamped, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }, style]}>
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
    flexGrow: 1,
    minWidth: 0,
  },
  fill: {
    backgroundColor: lightColors.primary,
  },
});
