import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Importamos la librería de íconos

// Importamos tus dos vistas principales
import Usuarios from './src/views/Usuarios'; 
import Productos from './src/views/Productos'; 

// Creamos una instancia del navegador de pestañas
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    // NavigationContainer es el contenedor principal que maneja la navegación
    <NavigationContainer>
      {/* Tab.Navigator es el componente que renderiza la barra de pestañas */}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          // Esta función define qué ícono mostrar para cada pestaña
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Usuarios') {
              // Si la pestaña está activa (focused), muestra el ícono relleno, si no, el de contorno
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Productos') {
              iconName = focused ? 'cube' : 'cube-outline';
            }

            // Devolvemos el componente de ícono con el nombre y color correctos
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          // Estilos para la barra de pestañas
          tabBarActiveTintColor: '#c53030', // Color del ícono activo
          tabBarInactiveTintColor: 'gray',   // Color del ícono inactivo
          headerStyle: {
            backgroundColor: '#f0f2f5', // Color del encabezado
          },
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        {/* Definimos cada una de las pantallas que estarán en la barra */}
        <Tab.Screen 
          name="Usuarios" 
          component={Usuarios} 
          options={{ title: 'Gestión de Usuarios' }} // Título en el encabezado
        />
        <Tab.Screen 
          name="Productos" 
          component={Productos} 
          options={{ title: 'Inventario de Productos' }} // Título en el encabezado
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}