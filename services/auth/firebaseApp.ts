import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

function getFirebaseConfig() {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !appId) {
    throw new Error(
      'Faltan variables EXPO_PUBLIC_FIREBASE_* en el entorno de la app',
    );
  }

  return { apiKey, authDomain, projectId, appId };
}

const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfig());

export { firebaseApp };
export const firebaseAuth = getAuth(firebaseApp);
