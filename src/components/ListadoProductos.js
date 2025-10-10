import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FormularioProductos = ({ 
  nuevoProducto, 
  manejoCambio, 
  guardarProducto, 
  actualizarProducto, 
  modoEdicion,
  cancelarEdicion
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {modoEdicion ? 'Actualizar Producto' : 'Agregar Nuevo Producto'}
      </Text>
      
      <View style={styles.inputContainer}>
        <Ionicons name="cube-outline" size={20} color="#9ca3af" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Nombre del producto"
          placeholderTextColor="#9ca3af"
          value={nuevoProducto.nombre}
          onChangeText={(text) => manejoCambio('nombre', text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="cash-outline" size={20} color="#9ca3af" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Precio"
          placeholderTextColor="#9ca3af"
          value={nuevoProducto.precio}
          onChangeText={(text) => manejoCambio('precio', text)}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="server-outline" size={20} color="#9ca3af" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Stock"
          placeholderTextColor="#9ca3af"
          value={nuevoProducto.stock}
          onChangeText={(text) => manejoCambio('stock', text)}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.buttonGroup}>
        {modoEdicion && (
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={cancelarEdicion}>
            <Ionicons name="close-circle-outline" size={20} color="#475569" />
            <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.button, styles.saveButton]} 
          onPress={modoEdicion ? actualizarProducto : guardarProducto}
        >
          <Ionicons name={modoEdicion ? "checkmark-done-circle-outline" : "add-circle-outline"} size={20} color="white" />
          <Text style={styles.buttonText}>{modoEdicion ? "Actualizar" : "Guardar"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
        android: { elevation: 5 },
        web: { boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }
    })
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  buttonGroup: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#475569',
  }
});

export default FormularioProductos;