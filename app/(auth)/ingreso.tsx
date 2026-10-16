import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from '@/components/brand/Logo';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingView } from '@/components/ui/LoadingView';
import { GroupedSection } from '@/components/ui/GroupedSection';
import { ListRow } from '@/components/ui/ListRow';
import { TextField } from '@/components/ui/TextField';
import { useSession } from '@/context/SessionContext';
import { mensajeErrorAmigable } from '@/lib/errors';
import { crearUsuario, listarUsuarios } from '@/services/api/usuarios';
import { lightColors } from '@/theme/light';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Usuario } from '@/types/api';

export default function IngresoScreen() {
  const { iniciarSesion } = useSession();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modoRegistro, setModoRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [guardando, setGuardando] = useState(false);

  const logoScale = useSharedValue(0.85);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const sheetTranslate = useSharedValue(48);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 400 });
    logoScale.value = withSpring(1, { damping: 14, stiffness: 120 });
    titleOpacity.value = withDelay(180, withTiming(1, { duration: 350 }));
    subtitleOpacity.value = withDelay(300, withTiming(1, { duration: 350 }));
    sheetTranslate.value = withDelay(
      220,
      withSpring(0, { damping: 18, stiffness: 140 }),
    );
  }, [logoOpacity, logoScale, titleOpacity, subtitleOpacity, sheetTranslate]);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      setUsuarios(await listarUsuarios());
    } catch (err) {
      setError(mensajeErrorAmigable(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const elegir = async (id: string) => {
    await iniciarSesion(id);
    router.replace('/(tabs)/inicio');
  };

  const registrar = async () => {
    setGuardando(true);
    setError(null);
    try {
      const usuario = await crearUsuario({ nombre, alias, email });
      await iniciarSesion(usuario.id);
      router.replace('/(tabs)/inicio');
    } catch (err) {
      setError(mensajeErrorAmigable(err));
    } finally {
      setGuardando(false);
    }
  };

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: (1 - titleOpacity.value) * 12 }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: (1 - subtitleOpacity.value) * 10 }],
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslate.value }],
  }));

  if (loading) return <LoadingView />;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[lightColors.heroGradientStart, lightColors.heroGradientEnd]}
        style={styles.hero}>
        <SafeAreaView edges={['top']} style={styles.heroInner}>
          <Animated.View style={logoStyle}>
            <Logo size={120} />
          </Animated.View>
          <Animated.Text style={[styles.heroTitle, titleStyle]}>Rachas</Animated.Text>
          <Animated.Text style={[styles.heroSubtitle, subtitleStyle]}>
            Desafíos diarios con tu gente
          </Animated.Text>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.sheetWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            {modoRegistro ? 'Crear cuenta' : 'Elegí tu perfil'}
          </Text>
          <Text style={styles.sheetSubtitle}>
            {modoRegistro
              ? 'Completá tus datos para empezar'
              : 'O registrate si es tu primera vez'}
          </Text>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetScroll}>
            {error ? <ErrorState message={error} onRetry={cargar} /> : null}

            {modoRegistro ? (
              <View style={styles.form}>
                <GroupedSection>
                  <TextField
                    grouped
                    placeholder="Nombre"
                    value={nombre}
                    onChangeText={setNombre}
                  />
                  <View style={styles.fieldDivider} />
                  <TextField
                    grouped
                    placeholder="Alias"
                    autoCapitalize="none"
                    value={alias}
                    onChangeText={setAlias}
                  />
                  <View style={styles.fieldDivider} />
                  <TextField
                    grouped
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </GroupedSection>
                <PrimaryButton
                  label="Crear cuenta"
                  onPress={registrar}
                  disabled={guardando || !nombre || !alias || !email}
                />
                <PrimaryButton
                  label="Volver"
                  variant="secondary"
                  onPress={() => setModoRegistro(false)}
                />
              </View>
            ) : error ? (
              <PrimaryButton label="Registrarme" onPress={() => setModoRegistro(true)} />
            ) : (
              <View style={styles.form}>
                {usuarios.length === 0 ? (
                  <Text style={styles.empty}>No hay personas cargadas en el back.</Text>
                ) : (
                  <GroupedSection>
                    {usuarios.map((item, index) => (
                      <ListRow
                        key={item.id}
                        title={item.nombre}
                        subtitle={`@${item.alias}`}
                        onPress={() => elegir(item.id)}
                        isLast={index === usuarios.length - 1}
                      />
                    ))}
                  </GroupedSection>
                )}
                <PrimaryButton label="Registrarme" onPress={() => setModoRegistro(true)} />
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  hero: {
    flex: 1,
    minHeight: 220,
  },
  heroInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  heroTitle: {
    ...typography.largeTitle,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.subhead,
    textAlign: 'center',
    color: lightColors.labelSecondary,
    maxWidth: 280,
  },
  sheetWrap: {
    flex: 1,
    marginTop: -spacing.xxl,
  },
  sheet: {
    flex: 1,
    backgroundColor: lightColors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: lightColors.separator,
    marginBottom: spacing.md,
  },
  sheetTitle: {
    ...typography.title2,
    fontFamily: 'Inter_700Bold',
  },
  sheetSubtitle: {
    ...typography.subhead,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  sheetScroll: {
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  form: {
    gap: spacing.md,
  },
  fieldDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: lightColors.separator,
    marginLeft: spacing.lg,
  },
  empty: {
    ...typography.body,
    color: lightColors.labelSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
