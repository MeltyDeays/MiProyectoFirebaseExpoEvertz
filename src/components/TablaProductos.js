import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TablaProductos = ({ productos, eliminarProducto, editarProducto }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Inventario Actual</Text>
      
      <View style={styles.table}>
        {/* Cabecera */}
        <View style={styles.headerRow}>
          <Text style={[styles.headerText, { flex: 3 }]}>Producto</Text>
          <Text style={[styles.headerText, { flex: 1.5, textAlign: 'center' }]}>Precio</Text>
          <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>Stock</Text>
          <Text style={[styles.headerText, { flex: 2, textAlign: 'right' }]}>Acciones</Text>
        </View>
        
        {/* Cuerpo */}
        <ScrollView>
          {productos.length > 0 ? productos.map((producto) => (
            <View style={styles.row} key={producto.id}>
              <Text style={[styles.cellText, { flex: 3 }]} numberOfLines={1}>{producto.nombre}</Text>
              <Text style={[styles.cellText, styles.priceText, { flex: 1.5, textAlign: 'center' }]}>C${producto.precio.toFixed(2)}</Text>
              <View style={[styles.cellText, { flex: 1, alignItems: 'center' }]}>
                <Text style={[
                  styles.stockBadge,
                  producto.stock > 10 ? styles.stockHigh : 
                  producto.stock > 0 ? styles.stockMedium : styles.stockLow
                ]}>
                  {producto.stock}
                </Text>
              </View>
              <View style={styles.actionCell}>
                <TouchableOpacity style={styles.iconButton} onPress={() => editarProducto(producto)}>
                  <Ionicons name="pencil-outline" size={20} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => eliminarProducto(producto.id)}>
                  <Ionicons name="trash-outline" size={20} color="#dc2626" />
                </TouchableOpacity>
              </View>
            </View>
          )) : (
            <Text style={styles.emptyText}>No hay productos en el inventario.</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    card: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      marginVertical: 12,
      paddingVertical: 20,
      maxHeight: 500,
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
      marginBottom: 16,
      paddingHorizontal: 20,
    },
    table: {
      paddingHorizontal: 16,
    },
    headerRow: {
      flexDirection: 'row',
      borderBottomWidth: 2,
      borderBottomColor: '#e2e8f0',
      paddingBottom: 12,
      marginBottom: 8,
    },
    headerText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#64748b',
      textTransform: 'uppercase',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f1f5f9',
    },
    cellText: {
      fontSize: 14,
      color: '#334155',
    },
    priceText: {
      fontWeight: '600',
      color: '#166534',
    },
    stockBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      fontWeight: 'bold',
      fontSize: 12,
      overflow: 'hidden',
    },
    stockHigh: { backgroundColor: '#dcfce7', color: '#166534' },
    stockMedium: { backgroundColor: '#fef9c3', color: '#b45309' },
    stockLow: { backgroundColor: '#fee2e2', color: '#b91c1c' },
    actionCell: {
      flex: 2,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 12,
    },
    iconButton: {
      padding: 4,
    },
    emptyText: {
      textAlign: 'center',
      padding: 20,
      color: '#64748b',
      fontStyle: 'italic',
    },
});

export default TablaProductos;