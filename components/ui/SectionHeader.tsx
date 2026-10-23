import { Pressable, StyleSheet, Text, View } from 'react-native';
import { lightColors } from '@/theme/light';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({
  title,
  actionLabel = 'Ver todos',
  onAction,
}: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  title: {
    ...typography.title2,
    fontFamily: 'Inter_700Bold',
  },
  action: {
    ...typography.subhead,
    fontFamily: 'Inter_600SemiBold',
    color: lightColors.primary,
  },
});
