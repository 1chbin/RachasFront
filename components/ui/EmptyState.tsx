import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Logo } from '@/components/brand/Logo';
import { lightColors } from '@/theme/light';
import { typography } from '@/theme/typography';

type EmptyStateProps = {
  title: string;
  message: string;
  action?: ReactNode;
  showLogo?: boolean;
};

export function EmptyState({
  title,
  message,
  action,
  showLogo = false,
}: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      {showLogo ? <Logo size={72} /> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 32,
  },
  title: {
    ...typography.title2,
    color: lightColors.label,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: lightColors.labelSecondary,
    textAlign: 'center',
  },
});
