import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Href, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from '@/components/brand/Logo';
import { ErrorState } from '@/components/ui/ErrorState';
import { GradientButton } from '@/components/ui/GradientButton';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { TextField } from '@/components/ui/TextField';
import { useSession } from '@/context/SessionContext';
import { mensajeErrorAmigable } from '@/lib/errors';
import { actualizarAlias } from '@/services/api/usuarios';
import { lightColors } from '@/theme/light';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export default function ElegirAliasScreen() {
  const { refrescarUsuario } = useSession();
  const [alias, setAlias] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      await actualizarAlias(alias.trim());
      await refrescarUsuario();
      router.replace('/(tabs)/inicio' as Href);
    } catch (err) {
      setError(mensajeErrorAmigable(err));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <Logo size={80} />
        <Text style={styles.title}>Elegí tu alias</Text>
        <Text style={styles.subtitle}>
          Es tu nombre público en Rachas. Debe ser único (3–20 caracteres, letras,
          números y guion bajo).
        </Text>
        {error ? <ErrorState message={error} onRetry={() => setError(null)} /> : null}
        <SurfaceCard style={styles.card}>
          <TextField
            placeholder="mi_alias"
            autoCapitalize="none"
            value={alias}
            onChangeText={setAlias}
          />
        </SurfaceCard>
        <GradientButton
          label="Continuar"
          onPress={guardar}
          disabled={guardando || alias.trim().length < 3}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
  },
  title: {
    ...typography.title1,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.subhead,
    color: lightColors.labelSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
