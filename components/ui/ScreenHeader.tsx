import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type ScreenHeaderProps = {
  title: string;
  showLogo?: boolean;
};

export function ScreenHeader({ title, showLogo = true }: ScreenHeaderProps) {
  const irInicio = () => {
    router.push('/(tabs)/inicio');
  };

  return (
    <View style={styles.row}>
      {showLogo ? (
        <Pressable
          onPress={irInicio}
          accessibilityRole="button"
          accessibilityLabel="Ir al inicio"
          hitSlop={8}
          style={styles.logoBtn}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Pressable>
      ) : null}
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  logoBtn: {
    width: 36,
    height: 36,
  },
  logo: {
    width: 36,
    height: 36,
  },
  title: {
    ...typography.largeTitle,
    flex: 1,
    marginBottom: 0,
  },
});
