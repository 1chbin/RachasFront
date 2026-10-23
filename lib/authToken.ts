import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'rachas.firebaseIdToken';

function useWebStorage(): boolean {
  return Platform.OS === 'web';
}

export async function getStoredIdToken(): Promise<string | null> {
  if (useWebStorage()) {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    return sessionStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setStoredIdToken(token: string): Promise<void> {
  if (useWebStorage()) {
    sessionStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearStoredIdToken(): Promise<void> {
  if (useWebStorage()) {
    sessionStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
