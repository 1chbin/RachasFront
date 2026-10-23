import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { lightColors } from '@/theme/light';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { cardShadow } from '@/theme/shadows';

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
};

export function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={20} color={lightColors.primary} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: lightColors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
    ...cardShadow,
  },
  value: {
    ...typography.headline,
    fontFamily: 'Inter_700Bold',
    color: lightColors.primary,
  },
  label: {
    ...typography.caption,
    textAlign: 'center',
    color: lightColors.labelSecondary,
  },
});
