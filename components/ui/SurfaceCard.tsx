import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { lightColors } from '@/theme/light';
import { cardShadow } from '@/theme/shadows';
import { radius, spacing } from '@/theme/spacing';

type SurfaceCardProps = {
  children: ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
};

export function SurfaceCard({
  children,
  style,
  padding = 'lg',
}: SurfaceCardProps) {
  return (
    <View style={[styles.card, { padding: spacing[padding] }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: lightColors.surface,
    borderRadius: radius.card,
    ...cardShadow,
  },
});
