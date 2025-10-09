import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, Text, Alert } from 'react-native';
import { db } from '../database/firebaseconfig';
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';

import FormularioProductos from '../components/FormularioProductos';
import TablaProductos from '../components/TablaProductos';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', precio: '', stock: '' });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoId, setProductoId] = useState(null);

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

  useEffect(() => {
    cargarDatos();
  }, []);

  const manejoCambio = (nombre, valor) => {
    setNuevoProducto(prev => ({ ...prev, [nombre]: valor }));
  };

  const guardarProducto = async () => {
    if (!nuevoProducto.nombre || !nuevoProducto.precio || !nuevoProducto.stock) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }
    try {
      await addDoc(collection(db, 'productos'), {
        nombre: nuevoProducto.nombre,
        precio: parseFloat(nuevoProducto.precio),
        stock: parseInt(nuevoProducto.stock, 10),
      });
      cargarDatos();
      setNuevoProducto({ nombre: '', precio: '', stock: '' }); // Limpiar formulario
      Alert.alert("Éxito", "Producto agregado correctamente.");
    } catch (error) {
      console.error('Error al registrar el producto:', error);
    }
  };

  const editarProducto = (producto) => {
    setModoEdicion(true);
    setProductoId(producto.id);
    setNuevoProducto({
      nombre: producto.nombre,
      precio: producto.precio.toString(),
      stock: producto.stock.toString(),
    });
  };

  const actualizarProducto = async () => {
    if (!nuevoProducto.nombre || !nuevoProducto.precio || !nuevoProducto.stock) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }
    try {
      const productoDoc = doc(db, "productos", productoId);
      await updateDoc(productoDoc, {
        nombre: nuevoProducto.nombre,
        precio: parseFloat(nuevoProducto.precio),
        stock: parseInt(nuevoProducto.stock, 10),
      });
      
      setModoEdicion(false);
      setProductoId(null);
      setNuevoProducto({ nombre: '', precio: '', stock: '' });
      cargarDatos();
      Alert.alert("Éxito", "Producto actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar producto:", error);
    }
  };

  const eliminarProducto = async (id) => {
    try {
      await deleteDoc(doc(db, 'productos', id));
      cargarDatos();
      Alert.alert("Éxito", "Producto eliminado.");
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.mainTitle}>Gestión de Inventario</Text>
        </View>

        <FormularioProductos
          nuevoProducto={nuevoProducto}
          manejoCambio={manejoCambio}
          guardarProducto={guardarProducto}
          actualizarProducto={actualizarProducto}
          modoEdicion={modoEdicion}
        />

        <TablaProductos
          productos={productos}
          eliminarProducto={eliminarProducto}
          editarProducto={editarProducto}
        />
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
});

export default Productos;