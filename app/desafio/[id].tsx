import { useCallback, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { BadgeEstado } from '@/components/ui/BadgeEstado';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingView } from '@/components/ui/LoadingView';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { useSession } from '@/context/SessionContext';
import { hoyCalendario } from '@/lib/fechas';
import { mensajeErrorAmigable } from '@/lib/errors';
import {
  abandonarDesafio,
  cancelarDesafio,
  listarParticipantes,
  obtenerDesafio,
} from '@/services/api/desafios';
import {
  deshacerUltimoCheckIn,
  listarCheckIns,
  registrarCheckIn,
} from '@/services/api/checkIns';
import { obtenerRanking, obtenerRacha } from '@/services/api/ranking';
import { lightColors } from '@/theme/light';
import { typography } from '@/theme/typography';
import type { CheckIn, DesafioResumen, FilaRanking } from '@/types/api';

export default function DesafioDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { usuario, usuarioId } = useSession();
  const [desafio, setDesafio] = useState<DesafioResumen | null>(null);
  const [ranking, setRanking] = useState<FilaRanking[]>([]);
  const [racha, setRacha] = useState({ rachaActual: 0, mejorRacha: 0 });
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [nota, setNota] = useState('');
  const [valor, setValor] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutando, setMutando] = useState(false);

  const cargar = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [d, r, ra, historial] = await Promise.all([
        obtenerDesafio(id),
        obtenerRanking(id).catch(() => ({ ranking: [] as FilaRanking[] })),
        obtenerRacha(id).catch(() => ({ rachaActual: 0, mejorRacha: 0 })),
        usuarioId
          ? listarCheckIns(id, usuarioId, 1, 20).catch(() => ({
              data: [] as CheckIn[],
            }))
          : Promise.resolve({ data: [] as CheckIn[] }),
      ]);
      setDesafio(d);
      setRanking(r.ranking ?? []);
      setRacha(ra);
      setCheckIns(historial.data ?? []);
      await listarParticipantes(id).catch(() => undefined);
    } catch (err) {
      setError(mensajeErrorAmigable(err));
    } finally {
      setLoading(false);
    }
  }, [id, usuarioId]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  const copiarCodigo = async () => {
    if (desafio?.codigoInvitacion) {
      await Clipboard.setStringAsync(desafio.codigoInvitacion);
      alert('Código copiado');
    }
  };

  const checkInHoy = async () => {
    if (!id || !usuario) return;
    setMutando(true);
    try {
      await registrarCheckIn(id, {
        dia: hoyCalendario(usuario.zonaHoraria),
        nota: nota || undefined,
        valor: valor ? Number(valor) : undefined,
      });
      setNota('');
      setValor('');
      await cargar();
    } catch (err) {
      alert(mensajeErrorAmigable(err));
    } finally {
      setMutando(false);
    }
  };

  const deshacer = async () => {
    if (!id) return;
    setMutando(true);
    try {
      await deshacerUltimoCheckIn(id);
      await cargar();
    } catch (err) {
      alert(mensajeErrorAmigable(err));
    } finally {
      setMutando(false);
    }
  };

  const abandonar = async () => {
    if (!id) return;
    setMutando(true);
    try {
      await abandonarDesafio(id);
      await cargar();
    } catch (err) {
      alert(mensajeErrorAmigable(err));
    } finally {
      setMutando(false);
    }
  };

  const cancelar = async () => {
    if (!id) return;
    setMutando(true);
    try {
      await cancelarDesafio(id);
      await cargar();
    } catch (err) {
      alert(mensajeErrorAmigable(err));
    } finally {
      setMutando(false);
    }
  };

  if (loading) return <LoadingView />;
  if (error || !desafio) {
    return (
      <Screen>
        <ErrorState message={error ?? 'Desafío no encontrado'} onRetry={cargar} />
      </Screen>
    );
  }

  const esCreador = desafio.creadorId === usuarioId;

  return (
    <Screen>
      <Text style={styles.title}>{desafio.nombre}</Text>
      <BadgeEstado estado={desafio.estado} />
      <Text style={styles.meta}>
        {desafio.categoria} · {desafio.fechaInicio} → {desafio.fechaFin}
      </Text>
      {desafio.codigoInvitacion ? (
        <Pressable onPress={copiarCodigo} style={styles.codeBox}>
          <Text style={styles.codeLabel}>Código para invitar</Text>
          <Text style={styles.code}>{desafio.codigoInvitacion}</Text>
        </Pressable>
      ) : null}

      <Text style={styles.section}>Tu racha</Text>
      <Text style={styles.racha}>
        {racha.rachaActual} días (mejor: {racha.mejorRacha})
      </Text>

      {desafio.estado === 'ACTIVO' ? (
        <View style={styles.block}>
          <TextInput
            style={styles.input}
            placeholder="Nota (opcional)"
            value={nota}
            onChangeText={setNota}
          />
          <TextInput
            style={styles.input}
            placeholder="Valor numérico (opcional)"
            value={valor}
            onChangeText={setValor}
            keyboardType="numeric"
          />
          <PrimaryButton
            label="Registrar check-in de hoy"
            onPress={checkInHoy}
            disabled={mutando}
          />
          <PrimaryButton
            label="Deshacer último (hoy)"
            variant="secondary"
            onPress={deshacer}
            disabled={mutando}
          />
        </View>
      ) : null}

      <Text style={styles.section}>Ranking</Text>
      {ranking.length === 0 ? (
        <Text style={styles.empty}>Sin datos de ranking todavía.</Text>
      ) : (
        ranking.map((fila) => (
          <View
            key={fila.usuarioId}
            style={[
              styles.rankRow,
              fila.usuarioId === usuarioId && styles.rankRowSelf,
            ]}>
            <Text style={styles.rankPos}>#{fila.posicion}</Text>
            <Text style={styles.rankAlias}>@{fila.alias}</Text>
            <Text style={styles.rankPts}>
              {fila.puntosTotales} pts · racha {fila.rachaActual}
            </Text>
          </View>
        ))
      )}

      <Text style={styles.section}>Historial</Text>
      {checkIns.map((item) => (
        <View key={item.id} style={styles.historyRow}>
          <Text style={styles.historyDay}>{item.dia}</Text>
          <Text style={styles.historyPts}>+{item.puntos} pts</Text>
        </View>
      ))}

      {!esCreador ? (
        <PrimaryButton
          label="Abandonar desafío"
          variant="danger"
          onPress={abandonar}
          disabled={mutando}
        />
      ) : (
        <PrimaryButton
          label="Cancelar desafío"
          variant="danger"
          onPress={cancelar}
          disabled={mutando}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title2,
    color: lightColors.label,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  meta: {
    ...typography.subhead,
    color: lightColors.labelSecondary,
    marginBottom: 12,
    fontFamily: 'Inter_400Regular',
  },
  codeBox: {
    backgroundColor: lightColors.primarySoft,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  codeLabel: {
    ...typography.footnote,
    color: lightColors.primaryDark,
    fontFamily: 'Inter_600SemiBold',
  },
  code: {
    ...typography.title2,
    color: lightColors.primary,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 4,
  },
  section: {
    ...typography.headline,
    marginTop: 16,
    marginBottom: 8,
    color: lightColors.label,
    fontFamily: 'Inter_600SemiBold',
  },
  racha: {
    ...typography.body,
    color: lightColors.streak,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  block: { gap: 8, marginBottom: 8 },
  input: {
    backgroundColor: lightColors.surface,
    borderRadius: 12,
    padding: 12,
    fontFamily: 'Inter_400Regular',
  },
  rankRow: {
    backgroundColor: lightColors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
  },
  rankRowSelf: {
    borderWidth: 2,
    borderColor: lightColors.primary,
  },
  rankPos: {
    ...typography.footnote,
    color: lightColors.muted,
    fontFamily: 'Inter_600SemiBold',
  },
  rankAlias: {
    ...typography.headline,
    color: lightColors.label,
    fontFamily: 'Inter_600SemiBold',
  },
  rankPts: {
    ...typography.footnote,
    color: lightColors.labelSecondary,
    fontFamily: 'Inter_400Regular',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: lightColors.separator,
  },
  historyDay: {
    ...typography.body,
    fontFamily: 'Inter_400Regular',
  },
  historyPts: {
    ...typography.body,
    color: lightColors.success,
    fontFamily: 'Inter_600SemiBold',
  },
  empty: {
    ...typography.footnote,
    color: lightColors.labelSecondary,
    fontFamily: 'Inter_400Regular',
  },
});
