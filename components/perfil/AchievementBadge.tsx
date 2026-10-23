import { StyleSheet, Text, View } from 'react-native';
import type { Logro } from '@/lib/logros';
import { lightColors } from '@/theme/light';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type AchievementBadgeProps = {
  logro: Logro;
};

export function AchievementBadge({ logro }: AchievementBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: `${logro.color}18` }]}>
      <Text style={styles.emoji}>{logro.emoji}</Text>
      <Text style={styles.title} numberOfLines={2}>{logro.titulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  emoji: {
    fontSize: 28,
  },
  title: {
    ...typography.caption,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    color: lightColors.label,
  },
});
