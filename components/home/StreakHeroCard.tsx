import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { WeekActivityRow } from '@/components/ui/WeekActivityRow';
import { lightColors } from '@/theme/light';
import { cardShadow } from '@/theme/shadows';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type StreakHeroCardProps = {
  racha: number;
  activeDays: boolean[];
  todayIndex: number;
  onPress: () => void;
};

const CARD_GRADIENT = {
  colors: ['#7C3AED', '#8B5CF6', '#C4B5FD', '#EDE9FE'] as const,
  locations: [0, 0.38, 0.72, 1] as const,
};

const LOGO_SIZE = 100;

export function StreakHeroCard({
  racha,
  activeDays,
  todayIndex,
  onPress,
}: StreakHeroCardProps) {
  const useNativeBlur = Platform.OS !== 'web';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ver desafío de tu racha"
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
      <LinearGradient
      colors={[...CARD_GRADIENT.colors]}
      locations={[...CARD_GRADIENT.locations]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradient}>
      <View style={styles.cardBody}>
        <View style={styles.heroTop}>
          <View style={styles.counter}>
            <Text style={styles.hint}>Tu racha actual</Text>
            <Text style={styles.valueLine}>
              <Text style={styles.value}>{racha}</Text>
              <Text style={styles.unit}> días</Text>
            </Text>
          </View>

          <View style={styles.mascotAnchor} pointerEvents="none">
            {Platform.OS === 'android' ? (
              <>
                <View style={styles.logoGlowOuter} />
                <View style={styles.logoGlowInner} />
              </>
            ) : null}
            <View style={styles.logoWrap}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        <View style={styles.weekPanelOuter}>
          {useNativeBlur ? (
            <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={styles.webGlassFallback} />
          )}
          <LinearGradient
            colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.92)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.weekPanelContent}>
            <WeekActivityRow
              variant="heroGlass"
              activeDays={activeDays}
              todayIndex={todayIndex}
            />
          </View>
        </View>

        <View style={styles.chevronHit} pointerEvents="none">
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.9)" />
        </View>
      </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: radius.card,
    marginBottom: spacing.lg,
    ...cardShadow,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  gradient: {
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  cardBody: {
    position: 'relative',
  },
  heroTop: {
    position: 'relative',
    minHeight: 92,
    paddingRight: LOGO_SIZE * 0.52,
    zIndex: 0,
  },
  counter: {
    maxWidth: '100%',
    gap: 4,
    paddingTop: 0,
  },
  chevronHit: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 15,
    padding: 4,
    ...Platform.select({
      android: { elevation: 12 },
      ios: {},
      default: {},
    }),
  },
  mascotAnchor: {
    position: 'absolute',
    right: -4,
    top: -16,
    zIndex: 0,
    elevation: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlowOuter: {
    position: 'absolute',
    width: LOGO_SIZE * 1.28,
    height: LOGO_SIZE * 1.28,
    borderRadius: LOGO_SIZE * 0.64,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  logoGlowInner: {
    position: 'absolute',
    width: LOGO_SIZE * 1.15,
    height: LOGO_SIZE * 1.15,
    borderRadius: LOGO_SIZE * 0.575,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  logoWrap: {
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 22,
      },
      android: {},
      default: {},
    }),
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  hint: {
    ...typography.footnote,
    color: 'rgba(255,255,255,0.92)',
    fontFamily: 'Inter_600SemiBold',
  },
  valueLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 48,
    lineHeight: 52,
    fontFamily: 'Inter_700Bold',
    color: lightColors.primaryForeground,
  },
  unit: {
    fontSize: 30,
    lineHeight: 38,
    fontFamily: 'Inter_700Bold',
    color: lightColors.primaryForeground,
  },
  weekPanelOuter: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.5)',
    marginTop: -4,
    zIndex: 10,
    ...Platform.select({
      android: { elevation: 10 },
      ios: {},
      default: {},
    }),
  },
  webGlassFallback: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  weekPanelContent: {
    paddingVertical: 18,
    paddingHorizontal: 8,
  },
});
