import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BadgeEstado } from '@/components/ui/BadgeEstado';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { lightColors } from '@/theme/light';
import { typography } from '@/theme/typography';
import type { ResumenInicioItem } from '@/types/api';

type DesafioCardProps = {
  item: ResumenInicioItem;
  onPress: () => void;
  onCheckIn: () => void;
  checkInLoading?: boolean;
};

export function DesafioCard({
  item,
  onPress,
  onCheckIn,
  checkInLoading,
}: DesafioCardProps) {
  const { desafio } = item;
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{desafio.nombre}</Text>
        <BadgeEstado estado={desafio.estado} />
      </View>
      <Text style={styles.meta}>
        Racha {item.rachaActual} · Puesto #{item.posicion} · {item.puntosTotales}{' '}
        pts
      </Text>
      <PrimaryButton
        label={item.checkInHoy ? 'Check-in de hoy hecho' : 'Check-in de hoy'}
        onPress={onCheckIn}
        disabled={item.checkInHoy || desafio.estado !== 'ACTIVO' || checkInLoading}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: lightColors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 12,
  },
  header: {
    gap: 8,
  },
  title: {
    ...typography.headline,
    color: lightColors.label,
  },
  meta: {
    ...typography.subhead,
    color: lightColors.streak,
    fontWeight: '600',
  },
});
