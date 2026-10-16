import { StyleSheet, Text, View } from 'react-native';
import { estadoBadgeColors, lightColors } from '@/theme/light';
import { radius } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type BadgeEstadoProps = {
  estado: string;
};

export function BadgeEstado({ estado }: BadgeEstadoProps) {
  const color = estadoBadgeColors[estado] ?? lightColors.muted;
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{estado}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  text: {
    ...typography.footnote,
    fontFamily: 'Inter_600SemiBold',
  },
});
