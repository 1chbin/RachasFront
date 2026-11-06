import { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lightColors } from '@/theme/light';
import { radius, spacing } from '@/theme/spacing';

type BottomSheetSize = 'compact' | 'tall';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  size?: BottomSheetSize;
  scroll?: boolean;
  header?: ReactNode;
  children: ReactNode;
  overlay?: ReactNode;
};

/** Web: Modal + Reanimated (Gorhom modal no aplica igual). */
export function BottomSheet({
  visible,
  onClose,
  size = 'compact',
  scroll = true,
  header,
  children,
  overlay,
}: BottomSheetProps) {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(400);

  const sheetMaxHeight = useMemo(() => {
    const ratio = size === 'compact' ? 0.42 : 0.92;
    return windowHeight * ratio;
  }, [windowHeight, size]);

  const finishClose = () => {
    setMounted(false);
    onClose();
  };

  const animateOpen = () => {
    backdropOpacity.value = withTiming(1, { duration: 220 });
    sheetTranslateY.value = withTiming(0, { duration: 280 });
  };

  const animateClose = () => {
    backdropOpacity.value = withTiming(0, { duration: 180 });
    sheetTranslateY.value = withTiming(400, { duration: 240 }, (finished) => {
      if (finished) {
        runOnJS(finishClose)();
      }
    });
  };

  useEffect(() => {
    if (visible) {
      setMounted(true);
      requestAnimationFrame(() => animateOpen());
    } else if (mounted) {
      animateClose();
    }
  }, [visible, mounted]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          gesture.dy > 4 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > 48 || gesture.vy > 0.8) {
            animateClose();
          }
        },
      }),
    [],
  );

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value * 0.45,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  if (!mounted) return null;

  const paddingBottom = Math.max(insets.bottom, spacing.lg);

  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
      showsVerticalScrollIndicator
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, { paddingBottom }]}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.noScrollBody, { paddingBottom }]}>{children}</View>
  );

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={animateClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={animateClose}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
          pointerEvents="box-none">
          <Animated.View
            style={[
              styles.sheet,
              size === 'tall' && styles.sheetTall,
              {
                height: sheetMaxHeight,
                maxHeight: sheetMaxHeight,
              },
              sheetStyle,
            ]}>
            <View
              style={styles.handleZone}
              accessibilityRole="adjustable"
              accessibilityHint="Deslizá hacia abajo para cerrar"
              {...panResponder.panHandlers}>
              <View style={styles.handle} />
            </View>
            {header ? <View style={styles.headerSlot}>{header}</View> : null}
            <View style={styles.bodyColumn}>{body}</View>
          </Animated.View>
        </KeyboardAvoidingView>
        {overlay ? (
          <View style={styles.overlayHost} pointerEvents="box-none">
            {overlay}
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000',
  },
  keyboard: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    backgroundColor: lightColors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    overflow: 'hidden',
  },
  sheetTall: {
    flexShrink: 0,
  },
  handleZone: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingTop: spacing.sm,
    flexShrink: 0,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: lightColors.separator,
  },
  headerSlot: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    flexShrink: 0,
  },
  bodyColumn: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 0,
  },
  noScrollBody: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    paddingHorizontal: spacing.lg,
  },
  overlayHost: {
    ...StyleSheet.absoluteFill,
    zIndex: 20,
    elevation: 20,
  },
});
