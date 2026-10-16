import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@rachas/usuarioId';

export async function getStoredUsuarioId(): Promise<string | null> {
  return AsyncStorage.getItem(SESSION_KEY);
}

export async function setStoredUsuarioId(usuarioId: string): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, usuarioId);
}

export async function clearStoredUsuarioId(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
