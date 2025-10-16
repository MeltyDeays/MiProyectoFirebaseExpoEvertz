import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged, signOut } from "firebase/auth";

// ⚠️ ¡IMPORTANTE! Revisa que la ruta a tu archivo firebase sea correcta.
import { auth } from './firebase'; 

// Importa tus vistas
import Usuarios from './src/views/Usuarios'; 
import Productos from './src/views/Productos'; 
import Login from './src/views/Login';

const Tab = createBottomTabNavigator();

// Componente que contiene la navegación por pestañas
function MainAppNavigator({ cerrarSesion }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Usuarios') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Productos') {
            iconName = focused ? 'cube' : 'cube-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb', // Color actualizado
        tabBarInactiveTintColor: 'gray',
        headerStyle: { backgroundColor: '#f1f5f9' },
        headerTitleStyle: { fontWeight: 'bold' },
        // Agregamos el botón de cerrar sesión en la cabecera
        headerRight: () => (
          <TouchableOpacity onPress={cerrarSesion} style={{ marginRight: 15 }}>
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen 
        name="Usuarios" 
        component={Usuarios} 
        options={{ title: 'Gestión de Usuarios' }} 
      />
      <Tab.Screen 
        name="Productos" 
        component={Productos}
        options={{ title: 'Inventario de Productos' }}
      />
    </Tab.Navigator>
  );
}

// Componente principal que maneja la lógica de autenticación
export default function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Firebase nos dice si el usuario inició o cerró sesión
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
    });
    return unsubscribe; // Limpia el listener al desmontar
  }, []);

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <NavigationContainer>
      {/* Si hay un usuario, muestra la app principal. Si no, muestra el Login. */}
      {usuario ? (
        <MainAppNavigator cerrarSesion={cerrarSesion} />
      ) : (
        <Login onLoginSuccess={() => { /* No hace falta hacer nada aquí, el listener ya detecta el cambio */ }} />
      )}
    </NavigationContainer>
  );
}