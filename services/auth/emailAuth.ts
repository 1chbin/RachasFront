import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { firebaseAuth } from './firebaseApp';
import { setStoredIdToken } from '@/lib/authToken';

async function guardarTokenSesion(): Promise<void> {
  const user = firebaseAuth.currentUser;
  if (!user) {
    throw new Error('No hay sesión activa en Firebase');
  }
  const token = await user.getIdToken();
  await setStoredIdToken(token);
}

export async function registrarConEmail(
  email: string,
  password: string,
): Promise<void> {
  await createUserWithEmailAndPassword(
    firebaseAuth,
    email.trim().toLowerCase(),
    password,
  );
  await guardarTokenSesion();
}

export async function ingresarConEmail(
  email: string,
  password: string,
): Promise<void> {
  await signInWithEmailAndPassword(
    firebaseAuth,
    email.trim().toLowerCase(),
    password,
  );
  await guardarTokenSesion();
}
