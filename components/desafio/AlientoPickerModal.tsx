import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ALIENTO_EMOJI_OPTIONS, type AlientoEmojiId } from '@/lib/alientoEmojis';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { lightColors } from '@/theme/light';
import { cardShadow } from '@/theme/shadows';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type AlientoPickerOverlayProps = {
  destinatarioAlias: string;
  disabled?: boolean;
  errorMessage?: string | null;
  onSelect: (emojiId: AlientoEmojiId) => void;
  onClose: () => void;
};

export function AlientoPickerOverlay({
  destinatarioAlias,
  disabled = false,
  errorMessage,
  onSelect,
  onClose,
}: AlientoPickerOverlayProps) {
  return (
    <View style={styles.root} pointerEvents="box-none">
      <Pressable
        style={styles.backdrop}
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
        onPress={onClose}
      />
      <View style={styles.cardWrap} pointerEvents="box-none">
        <View style={styles.cardInner} pointerEvents="auto">
          <Text style={styles.title}>Alentar a @{destinatarioAlias}</Text>
          <Text style={styles.subtitle}>Elegí una reacción</Text>
          {errorMessage ? (
            <Text style={styles.error}>{errorMessage}</Text>
          ) : null}
          <View style={styles.emojiRow}>
            {ALIENTO_EMOJI_OPTIONS.map(({ id, emoji }) => (
              <Pressable
                key={id}
                accessibilityRole="button"
                accessibilityLabel={`Enviar ${emoji}`}
                disabled={disabled}
                onPress={() => onSelect(id)}
                style={({ pressed }) => [
                  styles.emojiBtn,
                  pressed && !disabled && styles.emojiBtnPressed,
                  disabled && styles.emojiBtnDisabled,
                ]}>
                <Text style={styles.emojiBtnText}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
          <PrimaryButton
            label="Cancelar"
            variant="secondary"
            onPress={onClose}
            disabled={disabled}
          />
        </View>
      </View>
    </View>
  );
}

type AlientoPickerModalProps = AlientoPickerOverlayProps & {
  visible: boolean;
};

/** Modal aparte; en detalle de desafío usar AlientoPickerOverlay dentro del BottomSheet. */
export function AlientoPickerModal({
  visible,
  ...overlayProps
}: AlientoPickerModalProps) {
  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={overlayProps.onClose}>
      <AlientoPickerOverlay {...overlayProps} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  cardWrap: {
    width: '100%',
    maxWidth: 340,
    zIndex: 1,
  },
  cardInner: {
    backgroundColor: lightColors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
    ...cardShadow,
  },
  title: {
    ...typography.title2,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  subtitle: {
    ...typography.footnote,
    color: lightColors.labelSecondary,
    textAlign: 'center',
  },
  error: {
    ...typography.footnote,
    color: lightColors.danger,
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  emojiBtn: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: lightColors.primarySoft,
  },
  emojiBtnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  emojiBtnDisabled: {
    opacity: 0.4,
  },
  emojiBtnText: {
    fontSize: 30,
    lineHeight: 36,
  },
});
