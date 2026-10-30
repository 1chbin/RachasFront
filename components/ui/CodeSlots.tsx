import { type ComponentRef, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { lightColors } from '@/theme/light';
import { cardShadow } from '@/theme/shadows';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type CodeSlotsProps = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
};

export function CodeSlots({
  length = 6,
  value,
  onChange,
  autoFocus = true,
}: CodeSlotsProps) {
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const chars = value.toUpperCase().slice(0, length).split('');
  while (chars.length < length) {
    chars.push('');
  }
  const focusIndex = Math.min(value.length, length - 1);

  const applyText = (raw: string) => {
    const cleaned = raw
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, length);
    onChange(cleaned);
  };

  return (
    <Pressable
      accessibilityRole="none"
      onPress={() => inputRef.current?.focus()}
      style={styles.wrap}>
      {chars.map((char, index) => {
        const focused = index === focusIndex && value.length < length;
        return (
          <View
            key={index}
            style={[styles.slot, focused && styles.slotFocused, char && styles.slotFilled]}>
            <Text style={styles.char}>{char}</Text>
          </View>
        );
      })}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={applyText}
        autoCapitalize="characters"
        autoCorrect={false}
        autoComplete="off"
        maxLength={length}
        autoFocus={autoFocus}
        caretHidden
        style={styles.hiddenInput}
        accessibilityLabel="Código de invitación de 6 caracteres"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  slot: {
    flex: 1,
    aspectRatio: 0.85,
    maxWidth: 48,
    borderRadius: radius.md,
    backgroundColor: lightColors.background,
    borderWidth: 1.5,
    borderColor: lightColors.separator,
    alignItems: 'center',
    justifyContent: 'center',
    ...cardShadow,
  },
  slotFocused: {
    borderColor: lightColors.primary,
    backgroundColor: lightColors.primarySoft,
  },
  slotFilled: {
    borderColor: lightColors.primary,
  },
  char: {
    ...typography.title2,
    fontFamily: 'Inter_700Bold',
    color: lightColors.label,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
});
