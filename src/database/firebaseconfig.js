import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';
import 'react-native-get-random-values'; // Para compatibilidad con crypto en React Native
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Obtén la config de Expo (de app.config.js)
const { extra } = Constants.expoConfig || {}; // Fallback si no está disponible

// Configuración de Firebase (debe coincidir con app.config.js)
const firebaseConfig = {
  apiKey: extra?.firebase?.apiKey,
  authDomain: extra?.firebase?.authDomain,
  projectId: extra?.firebase?.projectId,
  storageBucket: extra?.firebase?.storageBucket,
  messagingSenderId: extra?.firebase?.messagingSenderId,
  appId: extra?.firebase?.appId,
  measurementId: extra?.firebase?.measurementId, // Opcional para Analytics
};

// Verifica que la config esté cargada
if (!firebaseConfig?.apiKey) {
  throw new Error('Configuración de Firebase no encontrada. Verifica app.config.js y .env.');
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth con persistencia local (usa AsyncStorage para guardar sesión)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Inicializar Firestore
const db = getFirestore(app);

export { app, auth, db };