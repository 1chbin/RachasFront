import { StyleSheet, Text, View } from 'react-native';
import type { Logro } from '@/lib/logros';
import { lightColors } from '@/theme/light';
import { typography } from '@/theme/typography';

type AchievementBadgeProps = {
  logro: Logro;
};

export function AchievementBadge({ logro }: AchievementBadgeProps) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.circle, { backgroundColor: `${logro.color}22` }]}>
        <Text style={styles.emoji}>{logro.emoji}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {logro.titulo}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 76,
    alignItems: 'center',
    gap: 6,
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  title: {
    ...typography.caption,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    color: lightColors.labelSecondary,
  },
});
