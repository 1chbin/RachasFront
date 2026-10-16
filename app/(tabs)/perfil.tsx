import { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingView } from '@/components/ui/LoadingView';
import { Screen } from '@/components/ui/Screen';
import { useSession } from '@/context/SessionContext';
import { mensajeErrorAmigable } from '@/lib/errors';
import { listarDesafiosDeUsuario } from '@/services/api/desafios';
import { actualizarUsuario } from '@/services/api/usuarios';
import { obtenerRanking } from '@/services/api/ranking';
import { lightColors } from '@/theme/light';
import { typography } from '@/theme/typography';
import type { DesafioResumen } from '@/types/api';
import { Pressable } from 'react-native';

export default function PerfilScreen() {
  const { usuario, usuarioId, refrescarUsuario, cerrarSesion } = useSession();
  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  const [zonaHoraria, setZonaHoraria] = useState(usuario?.zonaHoraria ?? '');
  const [finalizados, setFinalizados] = useState<
    Array<{ desafio: DesafioResumen; resultado: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    if (!usuarioId) return;
    setLoading(true);
    setError(null);
    try {
      const desafios = await listarDesafiosDeUsuario(usuarioId);
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

  const guardar = async () => {
    if (!usuarioId) return;
    setGuardando(true);
    try {
      await actualizarUsuario(usuarioId, { nombre, zonaHoraria });
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
    <Screen>
      <Text style={styles.title}>Perfil</Text>
      {error ? <ErrorState message={error} onRetry={cargar} /> : null}
      <Text style={styles.label}>@{usuario?.alias}</Text>
      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />
      <TextInput
        style={styles.input}
        value={zonaHoraria}
        onChangeText={setZonaHoraria}
        placeholder="Zona horaria IANA"
      />
      <PrimaryButton
        label="Guardar cambios"
        onPress={guardar}
        disabled={guardando}
      />

      <Text style={styles.section}>Desafíos finalizados</Text>
      {finalizados.length === 0 ? (
        <Text style={styles.empty}>Todavía no tenés desafíos finalizados.</Text>
      ) : (
        finalizados.map(({ desafio, resultado }) => (
          <Pressable
            key={desafio.id}
            style={styles.card}
            onPress={() => router.push(`/desafio/${desafio.id}`)}>
            <Text style={styles.cardTitle}>{desafio.nombre}</Text>
            <Text style={styles.cardMeta}>{resultado}</Text>
          </Pressable>
        ))
      )}

      <PrimaryButton label="Cerrar sesión" variant="danger" onPress={salir} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.largeTitle,
    color: lightColors.label,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  label: {
    ...typography.subhead,
    color: lightColors.labelSecondary,
    marginBottom: 12,
    fontFamily: 'Inter_400Regular',
  },
  input: {
    backgroundColor: lightColors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    fontFamily: 'Inter_400Regular',
  },
  section: {
    ...typography.headline,
    marginTop: 20,
    marginBottom: 8,
    color: lightColors.label,
    fontFamily: 'Inter_600SemiBold',
  },
  empty: {
    ...typography.body,
    color: lightColors.labelSecondary,
    fontFamily: 'Inter_400Regular',
  },
  card: {
    backgroundColor: lightColors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  cardTitle: {
    ...typography.headline,
    fontFamily: 'Inter_600SemiBold',
    color: lightColors.label,
  },
  cardMeta: {
    ...typography.footnote,
    color: lightColors.primaryDark,
    fontFamily: 'Inter_400Regular',
  },
});
