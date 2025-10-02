import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const BotonEliminarProducto = ({ id, eliminarProducto }) => {
  const handleDelete = () => {
    eliminarProducto(id);
  };

  return (
    <TouchableOpacity style={styles.boton} onPress={handleDelete}>
      <Text style={styles.texto}>Eliminar</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  boton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  texto: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default BotonEliminarProducto;