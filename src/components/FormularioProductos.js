import React from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';

const FormularioProductos = ({ 
  nuevoProducto, 
  manejoCambio, 
  guardarProducto, 
  actualizarProducto, 
  modoEdicion 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {modoEdicion ? 'Actualizar Producto' : 'Agregar Nuevo Producto'}
        </Text>
      </View>
      
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del producto"
          placeholderTextColor="#9ca3af"
          value={nuevoProducto.nombre}
          onChangeText={(text) => manejoCambio('nombre', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Precio"
          placeholderTextColor="#9ca3af"
          value={nuevoProducto.precio}
          onChangeText={(text) => manejoCambio('precio', text)}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Stock"
          placeholderTextColor="#9ca3af"
          value={nuevoProducto.stock}
          onChangeText={(text) => manejoCambio('stock', text)}
          keyboardType="numeric"
        />
        <View style={styles.buttonContainer}>
          <Button
            title={modoEdicion ? "Actualizar" : "Guardar Producto"}
            onPress={modoEdicion ? actualizarProducto : guardarProducto}
            color="#3b82f6"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  header: {
    backgroundColor: '#f8fafc',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 14,
    marginBottom: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  buttonContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default FormularioProductos;