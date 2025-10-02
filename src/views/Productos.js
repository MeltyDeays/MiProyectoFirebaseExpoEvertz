import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, Text, ScrollView } from 'react-native';
import { db } from '../database/firebaseconfig';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import FormularioProductos from '../components/FormularioProductos';
import TablaProductos from '../components/TablaProductos';

const Productos = () => {
  const [productos, setProductos] = useState([]);

  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'productos'));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProductos(data);
    } catch (error) {
      console.error('Error al obtener documentos:', error);
    }
  };

  const eliminarProducto = async (id) => {
    try {
      await deleteDoc(doc(db, 'productos', id));
      cargarDatos(); // Recargar la lista después de eliminar
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.mainTitle}>Sistema de Gestión</Text>
          <Text style={styles.subtitle}>Productos</Text>
        </View>

        <FormularioProductos cargarDatos={cargarDatos} />

        {/* Scroll horizontal y vertical para la tabla */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <ScrollView style={styles.tablaWrapper}>
            <TablaProductos productos={productos} eliminarProducto={eliminarProducto} />
          </ScrollView>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 6,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },
  tablaWrapper: {
    maxHeight: 350, // limite para que no crezca demasiado en pantalla
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 4,
    marginTop: 10,
  },
});

export default Productos;
