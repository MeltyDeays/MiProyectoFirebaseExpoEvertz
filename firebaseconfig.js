import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth"; // Importar initializeAuth y getReactNativePersistence
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; // 1. Importar getDatabase
import Constants from "expo-constants";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; // Importar AsyncStorage

// Tus variables de config
const firebaseConfig = {
  apiKey: Constants.expoConfig.extra.FIREBASE_API_KEY,
  authDomain: Constants.expoConfig.extra.FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig.extra.FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig.extra.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig.extra.FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig.extra.FIREBASE_APP_ID,
  databaseURL: Constants.expoConfig.extra.FIREBASE_DATABASE_URL, // 2. Agregar databaseURL
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
}); // Configurar autenticación con persistencia
const db = getFirestore(app); // Tu instancia de Firestore (la dejamos como está)

// 3. Crear y exportar instancia de Realtime DB
const realtimeDB = getDatabase(app);

export { app, auth, db, realtimeDB }; // 4. Exportar realtimeDB