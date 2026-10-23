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
import { Href, router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from '@/components/brand/Logo';
import { GradientButton } from '@/components/ui/GradientButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { TextField } from '@/components/ui/TextField';
import {
  ingresarConEmail,
  registrarConEmail,
} from '@/services/auth/emailAuth';
import {
  isGoogleSignInAvailable,
  signInWithGoogle,
} from '@/services/auth/googleSignIn';
import { mensajeErrorFirebaseAuth } from '@/services/auth/firebaseAuthErrors';
import { useSession } from '@/context/SessionContext';
import { mensajeErrorAmigable } from '@/lib/errors';
import { lightColors } from '@/theme/light';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export default function IngresoScreen() {
  const { usuario, refrescarUsuario } = useSession();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const googleDisponible = isGoogleSignInAvailable();

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

  useEffect(() => {
    if (usuario?.requiereAlias) {
      router.replace('/(auth)/elegir-alias' as Href);
    }
  }, [usuario]);

  const completarAuth = async (accion: () => Promise<void>) => {
    setCargando(true);
    setError(null);
    try {
      await accion();
      await refrescarUsuario();
    } catch (err) {
      setError(mensajeErrorFirebaseAuth(err) || mensajeErrorAmigable(err));
    } finally {
      setCargando(false);
    }
  };

  const enviarEmail = () => {
    if (!email.trim() || password.length < 6) {
      setError('Completá email y contraseña (mínimo 6 caracteres).');
      return;
    }
    if (modoRegistro) {
      completarAuth(() => registrarConEmail(email, password));
    } else {
      completarAuth(() => ingresarConEmail(email, password));
    }
  };

  const ingresarGoogle = () => {
    completarAuth(() => signInWithGoogle());
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
            {modoRegistro ? 'Crear cuenta' : 'Ingresá'}
          </Text>
          <Text style={styles.sheetSubtitle}>
            {modoRegistro
              ? 'Registrate con email y contraseña (Firebase).'
              : 'Usá tu email y contraseña. Google solo si ya te registraste.'}
          </Text>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetScroll}>
            {error ? <ErrorState message={error} onRetry={() => setError(null)} /> : null}

            <SurfaceCard>
              <TextField
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <View style={styles.fieldDivider} />
              <TextField
                placeholder="Contraseña"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </SurfaceCard>

            <GradientButton
              label={
                cargando
                  ? 'Esperá…'
                  : modoRegistro
                    ? 'Registrarme'
                    : 'Ingresar'
              }
              onPress={enviarEmail}
              disabled={cargando || !email.trim() || password.length < 6}
            />

            <PrimaryButton
              label={modoRegistro ? 'Ya tengo cuenta' : 'Crear cuenta'}
              variant="secondary"
              onPress={() => {
                setModoRegistro(!modoRegistro);
                setError(null);
              }}
              disabled={cargando}
            />

            {googleDisponible ? (
              <PrimaryButton
                label={cargando ? 'Esperá…' : 'Continuar con Google'}
                variant="secondary"
                onPress={ingresarGoogle}
                disabled={cargando}
              />
            ) : (
              <Text style={styles.googleHint}>
                Google está disponible en la versión web (tecla w en Expo). En el
                celular usá email y contraseña.
              </Text>
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
    flex: 0.45,
    minHeight: 200,
  },
  heroInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
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
    marginBottom: spacing.sm,
  },
  sheetTitle: {
    ...typography.title2,
    fontFamily: 'Inter_700Bold',
  },
  sheetSubtitle: {
    ...typography.subhead,
    color: lightColors.labelSecondary,
    marginBottom: spacing.md,
  },
  sheetScroll: {
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  fieldDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: lightColors.separator,
    marginLeft: spacing.lg,
  },
  googleHint: {
    ...typography.caption,
    color: lightColors.labelSecondary,
    textAlign: 'center',
  },
});
