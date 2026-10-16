import { useCallback, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { BadgeEstado } from '@/components/ui/BadgeEstado';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingView } from '@/components/ui/LoadingView';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { mensajeErrorAmigable } from '@/lib/errors';
import { listarDesafios, unirseDesafio } from '@/services/api/desafios';
import { lightColors } from '@/theme/light';
import { typography } from '@/theme/typography';
import type { CategoriaDesafio, DesafioResumen, EstadoDesafio } from '@/types/api';

const categorias: CategoriaDesafio[] = [
  'SALUD',
  'ESTUDIO',
  'FINANZAS',
  'BIENESTAR',
  'OTRO',
];
const estados: EstadoDesafio[] = [
  'PROGRAMADO',
  'ACTIVO',
  'FINALIZADO',
  'CANCELADO',
];

export default function ExplorarScreen() {
  const [items, setItems] = useState<DesafioResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoDesafio | ''>('');
  const [categoria, setCategoria] = useState<CategoriaDesafio | ''>('');
  const [modalVisible, setModalVisible] = useState(false);
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
      setModalVisible(false);
      setCodigo('');
      router.push(`/desafio/${res.desafio.id}`);
    } catch (err) {
      alert(mensajeErrorAmigable(err));
    } finally {
      setUniendo(false);
    }
  };

  if (loading) return <LoadingView />;

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <Text style={styles.filterLabel}>Estado</Text>
        <View style={styles.chips}>
          {estados.map((item) => (
            <Pressable
              key={item}
              style={[styles.chip, estado === item && styles.chipActive]}
              onPress={() => setEstado(estado === item ? '' : item)}>
              <Text style={styles.chipText}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.filterLabel}>Categoría</Text>
        <View style={styles.chips}>
          {categorias.map((item) => (
            <Pressable
              key={item}
              style={[styles.chip, categoria === item && styles.chipActive]}
              onPress={() => setCategoria(categoria === item ? '' : item)}>
              <Text style={styles.chipText}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <PrimaryButton label="Unirse con código" onPress={() => setModalVisible(true)} />
      </View>

      {error ? <ErrorState message={error} onRetry={cargar} /> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={cargar} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          error
            ? undefined
            : (
              <EmptyState
                title="Sin resultados"
                message="Probá otros filtros o creá un desafío."
              />
            )
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/desafio/${item.id}`)}>
            <Text style={styles.cardTitle}>{item.nombre}</Text>
            <BadgeEstado estado={item.estado} />
            <Text style={styles.cardMeta}>
              {item.categoria} · {item.fechaInicio} → {item.fechaFin}
            </Text>
          </Pressable>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Código de invitación</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="characters"
              maxLength={6}
              value={codigo}
              onChangeText={setCodigo}
              placeholder="ABC123"
            />
            <PrimaryButton
              label="Unirme"
              onPress={unirse}
              disabled={codigo.length < 6 || uniendo}
            />
            <PrimaryButton
              label="Cancelar"
              variant="secondary"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: lightColors.background },
  filters: { padding: 16, gap: 8 },
  filterLabel: {
    ...typography.footnote,
    color: lightColors.labelSecondary,
    fontFamily: 'Inter_600SemiBold',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: lightColors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipActive: { backgroundColor: lightColors.primarySoft },
  chipText: {
    ...typography.footnote,
    fontFamily: 'Inter_400Regular',
    color: lightColors.label,
  },
  list: { padding: 16, paddingTop: 0 },
  card: {
    backgroundColor: lightColors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 6,
  },
  cardTitle: {
    ...typography.headline,
    color: lightColors.label,
    fontFamily: 'Inter_600SemiBold',
  },
  cardMeta: {
    ...typography.footnote,
    color: lightColors.labelSecondary,
    fontFamily: 'Inter_400Regular',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: lightColors.surface,
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 12,
  },
  modalTitle: {
    ...typography.title2,
    fontFamily: 'Inter_700Bold',
    color: lightColors.label,
  },
  input: {
    backgroundColor: lightColors.background,
    borderRadius: 12,
    padding: 14,
    fontFamily: 'Inter_400Regular',
  },
});
