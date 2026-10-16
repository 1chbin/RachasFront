import { useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { DesafioCard } from '@/components/desafio/DesafioCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingView } from '@/components/ui/LoadingView';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { useSession } from '@/context/SessionContext';
import { useResumenInicio } from '@/hooks/useResumenInicio';
import { hoyCalendario } from '@/lib/fechas';
import { mensajeErrorAmigable } from '@/lib/errors';
import { registrarCheckIn } from '@/services/api/checkIns';
import { lightColors } from '@/theme/light';
import { typography } from '@/theme/typography';

export default function InicioScreen() {
  const { usuarioId, usuario } = useSession();
  const { items, loading, error, recargar } = useResumenInicio(usuarioId);
  const [refreshing, setRefreshing] = useState(false);
  const [checkInId, setCheckInId] = useState<string | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await recargar();
    setRefreshing(false);
  };

  const hacerCheckIn = async (desafioId: string) => {
    if (!usuario) return;
    setCheckInId(desafioId);
    try {
      await registrarCheckIn(desafioId, { dia: hoyCalendario(usuario.zonaHoraria) });
      await recargar();
    } catch (err) {
      alert(mensajeErrorAmigable(err));
    } finally {
      setCheckInId(null);
    }
  };

  if (loading && !refreshing) return <LoadingView />;

  const mejorRacha = items.reduce((max, item) => Math.max(max, item.rachaActual), 0);

  return (
    <Screen
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <Text style={styles.largeTitle}>Tus desafíos</Text>
        {items.length > 0 ? (
          <View style={styles.hero}>
            <Text style={styles.heroLabel}>Racha destacada</Text>
            <Text style={styles.heroValue}>{mejorRacha}</Text>
            <Text style={styles.heroHint}>días consecutivos</Text>
          </View>
        ) : null}

        {error ? <ErrorState message={error} onRetry={recargar} /> : null}

        {!error && items.length === 0 ? (
          <EmptyState
            showLogo
            title="Todavía no tenés desafíos"
            message="Unite con un código o creá uno nuevo."
            action={
              <View style={styles.actions}>
                <PrimaryButton
                  label="Explorar"
                  onPress={() => router.push('/(tabs)/explorar')}
                />
                <PrimaryButton
                  label="Crear desafío"
                  variant="secondary"
                  onPress={() => router.push('/(tabs)/crear')}
                />
              </View>
            }
          />
        ) : null}

        {items.map((item) => (
          <DesafioCard
            key={item.desafio.id}
            item={item}
            onPress={() => router.push(`/desafio/${item.desafio.id}`)}
            onCheckIn={() => hacerCheckIn(item.desafio.id)}
            checkInLoading={checkInId === item.desafio.id}
          />
        ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  largeTitle: {
    ...typography.largeTitle,
    color: lightColors.label,
    marginBottom: 16,
    fontFamily: 'Inter_700Bold',
  },
  hero: {
    backgroundColor: lightColors.primarySoft,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  heroLabel: {
    ...typography.subhead,
    color: lightColors.primaryDark,
    fontFamily: 'Inter_600SemiBold',
  },
  heroValue: {
    fontSize: 48,
    fontWeight: '700',
    color: lightColors.streak,
    fontFamily: 'Inter_700Bold',
  },
  heroHint: {
    ...typography.footnote,
    color: lightColors.labelSecondary,
    fontFamily: 'Inter_400Regular',
  },
  actions: { gap: 8, width: '100%' },
});
