import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { CategoriaIcon } from '@/components/desafio/CategoriaIcon';
import { AlientoPickerOverlay } from '@/components/desafio/AlientoPickerModal';
import { AlientoCenterOverlayContent } from '@/components/aliento/AlientoCenterOverlay';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { BadgeEstado } from '@/components/ui/BadgeEstado';
import { ErrorState } from '@/components/ui/ErrorState';
import { GroupedSection } from '@/components/ui/GroupedSection';
import { ListRow } from '@/components/ui/ListRow';
import { GradientButton } from '@/components/ui/GradientButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextField } from '@/components/ui/TextField';
import { StreakBurst } from '@/components/streak/StreakBurst';
import { useSession } from '@/context/SessionContext';
import {
  useAlientoCenterForDesafio,
  useAlientoNotifications,
} from '@/context/AlientoNotificationsContext';
import { metaCategoria } from '@/lib/categorias';
import { hoyCalendario, textoTiempoDesafio } from '@/lib/fechas';
import { puntosTotalesDeCheckIn } from '@/lib/dominioUi';
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
import { useDesafioRealtime } from '@/hooks/useDesafioRealtime';
import type { AlientoEmojiId } from '@/lib/alientoEmojis';
import { enviarAliento } from '@/services/realtime/socketClient';
import { track } from '@/services/analytics/track';
import { lightColors } from '@/theme/light';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { CheckIn, DesafioResumen, FilaRanking } from '@/types/api';

export default function DesafioDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { usuario, usuarioId } = useSession();
  const { refrescarSuscripcionesAliento } = useAlientoNotifications();
  const alientoCenter = useAlientoCenterForDesafio(id);
  const [desafio, setDesafio] = useState<DesafioResumen | null>(null);
  const [ranking, setRanking] = useState<FilaRanking[]>([]);
  const [racha, setRacha] = useState({ rachaActual: 0, mejorRacha: 0 });
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [nota, setNota] = useState('');
  const [valor, setValor] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutando, setMutando] = useState(false);
  const [burst, setBurst] = useState({
    visible: false,
    from: 0,
    to: 0,
  });
  const [sheetOpen, setSheetOpen] = useState(true);
  const [avisoRealtime, setAvisoRealtime] = useState<string | null>(null);
  const avisoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [alientoDestino, setAlientoDestino] = useState<{
    usuarioId: string;
    alias: string;
  } | null>(null);
  const [errorAliento, setErrorAliento] = useState<string | null>(null);

  const mostrarAvisoRealtime = useCallback((texto: string) => {
    if (avisoTimerRef.current) {
      clearTimeout(avisoTimerRef.current);
    }
    setAvisoRealtime(texto);
    avisoTimerRef.current = setTimeout(() => {
      setAvisoRealtime(null);
      avisoTimerRef.current = null;
    }, 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (avisoTimerRef.current) {
        clearTimeout(avisoTimerRef.current);
      }
    };
  }, []);

  const enviarAlientoA = useCallback(
    async (emojiId: AlientoEmojiId) => {
      if (!id || !alientoDestino) return;
      setErrorAliento(null);
      setMutando(true);
      try {
        const ack = await enviarAliento({
          desafioId: id,
          destinatarioUsuarioId: alientoDestino.usuarioId,
          emojiId,
        });
        if (!ack.ok) {
          setErrorAliento(ack.message);
          alert(ack.message);
          return;
        }
        setAlientoDestino(null);
        setErrorAliento(null);
      } finally {
        setMutando(false);
      }
    },
    [id, alientoDestino],
  );

  const cerrarSheet = () => {
    setSheetOpen(false);
  };

  const onSheetClosed = () => {
    router.back();
  };

  const cargar = useCallback(
    async (silencioso = false) => {
      if (!id) return;
      if (!silencioso) setLoading(true);
      setError(null);
      try {
        const [d, r, ra, historial] = await Promise.all([
          obtenerDesafio(id),
          obtenerRanking(id).catch((): null => null),
          obtenerRacha(id).catch(() => ({ rachaActual: 0, mejorRacha: 0 })),
          usuarioId
            ? listarCheckIns(id, 1, 20).catch(() => ({
                data: [] as CheckIn[],
              }))
            : Promise.resolve({ data: [] as CheckIn[] }),
        ]);
        setDesafio(d);
        if (r) {
          setRanking(r.ranking ?? []);
          void track('ranking_consultado', { desafio_id: id });
        } else {
          setRanking([]);
        }
        setRacha(ra);
        setCheckIns(historial.data ?? []);
        await listarParticipantes(id).catch(() => undefined);
      } catch (err) {
        setError(mensajeErrorAmigable(err));
      } finally {
        setLoading(false);
      }
    },
    [id, usuarioId],
  );

  useDesafioRealtime(id, {
    usuarioId,
    onRanking: (filas) => setRanking(filas),
    onCheckInAjeno: ({ alias }) => {
      mostrarAvisoRealtime(`${alias} hizo su check-in`);
      void cargar(true);
    },
    onReconnect: () => {
      void cargar(true);
    },
    onParticipanteChange: () => {
      void cargar(true);
    },
    onDesafioCancelado: () => {
      void cargar(true);
    },
    onSuscripcionError: (message) => {
      mostrarAvisoRealtime(message);
    },
  });

  useFocusEffect(
    useCallback(() => {
      setSheetOpen(true);
      void refrescarSuscripcionesAliento();
      cargar(false);
    }, [cargar, refrescarSuscripcionesAliento]),
  );

  useEffect(() => {
    if (alientoCenter.visible) {
      setAlientoDestino(null);
      setErrorAliento(null);
    }
  }, [alientoCenter.visible]);

  const sheetOverlay = useMemo(() => {
    if (alientoCenter.visible) {
      return (
        <AlientoCenterOverlayContent
          emoji={alientoCenter.emoji}
          remitenteAlias={alientoCenter.remitenteAlias}
          onDismiss={alientoCenter.dismiss}
        />
      );
    }
    if (alientoDestino) {
      return (
        <AlientoPickerOverlay
          destinatarioAlias={alientoDestino.alias}
          disabled={mutando}
          errorMessage={errorAliento}
          onClose={() => {
            setAlientoDestino(null);
            setErrorAliento(null);
          }}
          onSelect={(emojiId) => {
            void enviarAlientoA(emojiId);
          }}
        />
      );
    }
    return null;
  }, [
    alientoCenter.visible,
    alientoCenter.emoji,
    alientoCenter.remitenteAlias,
    alientoCenter.dismiss,
    alientoDestino,
    mutando,
    errorAliento,
    enviarAlientoA,
  ]);

  const copiarCodigo = async () => {
    if (desafio?.codigoInvitacion) {
      await Clipboard.setStringAsync(desafio.codigoInvitacion);
      alert('Código copiado');
    }
  };

  const cerrarBurst = useCallback(() => {
    setBurst((prev) => ({ ...prev, visible: false }));
  }, []);

  const checkInHoy = async () => {
    if (!id || !usuario) return;
    const antes = racha.rachaActual;
    setMutando(true);
    try {
      await registrarCheckIn(id, {
        dia: hoyCalendario(usuario.zonaHoraria),
        zonaHoraria: usuario.zonaHoraria,
        nota: nota || undefined,
        valor: valor ? Number(valor) : undefined,
      });
      await track('checkin_hecho', { desafio_id: id });
      setNota('');
      setValor('');
      const ra = await obtenerRacha(id).catch(() => ({ rachaActual: antes, mejorRacha: 0 }));
      setRacha(ra);
      if (antes > 0 && ra.rachaActual < antes) {
        await track('racha_perdida', {
          desafio_id: id,
          racha_anterior: antes,
          racha_nueva: ra.rachaActual,
        });
      }
      await cargar(true);
      if (ra.rachaActual > antes) {
        setBurst({ visible: true, from: antes, to: ra.rachaActual });
      }
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
      await cargar(true);
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
      await cargar(true);
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
      await cargar(true);
    } catch (err) {
      alert(mensajeErrorAmigable(err));
    } finally {
      setMutando(false);
    }
  };

  const hoy = hoyCalendario(
    usuario?.zonaHoraria ?? 'America/Argentina/Buenos_Aires',
  );

  const sheetHeader = (() => {
    if (loading && !desafio) {
      return (
        <View style={styles.sheetHeader}>
          <View style={styles.sheetTitleRow}>
            <Text style={styles.sheetTitle}>Desafío</Text>
            <Pressable
              onPress={cerrarSheet}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              hitSlop={8}
              style={styles.closeBtn}>
              <Ionicons name="close" size={26} color={lightColors.muted} />
            </Pressable>
          </View>
        </View>
      );
    }

    if (error || !desafio) {
      return (
        <View style={styles.sheetHeader}>
          <View style={styles.sheetTitleRow}>
            <Text style={styles.sheetTitle}>Desafío</Text>
            <Pressable
              onPress={cerrarSheet}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              hitSlop={8}
              style={styles.closeBtn}>
              <Ionicons name="close" size={26} color={lightColors.muted} />
            </Pressable>
          </View>
        </View>
      );
    }

    const meta = metaCategoria(desafio.categoria);
    const tiempo = textoTiempoDesafio(
      desafio.estado,
      desafio.fechaInicio,
      desafio.finalizaEn,
      hoy,
    );

    return (
      <View style={styles.sheetHeader}>
        <View style={styles.sheetTitleRow}>
          <CategoriaIcon categoria={desafio.categoria} align="start" />
          <Text style={styles.sheetTitle} numberOfLines={2}>
            {desafio.nombre}
          </Text>
          <Pressable
            onPress={cerrarSheet}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
            hitSlop={8}
            style={styles.closeBtn}>
            <Ionicons name="close" size={26} color={lightColors.muted} />
          </Pressable>
        </View>
        <View style={styles.headerMeta}>
          <BadgeEstado estado={desafio.estado} />
          <Text style={styles.meta}>
            {meta.label} · {tiempo}
          </Text>
        </View>
      </View>
    );
  })();

  const sheetBody = (() => {
    if (loading && !desafio) {
      return (
        <View style={styles.loadingBody}>
          <ActivityIndicator size="large" color={lightColors.primary} />
        </View>
      );
    }

    if (error || !desafio) {
      return <ErrorState message={error ?? 'Desafío no encontrado'} onRetry={() => cargar(false)} />;
    }

    const esCreador = desafio.creadorId === usuarioId;
    const puedeAlentar =
      desafio.estado === 'ACTIVO' || desafio.estado === 'PROGRAMADO';

    return (
      <>
        {avisoRealtime ? (
          <View style={styles.avisoRealtime}>
            <Text style={styles.avisoRealtimeText}>{avisoRealtime}</Text>
          </View>
        ) : null}

        {desafio.codigoInvitacion ? (
          <GroupedSection title="Invitación">
            <ListRow
              title="Código para invitar"
              detail={desafio.codigoInvitacion}
              onPress={copiarCodigo}
              isLast
            />
          </GroupedSection>
        ) : null}

        <GroupedSection title="Tu racha">
          <ListRow
            title={`${racha.rachaActual} días`}
            subtitle={`Mejor racha: ${racha.mejorRacha} días`}
            isLast
          />
        </GroupedSection>

        {desafio.estado === 'ACTIVO' ? (
          <GroupedSection title="Check-in de hoy">
            <TextField grouped placeholder="Nota (opcional)" value={nota} onChangeText={setNota} />
            <View style={styles.divider} />
            <TextField
              grouped
              placeholder="Valor numérico (opcional)"
              value={valor}
              onChangeText={setValor}
              keyboardType="numeric"
            />
          </GroupedSection>
        ) : null}

        {desafio.estado === 'ACTIVO' ? (
          <View style={styles.actions}>
            <GradientButton
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

        <GroupedSection title="Ranking">
          {ranking.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.empty}>Sin datos de ranking todavía.</Text>
            </View>
          ) : (
            ranking.map((fila, index) => {
              const esYo = fila.usuarioId === usuarioId;
              const mostrarBotonAliento = puedeAlentar && !esYo;
              return (
                <ListRow
                  key={fila.usuarioId}
                  title={`@${fila.alias}`}
                  subtitle={`Racha ${fila.rachaActual}`}
                  detail={`${fila.puntosTotales} pts`}
                  highlight={esYo}
                  showChevron={false}
                  trailing={
                    mostrarBotonAliento ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Alentar a ${fila.alias}`}
                        hitSlop={8}
                        onPress={() => {
                          setErrorAliento(null);
                          setAlientoDestino({
                            usuarioId: fila.usuarioId,
                            alias: fila.alias,
                          });
                        }}
                        style={({ pressed }) => [
                          styles.alientoBtn,
                          pressed && styles.alientoBtnPressed,
                        ]}>
                        <Ionicons
                          name="heart-outline"
                          size={20}
                          color={lightColors.primary}
                        />
                      </Pressable>
                    ) : undefined
                  }
                  isLast={index === ranking.length - 1}
                />
              );
            })
          )}
        </GroupedSection>

        <GroupedSection title="Historial">
          {checkIns.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.empty}>Sin check-ins todavía.</Text>
            </View>
          ) : (
            checkIns.map((item, index) => (
              <ListRow
                key={item.id}
                title={item.dia}
                detail={`+${puntosTotalesDeCheckIn(item.puntos)} pts`}
                isLast={index === checkIns.length - 1}
              />
            ))
          )}
        </GroupedSection>

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
      </>
    );
  })();

  return (
    <>
      <BottomSheet
        visible={sheetOpen}
        onClose={onSheetClosed}
        size="tall"
        header={sheetHeader}
        overlay={sheetOverlay}>
        {sheetBody}
      </BottomSheet>

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
  sheetHeader: {
    gap: spacing.sm,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  sheetTitle: {
    ...typography.title2,
    fontFamily: 'Inter_700Bold',
    flex: 1,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  headerMeta: {
    gap: spacing.sm,
    paddingLeft: spacing.xs,
  },
  meta: {
    ...typography.subhead,
  },
  loadingBody: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: lightColors.separator,
    marginLeft: spacing.lg,
  },
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  emptyWrap: {
    padding: spacing.lg,
  },
  empty: {
    ...typography.footnote,
    textAlign: 'center',
  },
  avisoRealtime: {
    backgroundColor: lightColors.primarySoft,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.md,
  },
  avisoRealtimeText: {
    ...typography.subhead,
    textAlign: 'center',
    color: lightColors.primary,
  },
  alientoBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightColors.primarySoft,
  },
  alientoBtnPressed: {
    opacity: 0.7,
  },
});
