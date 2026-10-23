import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';
import { lightColors } from '@/theme/light';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { cardShadow } from '@/theme/shadows';

type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Buscar desafíos, categorías...',
}: SearchFieldProps) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="search" size={20} color={lightColors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={lightColors.muted}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: lightColors.surface,
    borderRadius: radius.chip,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    ...cardShadow,
  },
  input: {
    flex: 1,
    ...typography.body,
    padding: 0,
    color: lightColors.label,
  },
});
