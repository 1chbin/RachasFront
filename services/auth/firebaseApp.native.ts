import { getAuth, initializeAuth } from 'firebase/auth';
// Metro alias: firebase/auth → @firebase/auth RN build (see metro.config.js)
// @ts-expect-error RN-only export; default firebase/auth typings target web
import { getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getOrCreateFirebaseApp } from './firebaseApp.shared';

function createFirebaseAuth() {
  const app = getOrCreateFirebaseApp();

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
}

export const firebaseApp = getOrCreateFirebaseApp();
export const firebaseAuth = createFirebaseAuth();
