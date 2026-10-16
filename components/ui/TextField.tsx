import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { lightColors } from '@/theme/light';
import { radius } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type TextFieldProps = TextInputProps & {
  grouped?: boolean;
};

export function TextField({ style, grouped = true, ...props }: TextFieldProps) {
  return (
    <TextInput
      placeholderTextColor={lightColors.muted}
      style={[styles.input, grouped && styles.grouped, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    ...typography.body,
    backgroundColor: lightColors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  grouped: {
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
});
