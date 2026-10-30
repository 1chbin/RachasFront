import { getAuth } from 'firebase/auth';
import { getOrCreateFirebaseApp } from './firebaseApp.shared';

export const firebaseApp = getOrCreateFirebaseApp();
export const firebaseAuth = getAuth(firebaseApp);
