import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
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

/**
 * Bottom sheet nativo con @gorhom/bottom-sheet: el panel sigue el dedo y coordina scroll.
 * En web usa [`BottomSheet.web.tsx`](./BottomSheet.web.tsx).
 */
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
  const ref = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => {
    const ratio = size === 'compact' ? 0.42 : 0.92;
    // En el primer frame iOS a veces devuelve height 0; Gorhom con snap 0 no muestra el sheet.
    const h =
      windowHeight > 1
        ? windowHeight
        : Dimensions.get('window').height;
    const raw = Math.round(Math.max(h, 320) * ratio);
    return [Math.max(raw, size === 'compact' ? 280 : 400)];
  }, [windowHeight, size]);

  const bottomInset = Math.max(insets.bottom, spacing.lg);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.45}
        pressBehavior="close"
      />
    ),
    [],
  );

  useEffect(() => {
    if (!visible) {
      ref.current?.dismiss();
      return;
    }
    // BottomSheetModal arranca en index -1; present() en el siguiente frame (RN sin InteractionManager).
    const raf = requestAnimationFrame(() => {
      ref.current?.present();
    });
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDynamicSizing={false}
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      topInset={insets.top}
      bottomInset={bottomInset}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handleIndicator}
      enableContentPanningGesture>
      {header ? <View style={styles.headerSlot}>{header}</View> : null}
      {scroll ? (
        <BottomSheetScrollView
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomInset },
          ]}>
          {children}
        </BottomSheetScrollView>
      ) : (
        <BottomSheetView
          style={[styles.noScrollBody, { paddingBottom: bottomInset }]}>
          {children}
        </BottomSheetView>
      )}
      {overlay ? (
        <View style={styles.overlayHost} pointerEvents="box-none">
          {overlay}
        </View>
      ) : null}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: lightColors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
  },
  handleIndicator: {
    backgroundColor: lightColors.separator,
    width: 36,
  },
  headerSlot: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  noScrollBody: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  overlayHost: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
    elevation: 100,
  },
});
