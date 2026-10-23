import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';
import { WeekActivityRow } from '@/components/ui/WeekActivityRow';
import { lightColors } from '@/theme/light';
import { cardShadow } from '@/theme/shadows';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type StreakHeroCardProps = {
  racha: number;
  activeDays: boolean[];
};

export function StreakHeroCard({ racha, activeDays }: StreakHeroCardProps) {
  return (
    <LinearGradient
      colors={[lightColors.heroGradientStart, lightColors.heroGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}>
      <View style={styles.top}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.counter}>
          <Text style={styles.value}>{racha}</Text>
          <Text style={styles.unit}>días</Text>
        </View>
      </View>
      <Text style={styles.hint}>Tu racha destacada</Text>
      <WeekActivityRow activeDays={activeDays} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...cardShadow,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 56,
    height: 56,
  },
  counter: {
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 48,
    lineHeight: 52,
    fontFamily: 'Inter_700Bold',
    color: lightColors.primaryForeground,
  },
  unit: {
    ...typography.subhead,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Inter_600SemiBold',
  },
  hint: {
    ...typography.footnote,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.sm,
  },
});
