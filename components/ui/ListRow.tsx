import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { lightColors } from '@/theme/light';
import { minTouchTarget, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type ListRowProps = {
  title: string;
  subtitle?: string;
  detail?: string;
  onPress?: () => void;
  showChevron?: boolean;
  highlight?: boolean;
  isLast?: boolean;
  left?: React.ReactNode;
};

export function ListRow({
  title,
  subtitle,
  detail,
  onPress,
  showChevron = Boolean(onPress),
  highlight = false,
  isLast = false,
  left,
}: ListRowProps) {
  const content = (
    <>
      {left ? <View style={styles.left}>{left}</View> : null}
      <View style={styles.textBlock}>
        <Text style={[styles.title, highlight && styles.titleHighlight]} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      {showChevron && onPress ? (
        <Ionicons name="chevron-forward" size={18} color={lightColors.muted} />
      ) : null}
    </>
  );

  const rowStyle = [
    styles.row,
    highlight && styles.rowHighlight,
    !isLast && styles.rowBorder,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [...rowStyle, pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }

  return <View style={rowStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: minTouchTarget,
    gap: spacing.md,
  },
  rowHighlight: {
    backgroundColor: lightColors.primarySoft,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: lightColors.separator,
  },
  pressed: {
    opacity: 0.65,
  },
  left: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.body,
    color: lightColors.label,
  },
  titleHighlight: {
    fontFamily: 'Inter_600SemiBold',
    color: lightColors.primaryDark,
  },
  subtitle: {
    ...typography.footnote,
    color: lightColors.labelSecondary,
  },
  detail: {
    ...typography.subhead,
    color: lightColors.muted,
    fontFamily: 'Inter_600SemiBold',
  },
});
