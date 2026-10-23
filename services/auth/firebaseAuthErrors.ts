import type { FirebaseError } from 'firebase/app';

export function mensajeErrorFirebaseAuth(error: unknown): string {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as FirebaseError).code)
      : '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'Ese email ya está registrado. Probá ingresar.';
    case 'auth/invalid-email':
      return 'El email no es válido.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email o contraseña incorrectos.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Esperá un momento e intentá de nuevo.';
    case 'auth/popup-closed-by-user':
      return 'Inicio con Google cancelado.';
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana de Google. Permití ventanas emergentes.';
    default:
      if (error instanceof Error && error.message) {
        return error.message;
      }
      return 'No se pudo completar la autenticación.';
  }
}
