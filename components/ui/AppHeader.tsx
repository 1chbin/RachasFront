import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { lightColors } from '@/theme/light';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type AppHeaderProps = {
  title: string;
  showLogo?: boolean;
  rightIcon?: 'notifications' | 'settings' | 'none';
  onRightPress?: () => void;
};

export function AppHeader({
  title,
  showLogo = true,
  rightIcon = 'none',
  onRightPress,
}: AppHeaderProps) {
  const iconName =
    rightIcon === 'notifications'
      ? 'notifications-outline'
      : rightIcon === 'settings'
        ? 'settings-outline'
        : null;

  return (
    <View style={styles.row}>
      {showLogo ? (
        <Pressable
          onPress={() => router.push('/(tabs)/inicio')}
          accessibilityRole="button"
          accessibilityLabel="Ir al inicio"
          hitSlop={8}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Pressable>
      ) : null}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {iconName ? (
        <Pressable
          onPress={onRightPress}
          accessibilityRole="button"
          accessibilityLabel={
            rightIcon === 'notifications' ? 'Notificaciones próximamente' : 'Ajustes'
          }
          hitSlop={8}
          style={styles.rightBtn}>
          <Ionicons name={iconName} size={22} color={lightColors.label} />
        </Pressable>
      ) : (
        <View style={styles.rightPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  logo: {
    width: 36,
    height: 36,
  },
  title: {
    ...typography.largeTitle,
    flex: 1,
    marginBottom: 0,
    fontSize: 28,
    lineHeight: 34,
  },
  rightBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightPlaceholder: {
    width: 40,
  },
});
