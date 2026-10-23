import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChallengeHomeCard } from '@/components/desafio/ChallengeHomeCard';
import { StreakHeroCard } from '@/components/home/StreakHeroCard';
import { StreakBurst } from '@/components/streak/StreakBurst';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { GradientButton } from '@/components/ui/GradientButton';
import { LoadingView } from '@/components/ui/LoadingView';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useSession } from '@/context/SessionContext';
import { useResumenInicio } from '@/hooks/useResumenInicio';
import { useSemanaCheckIns } from '@/hooks/useSemanaCheckIns';
import { hoyCalendario } from '@/lib/fechas';
import { mensajeErrorAmigable } from '@/lib/errors';
import { registrarCheckIn } from '@/services/api/checkIns';
import { lightColors } from '@/theme/light';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export default function InicioScreen() {
  const { usuarioId, usuario } = useSession();
  const zona = usuario?.zonaHoraria ?? 'America/Argentina/Buenos_Aires';
  const { items, loading, error, recargar } = useResumenInicio(!!usuarioId);
  const [refreshing, setRefreshing] = useState(false);
  const [checkInId, setCheckInId] = useState<string | null>(null);
  const [burst, setBurst] = useState({
    visible: false,
    from: 0,
    to: 0,
  });

  const mejorRacha = items.reduce((max, item) => Math.max(max, item.rachaActual), 0);
  const desafioDestacado = useMemo(() => {
    const activos = items.filter((i) => i.desafio.estado === 'ACTIVO');
    if (activos.length === 0) {
      return items[0]?.desafio.id ?? null;
    }
    return activos.reduce((best, cur) =>
      cur.rachaActual > best.rachaActual ? cur : best,
    ).desafio.id;
  }, [items]);

  const { activeDays, recargarSemana } = useSemanaCheckIns(
    desafioDestacado,
    zona,
    !!desafioDestacado,
  );

  const primerNombre = usuario?.nombre?.split(' ')[0] ?? 'Rachero';

  const onRefresh = async () => {
    setRefreshing(true);
    await recargar();
    await recargarSemana();
    setRefreshing(false);
  };

  const cerrarBurst = useCallback(() => {
    setBurst((prev) => ({ ...prev, visible: false }));
  }, []);

  const hacerCheckIn = async (desafioId: string) => {
    if (!usuario) return;
    const antes = items.find((i) => i.desafio.id === desafioId)?.rachaActual ?? 0;
    setCheckInId(desafioId);
    try {
      await registrarCheckIn(desafioId, { dia: hoyCalendario(usuario.zonaHoraria) });
      const actualizados = await recargar();
      await recargarSemana();
      const nueva =
        actualizados.find((i) => i.desafio.id === desafioId)?.rachaActual ?? antes;
      if (nueva > antes) {
        setBurst({ visible: true, from: antes, to: nueva });
      }
    } catch (err) {
      alert(mensajeErrorAmigable(err));
    } finally {
      setCheckInId(null);
    }
  };

  if (loading && !refreshing) return <LoadingView />;

  return (
    <>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <AppHeader title="Rachas" rightIcon="notifications" />
          <Text style={styles.greeting}>¡Hola, {primerNombre}!</Text>
          <Text style={styles.subtitle}>Seguí con constancia ✨</Text>

          {items.length > 0 ? (
            <StreakHeroCard racha={mejorRacha} activeDays={activeDays} />
          ) : null}

          {error ? <ErrorState message={error} onRetry={recargar} /> : null}

          {!error && items.length === 0 ? (
            <EmptyState
              showLogo
              title="Todavía no tenés desafíos"
              message="Unite con un código o creá uno nuevo."
              action={
                <View style={styles.actions}>
                  <GradientButton
                    label="Explorar"
                    onPress={() => router.push('/(tabs)/explorar')}
                  />
                </View>
              }
            />
          ) : null}

          {items.length > 0 ? (
            <>
              <SectionHeader
                title="Tus desafíos"
                onAction={() => router.push('/(tabs)/explorar')}
              />
              {items.map((item) => (
                <ChallengeHomeCard
                  key={item.desafio.id}
                  item={item}
                  zonaHoraria={zona}
                  onPress={() => router.push(`/desafio/${item.desafio.id}`)}
                  onCheckIn={() => hacerCheckIn(item.desafio.id)}
                  checkInLoading={checkInId === item.desafio.id}
                />
              ))}
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>

      <StreakBurst
        visible={burst.visible}
        from={burst.from}
        to={burst.to}
        onComplete={cerrarBurst}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + spacing.lg,
  },
  greeting: {
    ...typography.title1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.subhead,
    marginBottom: spacing.lg,
  },
  actions: {
    width: '100%',
  },
});
