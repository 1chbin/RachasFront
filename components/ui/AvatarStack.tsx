import { StyleSheet, Text, View } from 'react-native';
import { lightColors } from '@/theme/light';
import { typography } from '@/theme/typography';

type AvatarStackProps = {
  aliases: string[];
  max?: number;
};

export function AvatarStack({ aliases, max = 3 }: AvatarStackProps) {
  const visible = aliases.slice(0, max);
  if (visible.length === 0) {
    return null;
  }

  return (
    <View style={styles.row}>
      {visible.map((alias, index) => (
        <View
          key={`${alias}-${index}`}
          style={[styles.avatar, index > 0 && styles.overlap]}>
          <Text style={styles.initial}>
            {alias.charAt(0).toUpperCase()}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: lightColors.primarySoft,
    borderWidth: 2,
    borderColor: lightColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlap: {
    marginLeft: -10,
  },
  initial: {
    ...typography.caption,
    fontFamily: 'Inter_600SemiBold',
    color: lightColors.primaryDark,
  },
});
