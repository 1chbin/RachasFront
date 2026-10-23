import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { lightColors } from '@/theme/light';
import { cardShadow } from '@/theme/shadows';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type GroupedSectionProps = {
  title?: string;
  footer?: string;
  children: ReactNode;
};

export function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function GroupedSection({ title, footer, children }: GroupedSectionProps) {
  return (
    <View style={styles.wrap}>
      {title ? <SectionTitle>{title}</SectionTitle> : null}
      <View style={styles.group}>{children}</View>
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.footnote,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    marginBottom: spacing.sm,
    marginLeft: spacing.lg,
    color: lightColors.labelSecondary,
    fontFamily: 'Inter_600SemiBold',
  },
  group: {
    backgroundColor: lightColors.surface,
    borderRadius: radius.card,
    overflow: 'hidden',
    ...cardShadow,
  },
  footer: {
    ...typography.footnote,
    marginTop: spacing.sm,
    marginHorizontal: spacing.lg,
    color: lightColors.labelSecondary,
  },
});
