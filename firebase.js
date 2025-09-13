import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';

const { extra } = Constants.expoConfig || {};
const firebaseConfig = extra?.firebase;

if (!firebaseConfig?.apiKey) {
  throw new Error('Configuración de Firebase no encontrada.');
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);