import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAppVersion } from '@/services/api/client';
import { lightColors } from '@/theme/light';
import { typography } from '@/theme/typography';

export default function ActualizarAppScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.title}>Actualización requerida</Text>
        <Text style={styles.body}>
          Esta versión de Rachas ({getAppVersion()}) ya no es compatible con el
          servidor. Instalá la última versión para seguir usando la app.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: lightColors.background,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: lightColors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  title: {
    ...typography.title2,
    color: lightColors.label,
  },
  body: {
    ...typography.body,
    color: lightColors.labelSecondary,
  },
});
