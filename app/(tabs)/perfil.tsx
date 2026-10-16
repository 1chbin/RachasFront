import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { GroupedSection } from '@/components/ui/GroupedSection';
import { ListRow } from '@/components/ui/ListRow';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingView } from '@/components/ui/LoadingView';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useSession } from '@/context/SessionContext';
import { mensajeErrorAmigable } from '@/lib/errors';
import { listarDesafiosDeUsuario } from '@/services/api/desafios';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const inicial = usuario?.alias?.charAt(0).toUpperCase() ?? '?';

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
    <Screen title="Perfil">
      {error ? <ErrorState message={error} onRetry={cargar} /> : null}

      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{inicial}</Text>
        </View>
        <Text style={styles.alias}>@{usuario?.alias}</Text>
      </View>

      <GroupedSection title="Tu cuenta">
        <TextField grouped value={nombre} onChangeText={setNombre} placeholder="Nombre" />
        <View style={styles.divider} />
        <TextField
          grouped
          value={zonaHoraria}
          onChangeText={setZonaHoraria}
          placeholder="Zona horaria IANA"
        />
      </GroupedSection>

      <PrimaryButton
        label="Guardar cambios"
        onPress={guardar}
        disabled={guardando}
      />

      <GroupedSection title="Desafíos finalizados">
        {finalizados.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.empty}>Todavía no tenés desafíos finalizados.</Text>
          </View>
        ) : (
          finalizados.map(({ desafio, resultado }, index) => (
            <ListRow
              key={desafio.id}
              title={desafio.nombre}
              subtitle={resultado}
              onPress={() => router.push(`/desafio/${desafio.id}`)}
              isLast={index === finalizados.length - 1}
            />
          ))
        )}
      </GroupedSection>

      <PrimaryButton label="Cerrar sesión" variant="danger" onPress={salir} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: lightColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: lightColors.primaryDark,
  },
  alias: {
    ...typography.subhead,
    fontFamily: 'Inter_600SemiBold',
    color: lightColors.labelSecondary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: lightColors.separator,
    marginLeft: spacing.lg,
  },
  emptyWrap: {
    padding: spacing.lg,
  },
  empty: {
    ...typography.body,
    color: lightColors.labelSecondary,
    textAlign: 'center',
  },
});
