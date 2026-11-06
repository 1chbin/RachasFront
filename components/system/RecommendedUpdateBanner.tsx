import { useRecommendedUpdateBanner } from '@/hooks/useRecommendedUpdateBanner';
import { lightColors } from '@/theme/light';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function RecommendedUpdateBanner() {
  const { visible, recommended, dismiss } = useRecommendedUpdateBanner();

  if (!visible || !recommended) {
    return null;
  }

  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <Text style={styles.title}>Hay una versión más nueva</Text>
      <Text style={styles.body}>
        Recomendamos actualizar a la versión {recommended} cuando puedas.
      </Text>
      <Pressable onPress={() => void dismiss()} style={styles.dismiss}>
        <Text style={styles.dismissText}>Ahora no</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#2d3a5c',
    borderBottomWidth: 1,
    borderBottomColor: '#3d4f7a',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 4,
  },
  body: {
    color: '#d0dcf5',
    fontSize: 13,
    marginBottom: 8,
  },
  dismiss: {
    alignSelf: 'flex-start',
  },
  dismissText: {
    color: lightColors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
