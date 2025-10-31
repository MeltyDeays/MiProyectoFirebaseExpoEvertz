import { initializeApp, getApps, getApp } from 'firebase/app'; // Importar getApps y getApp
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import {
  initializeAuth,
  getReactNativePersistence,
  indexedDBLocalPersistence
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const { extra } = Constants.expoConfig || {};
const firebaseConfig = extra?.firebase;

if (!firebaseConfig?.apiKey) {
  throw new Error('Configuración de Firebase no encontrada.');
}

// Declarar las variables que vamos a exportar
let app;
let auth;
let db;

// Verificar si Firebase ya ha sido inicializado
if (getApps().length === 0) {
  // Si no hay apps inicializadas, inicializar una nueva
  app = initializeApp(firebaseConfig);
} else {
  // Si ya existe, simplemente obtener la instancia de la app existente
  app = getApp();
}

// Usar la instancia de la app (nueva o existente) para inicializar los servicios
auth = initializeAuth(app, {
  persistence: Platform.OS === 'web'
    ? indexedDBLocalPersistence
    : getReactNativePersistence(ReactNativeAsyncStorage)
});

db = getFirestore(app);

// Exportar las instancias
export { app, auth, db };