import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { ChallengeExploreCard } from '@/components/desafio/ChallengeExploreCard';
import { CategoriaIcon } from '@/components/desafio/CategoriaIcon';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterChips } from '@/components/ui/FilterChips';
import { GradientButton } from '@/components/ui/GradientButton';
import { LoadingView } from '@/components/ui/LoadingView';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SearchField } from '@/components/ui/SearchField';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { CodeSlots } from '@/components/ui/CodeSlots';
import { useSession } from '@/context/SessionContext';
import { useAlientoNotifications } from '@/context/AlientoNotificationsContext';
import {
  CATEGORIAS_ORDEN,
  ESTADOS_ORDEN,
  etiquetaEstado,
  metaCategoria,
} from '@/lib/categorias';
import { hoyCalendario } from '@/lib/fechas';
import { mensajeErrorAmigable } from '@/lib/errors';
import { track } from '@/services/analytics/track';
import { listarDesafios, listarParticipantes, unirseDesafio } from '@/services/api/desafios';
import { lightColors } from '@/theme/light';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { CategoriaDesafio, DesafioResumen, EstadoDesafio } from '@/types/api';

export default function ExplorarScreen() {
  const { usuario } = useSession();
  const { refrescarSuscripcionesAliento } = useAlientoNotifications();
  const hoy = hoyCalendario(
    usuario?.zonaHoraria ?? 'America/Argentina/Buenos_Aires',
  );
  const [items, setItems] = useState<DesafioResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoDesafio | ''>('');
  const [categoria, setCategoria] = useState<CategoriaDesafio | ''>('');
  const [busqueda, setBusqueda] = useState('');
  const [participantsById, setParticipantsById] = useState<Record<string, string[]>>(
    {},
  );
  const [modalCodigo, setModalCodigo] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [uniendo, setUniendo] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listarDesafios({
        page: 1,
        limit: 50,
        estado: estado || undefined,
        categoria: categoria || undefined,
      });
      setItems(res.data);
    } catch (err) {
      setError(mensajeErrorAmigable(err));
    } finally {
      setLoading(false);
    }
  }, [estado, categoria]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return items;
    return items.filter((d) => {
      const cat = metaCategoria(d.categoria).label.toLowerCase();
      return (
        d.nombre.toLowerCase().includes(q) ||
        (d.descripcion?.toLowerCase().includes(q) ?? false) ||
        cat.includes(q)
      );
    });
  }, [busqueda, items]);

  useEffect(() => {
    const ids = filtrados.slice(0, 8).map((d) => d.id);
    if (ids.length === 0) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        ids.map(async (id) => {
          try {
            const participantes = await listarParticipantes(id);
            return [id, participantes.map((p) => p.usuario.alias)] as [string, string[]];
          } catch {
            return [id, [] as string[]] as [string, string[]];
          }
        }),
      );
      if (!cancelled) {
        setParticipantsById((prev) => {
          const next = { ...prev };
          for (const [id, aliases] of entries) {
            next[id] = aliases;
          }
          return next;
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filtrados]);

  const unirse = async () => {
    setUniendo(true);
    try {
      const res = await unirseDesafio(codigo.trim().toUpperCase());
      await track('desafio_unido', { desafio_id: res.desafio.id });
      setModalCodigo(false);
      setCodigo('');
      await refrescarSuscripcionesAliento();
      router.push(`/desafio/${res.desafio.id}`);
    } catch (err) {
      alert(mensajeErrorAmigable(err));
    } finally {
      setUniendo(false);
    }
  };

  const estadoOptions = [
    { value: '' as const, label: 'Todos' },
    ...ESTADOS_ORDEN.map((e) => ({ value: e, label: etiquetaEstado(e) })),
  ];

  const categoriaOptions = [
    { value: '' as CategoriaDesafio | '', label: 'Todos' },
    ...CATEGORIAS_ORDEN.map((c) => ({
      value: c,
      label: metaCategoria(c).label,
      renderLeft: (active: boolean) => (
        <CategoriaIcon
          categoria={c}
          size="sm"
          iconColor={active ? lightColors.primaryForeground : undefined}
        />
      ),
    })),
  ];

  if (loading && items.length === 0) return <LoadingView />;

  /** Fuera del FlatList: en iOS el toque dentro de ListHeader + RefreshControl a veces no abre el modal. */
  const explorarSuperior = (
    <View style={styles.header}>
      <AppHeader title="Explorar" showLogo={false} />
      <SearchField value={busqueda} onChangeText={setBusqueda} />
      <FilterChips options={categoriaOptions} value={categoria} onChange={setCategoria} />
      <FilterChips options={estadoOptions} value={estado} onChange={setEstado} />

      <TouchableOpacity
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Unirse con código de invitación"
        onPress={() => setModalCodigo(true)}>
        <SurfaceCard style={styles.joinCard}>
          <View style={styles.joinRow}>
            <View style={styles.joinIcon}>
              <Ionicons name="people" size={22} color={lightColors.primary} />
            </View>
            <View style={styles.joinText}>
              <Text style={styles.joinTitle}>Unirse con código</Text>
              <Text style={styles.joinSubtitle}>Ingresá el código de 6 caracteres</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={lightColors.muted} />
          </View>
        </SurfaceCard>
      </TouchableOpacity>

      {error ? <ErrorState message={error} onRetry={cargar} /> : null}
    </View>
  );

  const listHeader =
    filtrados.length > 0 ? (
      <SectionHeader title="Desafíos destacados" />
    ) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.body}>
        <View style={styles.topZone} collapsable={false}>
          {explorarSuperior}
        </View>
        <FlatList
          style={styles.listFlex}
          data={filtrados}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={listHeader}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <ChallengeExploreCard
              desafio={item}
              hoy={hoy}
              participantAliases={participantsById[item.id]}
              onPress={() => router.push(`/desafio/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            !error && filtrados.length === 0 ? (
              <EmptyState
                title="Sin resultados"
                message="Probá otros filtros o creá un desafío."
              />
            ) : undefined
          }
          refreshControl={<RefreshControl refreshing={loading} onRefresh={cargar} />}
          contentContainerStyle={styles.list}
        />
      </View>

      <Modal
        visible={modalCodigo}
        transparent
        animationType="slide"
        onRequestClose={() => setModalCodigo(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setModalCodigo(false)}
            accessibilityLabel="Cerrar código de invitación"
          />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Código de invitación</Text>
            <Text style={styles.modalSubtitle}>Ingresá las 6 letras o números</Text>
            <CodeSlots value={codigo} onChange={setCodigo} />
            <View style={styles.modalActions}>
              <GradientButton
                label="Unirme"
                onPress={unirse}
                disabled={codigo.length < 6 || uniendo}
              />
              <PrimaryButton
                label="Cancelar"
                variant="secondary"
                onPress={() => setModalCodigo(false)}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
  /** Evita que el FlatList (hermano posterior) se superponga y robe toques en iOS. */
  topZone: {
    flexShrink: 0,
    zIndex: 2,
  },
  listFlex: {
    flex: 1,
    minHeight: 0,
    zIndex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
  },
  joinCard: {
    marginBottom: spacing.lg,
  },
  joinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  joinIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: lightColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinText: {
    flex: 1,
    gap: 2,
  },
  joinTitle: {
    ...typography.headline,
    fontFamily: 'Inter_700Bold',
  },
  joinSubtitle: {
    ...typography.footnote,
    color: lightColors.labelSecondary,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: lightColors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalTitle: {
    ...typography.title2,
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    ...typography.footnote,
    color: lightColors.labelSecondary,
    marginBottom: spacing.md,
  },
  modalActions: {
    gap: spacing.sm,
  },
});
