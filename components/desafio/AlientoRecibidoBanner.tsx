import { StyleSheet, Text, View } from 'react-native';
import { lightColors } from '@/theme/light';
import { cardShadow } from '@/theme/shadows';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type AlientoRecibidoBannerProps = {
  emoji: string;
  remitenteAlias: string;
};

export function AlientoRecibidoBanner({
  emoji,
  remitenteAlias,
}: AlientoRecibidoBannerProps) {
  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.text}>@{remitenteAlias} te envió un aliento</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: lightColors.surface,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.card,
    marginBottom: spacing.md,
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightColors.primarySoft,
    ...cardShadow,
  },
  emoji: {
    fontSize: 56,
    lineHeight: 64,
  },
  text: {
    ...typography.subhead,
    textAlign: 'center',
    color: lightColors.primaryDark,
    fontFamily: 'Inter_600SemiBold',
  },
});
