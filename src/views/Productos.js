import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, deleteDoc, addDoc, updateDoc, query } from 'firebase/firestore';

import FormularioProductos from '../components/FormularioProductos';
import TablaProductos from '../components/TablaProductos';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', precio: '', stock: '' });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoId, setProductoId] = useState(null);

  // ... (todo tu código de useEffect, guardarProducto, etc., se queda igual)
  useEffect(() => {
    const q = query(collection(db, 'productos'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProductos(data);
    }, (error) => {
      console.error("Error al obtener productos en tiempo real:", error);
    });

    return () => unsubscribe();
  }, []);

  const manejoCambio = (nombre, valor) => {
    setNuevoProducto(prev => ({ ...prev, [nombre]: valor }));
  };
  
  const limpiarFormulario = () => {
    setModoEdicion(false);
    setProductoId(null);
    setNuevoProducto({ nombre: '', precio: '', stock: '' });
  };

  const guardarProducto = async () => {
    if (!nuevoProducto.nombre || !nuevoProducto.precio || !nuevoProducto.stock) {
      Alert.alert("Atención", "Por favor, completa todos los campos.");
      return;
    }
    try {
      await addDoc(collection(db, 'productos'), {
        nombre: nuevoProducto.nombre,
        precio: parseFloat(nuevoProducto.precio),
        stock: parseInt(nuevoProducto.stock, 10),
      });
      limpiarFormulario();
      Alert.alert("Éxito", "Producto agregado correctamente.");
    } catch (error) {
      console.error('Error al registrar el producto:', error);
      Alert.alert("Error", "No se pudo guardar el producto.");
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
      Alert.alert("Atención", "Por favor, completa todos los campos.");
      return;
    }
    try {
      const productoDoc = doc(db, "productos", productoId);
      await updateDoc(productoDoc, {
        nombre: nuevoProducto.nombre,
        precio: parseFloat(nuevoProducto.precio),
        stock: parseInt(nuevoProducto.stock, 10),
      });
      limpiarFormulario();
      Alert.alert("Éxito", "Producto actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      Alert.alert("Error", "No se pudo actualizar el producto.");
    }
  };

  const confirmarEliminacion = (id) => {
    Alert.alert(
        "Eliminar Producto",
        "¿Estás seguro de que quieres eliminar este producto?",
        [
            { text: "Cancelar", style: "cancel" },
            { text: "Eliminar", style: "destructive", onPress: () => eliminarProducto(id) }
        ]
    );
  };

  const eliminarProducto = async (id) => {
    try {
      await deleteDoc(doc(db, 'productos', id));
      Alert.alert("Éxito", "Producto eliminado.");
    } catch (error) {
      console.error('Error al eliminar:', error);
      Alert.alert("Error", "No se pudo eliminar el producto.");
    }
  };


  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.flexContainer}
    >
      <ScrollView style={styles.container}>
        <FormularioProductos
          nuevoProducto={nuevoProducto}
          manejoCambio={manejoCambio}
          guardarProducto={guardarProducto}
          actualizarProducto={actualizarProducto}
          modoEdicion={modoEdicion}
          cancelarEdicion={limpiarFormulario}
        />

        <TablaProductos
          productos={productos}
          eliminarProducto={confirmarEliminacion}
          editarProducto={editarProducto}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default Productos;