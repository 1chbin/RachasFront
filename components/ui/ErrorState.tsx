import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { lightColors } from '@/theme/light';
import { typography } from '@/theme/typography';

type ErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Algo salió mal</Text>
      <Text style={styles.message}>{message}</Text>
      <PrimaryButton label="Reintentar" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'stretch',
    gap: 12,
    paddingVertical: 24,
  },
  title: {
    ...typography.headline,
    color: lightColors.label,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: lightColors.labelSecondary,
    textAlign: 'center',
  },
});
