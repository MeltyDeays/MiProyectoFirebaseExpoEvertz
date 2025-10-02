import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import BotonEliminarProducto from './BotonEliminarProducto';

const { width } = Dimensions.get('window');

const TablaProductos = ({ productos, eliminarProducto }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventario de Productos</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.table, { width: width - 16 }]}>
          {/* Cabecera */}
          <View style={styles.headerRow}>
            <Text style={[styles.cell, styles.headerText, styles.nameColumn]}>Nombre</Text>
            <Text style={[styles.cell, styles.headerText, styles.priceColumn]}>Precio</Text>
            <Text style={[styles.cell, styles.headerText, styles.stockColumn]}>Stock</Text>
            <Text style={[styles.cell, styles.headerText, styles.actionColumn]}>Acciones</Text>
          </View>
          
          {/* Cuerpo */}
          <ScrollView style={styles.tableBody} showsVerticalScrollIndicator={false}>
            {productos.map((producto, index) => (
              <View style={[styles.row, index % 2 === 0 && styles.evenRow]} key={producto.id}>
                <Text style={[styles.cell, styles.nameColumn]} numberOfLines={2}>{producto.nombre}</Text>
                <View style={[styles.cell, styles.priceColumn]}>
                  <Text style={styles.priceText}>${producto.precio}</Text>
                </View>
                <View style={[styles.cell, styles.stockColumn]}>
                  <Text style={[
                    styles.stockText,
                    producto.stock > 10 ? styles.stockHigh : 
                    producto.stock > 0 ? styles.stockMedium : styles.stockLow
                  ]}>
                    {producto.stock}
                  </Text>
                </View>
                <View style={[styles.cell, styles.actionColumn]}>
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
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 5,
    flex: 1,
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
  table: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
  },
  tableBody: {
    maxHeight: 320,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 8,
  },
  evenRow: {
    backgroundColor: '#f8fafc',
  },
  cell: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    justifyContent: 'center',
    fontSize: 13,
    color: '#1e293b',
    flex: 1, // << clave para que se adapte
  },
  headerText: {
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 13,
  },
  // proporciones de columnas
  nameColumn: { flex: 2 },
  priceColumn: { flex: 1, alignItems: 'center' },
  descColumn: { flex: 3 },
  stockColumn: { flex: 1, alignItems: 'center' },
  actionColumn: { flex: 1.5, alignItems: 'center' },

  priceText: {
    backgroundColor: '#d1fae5',
    color: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
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
});

export default TablaProductos;
