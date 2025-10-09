import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import BotonEliminarProducto from './BotonEliminarProducto';

const { width } = Dimensions.get('window');

const TablaProductos = ({ productos, eliminarProducto, editarProducto }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventario de Productos</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Cabecera */}
          <View style={styles.headerRow}>
            <Text style={[styles.cell, styles.headerText, { flex: 2 }]}>Nombre</Text>
            <Text style={[styles.cell, styles.headerText, { flex: 1 }]}>Precio</Text>
            <Text style={[styles.cell, styles.headerText, { flex: 1 }]}>Stock</Text>
            <Text style={[styles.cell, styles.headerText, { flex: 1.5 }]}>Acciones</Text>
          </View>
          
          {/* Cuerpo */}
          <ScrollView style={styles.tableBody} showsVerticalScrollIndicator={false}>
            {productos.map((producto, index) => (
              <View style={[styles.row, index % 2 === 0 && styles.evenRow]} key={producto.id}>
                <Text style={[styles.cell, { flex: 2 }]} numberOfLines={2}>{producto.nombre}</Text>
                <View style={[styles.cell, { flex: 1, alignItems: 'center' }]}>
                  <Text style={styles.priceText}>${producto.precio}</Text>
                </View>
                <View style={[styles.cell, { flex: 1, alignItems: 'center' }]}>
                  <Text style={[
                    styles.stockText,
                    producto.stock > 10 ? styles.stockHigh : 
                    producto.stock > 0 ? styles.stockMedium : styles.stockLow
                  ]}>
                    {producto.stock}
                  </Text>
                </View>
                <View style={[styles.cell, { flex: 1.5, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }]}>
                  <TouchableOpacity style={styles.editButton} onPress={() => editarProducto(producto)}>
                      <Text style={styles.buttonText}>Editar</Text>
                  </TouchableOpacity>
                  <BotonEliminarProducto id={producto.id} eliminarProducto={eliminarProducto} />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 5,
        maxHeight: 400, // Altura máxima para la tabla
      },
      header: {
        backgroundColor: '#f8fafc',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
      },
      title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        textAlign: 'center',
      },
      headerRow: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        paddingVertical: 8,
        borderBottomWidth: 2,
        borderBottomColor: '#e2e8f0',
      },
      tableBody: {
        // El scroll vertical es manejado por el ScrollView que envuelve la tabla
      },
      row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingVertical: 8,
        alignItems: 'center',
      },
      evenRow: {
        backgroundColor: '#f8fafc',
      },
      cell: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        fontSize: 13,
        color: '#1e293b',
        textAlign: 'center',
      },
      headerText: {
        fontWeight: '600',
        color: '#334155',
        textAlign: 'center',
        fontSize: 13,
      },
      priceText: {
        color: '#059669',
        fontWeight: '600',
        fontSize: 12,
      },
      stockText: {
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
        fontWeight: '600',
        fontSize: 12,
        textAlign: 'center',
      },
      stockHigh: { backgroundColor: '#d1fae5', color: '#059669' },
      stockMedium: { backgroundColor: '#fef3c7', color: '#d97706' },
      stockLow: { backgroundColor: '#fee2e2', color: '#dc2626' },
      editButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 6,
      },
      buttonText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 12,
      },
});

export default TablaProductos;