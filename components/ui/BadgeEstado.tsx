import { StyleSheet, Text, View } from 'react-native';
import { estadoBadgeColors, lightColors } from '@/theme/light';
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    ...typography.footnote,
    fontWeight: '600',
  },
});
