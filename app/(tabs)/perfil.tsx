import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { AchievementBadge } from '@/components/perfil/AchievementBadge';
import { AppHeader } from '@/components/ui/AppHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingView } from '@/components/ui/LoadingView';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatCard } from '@/components/ui/StatCard';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { TextField } from '@/components/ui/TextField';
import { useSession } from '@/context/SessionContext';
import { calcularLogros } from '@/lib/logros';
import { mensajeErrorAmigable } from '@/lib/errors';
import { obtenerResumenInicio } from '@/services/api/inicio';
import { listarMisDesafios } from '@/services/api/desafios';
import { actualizarUsuario } from '@/services/api/usuarios';
import { obtenerRanking } from '@/services/api/ranking';
import { lightColors } from '@/theme/light';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { DesafioResumen } from '@/types/api';

export default function PerfilScreen() {
  const { usuario, usuarioId, refrescarUsuario, cerrarSesion } = useSession();
  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  const [zonaHoraria, setZonaHoraria] = useState(usuario?.zonaHoraria ?? '');
  const [finalizados, setFinalizados] = useState<
    Array<{ desafio: DesafioResumen; resultado: string }>
  >([]);
  const [mejorRacha, setMejorRacha] = useState(0);
  const [activos, setActivos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const inicial = usuario?.alias?.charAt(0).toUpperCase() ?? '?';

  const cargar = useCallback(async () => {
    if (!usuarioId) return;
    setLoading(true);
    setError(null);
    try {
      const [desafios, resumen] = await Promise.all([
        listarMisDesafios(),
        obtenerResumenInicio(),
      ]);
      const vigentes = desafios.filter(
        (d) => d.estado === 'ACTIVO' || d.estado === 'PROGRAMADO',
      );
      setActivos(vigentes.length);
      setMejorRacha(
        resumen.desafios.reduce((max, item) => Math.max(max, item.rachaActual), 0),
      );
      const terminados = desafios.filter((d) => d.estado === 'FINALIZADO');
      const conResultado = await Promise.all(
        terminados.map(async (desafio) => {
          try {
            const ranking = await obtenerRanking(desafio.id);
            const fila = ranking.ranking.find((r) => r.usuarioId === usuarioId);
            const texto = fila
              ? `Puesto #${fila.posicion} · ${fila.puntosTotales} pts`
              : 'Sin ranking';
            return { desafio, resultado: texto };
          } catch {
            return { desafio, resultado: 'Finalizado' };
          }
        }),
      );
      setFinalizados(conResultado);
    } catch (err) {
      setError(mensajeErrorAmigable(err));
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useFocusEffect(
    useCallback(() => {
      setNombre(usuario?.nombre ?? '');
      setZonaHoraria(usuario?.zonaHoraria ?? '');
      cargar();
    }, [cargar, usuario]),
  );

  const logros = useMemo(
    () =>
      calcularLogros({
        mejorRacha,
        completados: finalizados.length,
        activos,
      }),
    [mejorRacha, finalizados.length, activos],
  );

  const guardar = async () => {
    if (!usuarioId) return;
    setGuardando(true);
    try {
      await actualizarUsuario({ nombre, zonaHoraria });
      await refrescarUsuario();
    } catch (err) {
      alert(mensajeErrorAmigable(err));
    } finally {
      setGuardando(false);
    }
  };

  const salir = async () => {
    await cerrarSesion();
    router.replace('/(auth)/ingreso');
  };

  if (loading) return <LoadingView />;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppHeader title="Perfil" rightIcon="settings" />

        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{inicial}</Text>
          </View>
          <Text style={styles.alias}>@{usuario?.alias}</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard icon="flame" value={String(mejorRacha)} label="días de racha" />
          <StatCard
            icon="trophy"
            value={String(finalizados.length)}
            label="completados"
          />
          <StatCard icon="flash" value={String(activos)} label="activos" />
        </View>

        <SectionHeader title="Logros" />
        {logros.length === 0 ? (
          <Text style={styles.emptyLogros}>
            Seguí participando para desbloquear insignias.
          </Text>
        ) : (
          <View style={styles.logrosGrid}>
            {logros.map((logro) => (
              <AchievementBadge key={logro.id} logro={logro} />
            ))}
          </View>
        )}

        {error ? <ErrorState message={error} onRetry={cargar} /> : null}

        <SectionHeader title="Tu cuenta" />
        <SurfaceCard>
          <TextField grouped value={nombre} onChangeText={setNombre} placeholder="Nombre" />
          <View style={styles.divider} />
          <TextField
            grouped
            value={usuario?.email ?? ''}
            editable={false}
            placeholder="Email"
          />
          <View style={styles.divider} />
          <TextField
            grouped
            value={zonaHoraria}
            onChangeText={setZonaHoraria}
            placeholder="Zona horaria IANA"
          />
        </SurfaceCard>
        <PrimaryButton
          label="Guardar cambios"
          onPress={guardar}
          disabled={guardando}
        />

        <SectionHeader title="Desafíos finalizados" />
        {finalizados.length === 0 ? (
          <Text style={styles.empty}>Todavía no tenés desafíos finalizados.</Text>
        ) : (
          finalizados.map(({ desafio, resultado }) => (
            <Pressable
              key={desafio.id}
              onPress={() => router.push(`/desafio/${desafio.id}`)}
              style={styles.finishedCard}>
              <View style={styles.finishedBody}>
                <Text style={styles.finishedTitle}>{desafio.nombre}</Text>
                <Text style={styles.finishedSub}>{resultado}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={lightColors.muted} />
            </Pressable>
          ))
        )}

        <PrimaryButton label="Cerrar sesión" variant="danger" onPress={salir} />
      </ScrollView>
    </SafeAreaView>
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
  avatarWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: lightColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: lightColors.primaryDark,
  },
  alias: {
    ...typography.title2,
    fontFamily: 'Inter_600SemiBold',
    color: lightColors.labelSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  logrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  emptyLogros: {
    ...typography.subhead,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: lightColors.separator,
    marginVertical: spacing.sm,
  },
  empty: {
    ...typography.body,
    color: lightColors.labelSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  finishedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  finishedBody: {
    flex: 1,
    gap: 2,
  },
  finishedTitle: {
    ...typography.headline,
    fontFamily: 'Inter_600SemiBold',
  },
  finishedSub: {
    ...typography.footnote,
    color: lightColors.labelSecondary,
  },
});
