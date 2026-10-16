import { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { DesafioListRow } from '@/components/desafio/DesafioListRow';
import { CategoriaIcon } from '@/components/desafio/CategoriaIcon';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { GroupedSection, SectionTitle } from '@/components/ui/GroupedSection';
import { ListRow } from '@/components/ui/ListRow';
import { LoadingView } from '@/components/ui/LoadingView';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SelectField } from '@/components/ui/SelectField';
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
import { listarDesafios, unirseDesafio } from '@/services/api/desafios';
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
    { value: '' as CategoriaDesafio | '', label: 'Todas' },
    ...CATEGORIAS_ORDEN.map((c) => ({
      value: c,
      label: metaCategoria(c).label,
      left: <CategoriaIcon categoria={c} size="sm" />,
    })),
  ];

  if (loading && items.length === 0) return <LoadingView />;

  const header = (
    <View style={styles.header}>
      <ScreenHeader title="Explorar" />
      <GroupedSection title="Filtros">
        <SelectField
          label="Estado"
          value={estado}
          options={estadoOptions}
          onChange={setEstado}
          isLast={false}
        />
        <View style={styles.divider} />
        <SelectField
          label="Categoría"
          value={categoria}
          options={categoriaOptions}
          onChange={setCategoria}
          isLast
        />
      </GroupedSection>
      <GroupedSection>
        <ListRow
          title="Unirse con código"
          subtitle="Ingresá el código de 6 caracteres"
          onPress={() => setModalCodigo(true)}
          isLast
        />
      </GroupedSection>
      {error ? <ErrorState message={error} onRetry={cargar} /> : null}
      {items.length > 0 ? (
        <View style={styles.desafiosSection}>
          <SectionTitle>Desafíos</SectionTitle>
          {items.map((item) => (
            <DesafioListRow
              key={item.id}
              desafio={item}
              hoy={hoy}
              onPress={() => router.push(`/desafio/${item.id}`)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={header}
        ListEmptyComponent={
          !error && items.length === 0
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
          <PrimaryButton
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
    gap: spacing.sm,
  },
  desafiosSection: {
    marginBottom: spacing.lg,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: lightColors.separator,
    marginLeft: spacing.lg,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  modalTitle: {
    ...typography.title2,
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing.md,
  },
  modalInput: {
    backgroundColor: lightColors.background,
    marginBottom: spacing.md,
  },
  modalActions: {
    gap: spacing.sm,
  },
});
