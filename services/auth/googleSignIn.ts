import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Platform } from 'react-native';
import { firebaseAuth } from './firebaseApp';
import { setStoredIdToken } from '@/lib/authToken';

export function isGoogleSignInAvailable(): boolean {
  return Platform.OS === 'web';
}

export async function signInWithGoogle(): Promise<void> {
  if (!isGoogleSignInAvailable()) {
    throw new Error(
      'Google está disponible en la versión web (tecla w en Expo). En el celular usá email y contraseña.',
    );
  }

  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(firebaseAuth, provider);
  const token = await result.user.getIdToken();
  await setStoredIdToken(token);
}

export async function refreshFirebaseIdToken(): Promise<string | null> {
  const user = firebaseAuth.currentUser;
  if (!user) {
    return null;
  }
  const token = await user.getIdToken(true);
  await setStoredIdToken(token);
  return token;
}

export async function signOutFirebase(): Promise<void> {
  const { signOut } = await import('firebase/auth');
  await signOut(firebaseAuth);
}
