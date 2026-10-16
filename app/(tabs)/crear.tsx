import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { mensajeErrorAmigable } from '@/lib/errors';
import { sumarDias, hoyCalendario } from '@/lib/fechas';
import { crearDesafio } from '@/services/api/desafios';
import { useSession } from '@/context/SessionContext';
import { lightColors } from '@/theme/light';
import { typography } from '@/theme/typography';
import type { CategoriaDesafio } from '@/types/api';

export default function CrearScreen() {
  const { usuario } = useSession();
  const hoy = hoyCalendario(usuario?.zonaHoraria ?? 'America/Argentina/Buenos_Aires');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState<CategoriaDesafio>('SALUD');
  const [fechaInicio, setFechaInicio] = useState(hoy);
  const [fechaFin, setFechaFin] = useState(sumarDias(hoy, 7));
  const [maxParticipantes, setMaxParticipantes] = useState('10');
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    setGuardando(true);
    try {
      const desafio = await crearDesafio({
        nombre,
        descripcion: descripcion || undefined,
        categoria,
        fechaInicio,
        fechaFin,
        maxParticipantes: Number(maxParticipantes),
      });
      router.push(`/desafio/${desafio.id}`);
    } catch (err) {
      alert(mensajeErrorAmigable(err));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Nuevo desafío</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nombre (3-60)"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          style={styles.input}
          placeholder="Descripción (opcional)"
          value={descripcion}
          onChangeText={setDescripcion}
        />
        <TextInput
          style={styles.input}
          placeholder="Categoría (SALUD, ESTUDIO...)"
          value={categoria}
          onChangeText={(text) => setCategoria(text as CategoriaDesafio)}
          autoCapitalize="characters"
        />
        <TextInput
          style={styles.input}
          placeholder="Fecha inicio YYYY-MM-DD"
          value={fechaInicio}
          onChangeText={setFechaInicio}
        />
        <TextInput
          style={styles.input}
          placeholder="Fecha fin YYYY-MM-DD"
          value={fechaFin}
          onChangeText={setFechaFin}
        />
        <TextInput
          style={styles.input}
          placeholder="Máx. participantes (2-20)"
          keyboardType="number-pad"
          value={maxParticipantes}
          onChangeText={setMaxParticipantes}
        />
        <PrimaryButton
          label="Crear desafío"
          onPress={guardar}
          disabled={guardando || nombre.length < 3}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.largeTitle,
    color: lightColors.label,
    marginBottom: 16,
    fontFamily: 'Inter_700Bold',
  },
  form: { gap: 12 },
  input: {
    backgroundColor: lightColors.surface,
    borderRadius: 12,
    padding: 14,
    fontFamily: 'Inter_400Regular',
  },
});
