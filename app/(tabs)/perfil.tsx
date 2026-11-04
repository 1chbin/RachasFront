import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { AchievementBadge } from '@/components/perfil/AchievementBadge';
import { CategoriaIcon } from '@/components/desafio/CategoriaIcon';
import { AppHeader } from '@/components/ui/AppHeader';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ErrorState } from '@/components/ui/ErrorState';
import { GradientButton } from '@/components/ui/GradientButton';
import { ListRow } from '@/components/ui/ListRow';
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
import {
  getAnalyticsConsent,
  setAnalyticsConsent,
} from '@/services/analytics/track';
import { actualizarUsuario } from '@/services/api/usuarios';
import { obtenerRanking } from '@/services/api/ranking';
import { lightColors } from '@/theme/light';
import { cardShadow } from '@/theme/shadows';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { DesafioResumen } from '@/types/api';

function etiquetaZonaHoraria(iana: string): string {
  const segment = iana.split('/').pop() ?? iana;
  return segment.replace(/_/g, ' ');
}

type EditField = 'nombre' | 'zonaHoraria' | null;

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
  const [editField, setEditField] = useState<EditField>(null);
  const [draft, setDraft] = useState('');
  const [compartirUso, setCompartirUso] = useState(true);

  useEffect(() => {
    void getAnalyticsConsent().then(setCompartirUso);
  }, []);

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
              : 'Finalizado';
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

  const abrirEdicion = (field: Exclude<EditField, null>) => {
    setEditField(field);
    setDraft(field === 'nombre' ? nombre : zonaHoraria);
  };

  const guardarCampo = async () => {
    if (!usuarioId || !editField) return;
    const payload =
      editField === 'nombre'
        ? { nombre: draft.trim(), zonaHoraria }
        : { nombre, zonaHoraria: draft.trim() };
    if (editField === 'nombre' && !payload.nombre) {
      alert('El nombre no puede estar vacío.');
      return;
    }
    if (editField === 'zonaHoraria' && !payload.zonaHoraria) {
      alert('Ingresá una zona horaria IANA válida.');
      return;
    }
    setGuardando(true);
    try {
      await actualizarUsuario(payload);
      if (editField === 'nombre') setNombre(payload.nombre);
      else setZonaHoraria(payload.zonaHoraria);
      await refrescarUsuario();
      setEditField(null);
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
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{inicial}</Text>
            </View>
          </View>
          <Text style={styles.alias}>@{usuario?.alias}</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            icon="flame"
            iconColor={lightColors.streak}
            value={String(mejorRacha)}
            label="días de racha"
          />
          <StatCard
            icon="trophy"
            iconColor="#EAB308"
            value={String(finalizados.length)}
            label="completados"
          />
          <StatCard
            icon="flash"
            iconColor={lightColors.primary}
            value={String(activos)}
            label="activos"
          />
        </View>

        <SectionHeader title="Logros" />
        {logros.length === 0 ? (
          <Text style={styles.emptyLogros}>
            Seguí participando para desbloquear insignias.
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.logrosRow}>
            {logros.map((logro) => (
              <AchievementBadge key={logro.id} logro={logro} />
            ))}
          </ScrollView>
        )}

        {error ? <ErrorState message={error} onRetry={cargar} /> : null}

        <SectionHeader title="Tu cuenta" />
        <SurfaceCard style={styles.accountCard}>
          <ListRow
            title={nombre || 'Sin nombre'}
            left={
              <View style={styles.rowIcon}>
                <Ionicons name="person-outline" size={20} color={lightColors.primary} />
              </View>
            }
            onPress={() => abrirEdicion('nombre')}
          />
          <ListRow
            title={usuario?.email ?? '—'}
            left={
              <View style={styles.rowIcon}>
                <Ionicons name="mail-outline" size={20} color={lightColors.primary} />
              </View>
            }
            showChevron={false}
          />
          <ListRow
            title={etiquetaZonaHoraria(zonaHoraria)}
            subtitle={zonaHoraria}
            isLast
            left={
              <View style={styles.rowIcon}>
                <Ionicons name="globe-outline" size={20} color={lightColors.primary} />
              </View>
            }
            onPress={() => abrirEdicion('zonaHoraria')}
          />
        </SurfaceCard>

        <SectionHeader title="Privacidad" />
        <SurfaceCard>
          <View style={styles.privacyRow}>
            <View style={styles.privacyText}>
              <Text style={styles.privacyTitle}>Compartir datos de uso</Text>
              <Text style={styles.privacySub}>
                Eventos anónimos de producto (sin emails ni notas).
              </Text>
            </View>
            <Switch
              value={compartirUso}
              onValueChange={(value) => {
                setCompartirUso(value);
                void setAnalyticsConsent(value);
              }}
            />
          </View>
        </SurfaceCard>

        <SectionHeader title="Desafíos finalizados" />
        {finalizados.length === 0 ? (
          <Text style={styles.empty}>Todavía no tenés desafíos finalizados.</Text>
        ) : (
          finalizados.map(({ desafio, resultado }) => (
            <Pressable
              key={desafio.id}
              onPress={() => router.push(`/desafio/${desafio.id}`)}
              style={styles.finishedCard}>
              <View style={styles.finishedIcon}>
                <CategoriaIcon categoria={desafio.categoria} size="sm" />
              </View>
              <View style={styles.finishedBody}>
                <Text style={styles.finishedTitle}>{desafio.nombre}</Text>
                <Text style={styles.finishedSub}>{resultado}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={lightColors.muted} />
            </Pressable>
          ))
        )}

        <View style={styles.logoutWrap}>
          <PrimaryButton label="Cerrar sesión" variant="danger" onPress={salir} />
        </View>
      </ScrollView>

      <BottomSheet
        visible={editField !== null}
        onClose={() => setEditField(null)}
        size="compact">
        <Text style={styles.sheetTitle}>
          {editField === 'nombre' ? 'Nombre' : 'Zona horaria'}
        </Text>
        <TextField
          value={draft}
          onChangeText={setDraft}
          placeholder={
            editField === 'nombre' ? 'Tu nombre' : 'America/Argentina/Buenos_Aires'
          }
          autoCapitalize={editField === 'nombre' ? 'words' : 'none'}
          style={styles.sheetField}
        />
        {editField === 'zonaHoraria' ? (
          <Text style={styles.sheetHint}>
            Usá el identificador IANA (ej. America/Argentina/Buenos_Aires).
          </Text>
        ) : null}
        <View style={styles.sheetActions}>
          <GradientButton
            label={guardando ? 'Guardando…' : 'Guardar'}
            onPress={guardarCampo}
            disabled={guardando}
          />
          <PrimaryButton
            label="Cancelar"
            variant="secondary"
            onPress={() => setEditField(null)}
          />
        </View>
      </BottomSheet>
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
  avatarRing: {
    padding: 4,
    borderRadius: 52,
    backgroundColor: lightColors.primarySoft,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: lightColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...cardShadow,
  },
  avatarText: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: lightColors.primaryDark,
  },
  alias: {
    ...typography.title2,
    fontFamily: 'Inter_700Bold',
    color: lightColors.label,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  logrosRow: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  accountCard: {
    padding: 0,
    marginBottom: spacing.lg,
  },
  emptyLogros: {
    ...typography.subhead,
    marginBottom: spacing.lg,
    textAlign: 'center',
    color: lightColors.labelSecondary,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: lightColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: spacing.md,
    ...cardShadow,
  },
  finishedIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: lightColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
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
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  privacyText: {
    flex: 1,
    gap: 4,
  },
  privacyTitle: {
    ...typography.headline,
    fontFamily: 'Inter_600SemiBold',
  },
  privacySub: {
    ...typography.footnote,
    color: lightColors.labelSecondary,
  },
  logoutWrap: {
    marginTop: spacing.xl,
  },
  sheetTitle: {
    ...typography.title2,
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing.md,
  },
  sheetField: {
    marginBottom: spacing.sm,
  },
  sheetHint: {
    ...typography.footnote,
    color: lightColors.labelSecondary,
    marginBottom: spacing.md,
  },
  sheetActions: {
    gap: spacing.sm,
  },
});
