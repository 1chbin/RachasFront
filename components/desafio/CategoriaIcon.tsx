import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { metaCategoria } from '@/lib/categorias';
import { typography } from '@/theme/typography';
import type { CategoriaDesafio } from '@/types/api';

type CategoriaIconProps = {
  categoria: CategoriaDesafio;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  align?: 'center' | 'start';
};

export function CategoriaIcon({
  categoria,
  size = 'md',
  showLabel = false,
  align = 'center',
}: CategoriaIconProps) {
  const meta = metaCategoria(categoria);
  const dim = size === 'sm' ? 32 : 40;
  const iconSize = size === 'sm' ? 16 : 20;

  return (
    <View style={[styles.wrap, align === 'start' && styles.wrapStart]}>
      <View
        style={[
          styles.circle,
          { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: meta.soft },
        ]}>
        <Ionicons name={meta.icon} size={iconSize} color={meta.tint} />
      </View>
      {showLabel ? (
        <Text style={styles.label} numberOfLines={1}>
          {meta.label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 2,
    maxWidth: 72,
  },
  wrapStart: {
    alignItems: 'flex-start',
    maxWidth: undefined,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.caption,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
});
