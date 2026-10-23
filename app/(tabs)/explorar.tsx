import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { ChallengeExploreCard } from '@/components/desafio/ChallengeExploreCard';
import { CategoriaIcon } from '@/components/desafio/CategoriaIcon';
import { AppHeader } from '@/components/ui/AppHeader';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterChips } from '@/components/ui/FilterChips';
import { GradientButton } from '@/components/ui/GradientButton';
import { LoadingView } from '@/components/ui/LoadingView';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SearchField } from '@/components/ui/SearchField';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { TextField } from '@/components/ui/TextField';
import { useSession } from '@/context/SessionContext';
import {
  CATEGORIAS_ORDEN,
  ESTADOS_ORDEN,
  etiquetaEstado,
  metaCategoria,
} from '@/lib/categorias';
import { hoyCalendario } from '@/lib/fechas';
import { mensajeErrorAmigable } from '@/lib/errors';
import { listarDesafios, listarParticipantes, unirseDesafio } from '@/services/api/desafios';
import { lightColors } from '@/theme/light';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { CategoriaDesafio, DesafioResumen, EstadoDesafio } from '@/types/api';

export default function ExplorarScreen() {
  const { usuario } = useSession();
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
      setModalCodigo(false);
      setCodigo('');
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
      left: <CategoriaIcon categoria={c} size="sm" />,
    })),
  ];

  if (loading && items.length === 0) return <LoadingView />;

  const header = (
    <View style={styles.header}>
      <AppHeader title="Explorar" showLogo={false} />
      <SearchField value={busqueda} onChangeText={setBusqueda} />
      <FilterChips options={categoriaOptions} value={categoria} onChange={setCategoria} />
      <FilterChips options={estadoOptions} value={estado} onChange={setEstado} />

      <Pressable onPress={() => setModalCodigo(true)}>
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
      </Pressable>

      {error ? <ErrorState message={error} onRetry={cargar} /> : null}
      {filtrados.length > 0 ? (
        <SectionHeader title="Desafíos destacados" />
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <ChallengeExploreCard
            desafio={item}
            hoy={hoy}
            participantAliases={participantsById[item.id]}
            onPress={() => router.push(`/desafio/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          !error && filtrados.length === 0
            ? (
              <EmptyState
                title="Sin resultados"
                message="Probá otros filtros o creá un desafío."
              />
            )
            : null
        }
        refreshControl={<RefreshControl refreshing={loading} onRefresh={cargar} />}
        contentContainerStyle={styles.list}
      />

      <BottomSheet
        visible={modalCodigo}
        onClose={() => setModalCodigo(false)}
        size="compact">
        <Text style={styles.modalTitle}>Código de invitación</Text>
        <TextField
          autoCapitalize="characters"
          maxLength={6}
          value={codigo}
          onChangeText={setCodigo}
          placeholder="ABC123"
          style={styles.modalInput}
        />
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
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
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
  modalTitle: {
    ...typography.title2,
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing.md,
  },
  modalInput: {
    marginBottom: spacing.md,
  },
  modalActions: {
    gap: spacing.sm,
  },
});
