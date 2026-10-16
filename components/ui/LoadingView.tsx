import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { lightColors } from '@/theme/light';

export function LoadingView() {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={lightColors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: Platform.OS === 'web' ? '100%' : undefined,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: lightColors.background,
  },
});
