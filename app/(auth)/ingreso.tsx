import { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Logo } from '@/components/brand/Logo';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingView } from '@/components/ui/LoadingView';
import { useSession } from '@/context/SessionContext';
import { mensajeErrorAmigable } from '@/lib/errors';
import { crearUsuario, listarUsuarios } from '@/services/api/usuarios';
import { lightColors } from '@/theme/light';
import { typography } from '@/theme/typography';
import type { Usuario } from '@/types/api';
import { useEffect } from 'react';

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

  if (loading) return <LoadingView />;

  return (
    <Screen>
      <Logo />
      <Text style={styles.title}>Rachas</Text>
      <Text style={styles.subtitle}>Elegí tu perfil o registrate</Text>

      {error ? <ErrorState message={error} onRetry={cargar} /> : null}

      {modoRegistro ? (
        <View style={styles.form}>
          <TextInput
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
            style={styles.input}
          />
          <TextInput
            placeholder="Alias"
            autoCapitalize="none"
            value={alias}
            onChangeText={setAlias}
            style={styles.input}
          />
          <TextInput
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
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
        <>
          <FlatList
            data={usuarios}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.empty}>No hay personas cargadas en el back.</Text>
            }
            renderItem={({ item }) => (
              <Pressable style={styles.row} onPress={() => elegir(item.id)}>
                <Text style={styles.rowTitle}>{item.nombre}</Text>
                <Text style={styles.rowMeta}>@{item.alias}</Text>
              </Pressable>
            )}
          />
          <PrimaryButton label="Registrarme" onPress={() => setModoRegistro(true)} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.largeTitle,
    color: lightColors.label,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    ...typography.body,
    color: lightColors.labelSecondary,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter_400Regular',
  },
  form: { gap: 12 },
  input: {
    backgroundColor: lightColors.surface,
    borderRadius: 12,
    padding: 14,
    ...typography.body,
    fontFamily: 'Inter_400Regular',
  },
  row: {
    backgroundColor: lightColors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  rowTitle: {
    ...typography.headline,
    color: lightColors.label,
    fontFamily: 'Inter_600SemiBold',
  },
  rowMeta: {
    ...typography.footnote,
    color: lightColors.labelSecondary,
    fontFamily: 'Inter_400Regular',
  },
  empty: {
    ...typography.body,
    color: lightColors.labelSecondary,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter_400Regular',
  },
});
