import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TablaUsuarios = ({ usuarios, iniciarEdicion, eliminarUsuario }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>Usuarios Registrados</Text>
            
            <View style={styles.table}>
                <View style={styles.headerRow}>
                    <Text style={[styles.headerText, { flex: 3 }]}>Usuario</Text>
                    <Text style={[styles.headerText, { flex: 3 }]}>Contacto</Text>
                    <Text style={[styles.headerText, { flex: 2, textAlign: 'right' }]}>Acciones</Text>
                </View>

                <ScrollView>
                    {usuarios.length > 0 ? usuarios.map((item) => (
                        <View key={item.id} style={styles.row}>
                            <View style={{ flex: 3, justifyContent: 'center' }}>
                               <Text style={styles.textPrimary} numberOfLines={1}>{item.nombre}</Text>
                               <Text style={styles.textSecondary}>Edad: {item.edad}</Text>
                            </View>
                            <View style={{ flex: 3, justifyContent: 'center' }}>
                               <Text style={styles.textSecondary} numberOfLines={1}>{item.correo}</Text>
                               <Text style={styles.textSecondary}>Tel: {item.telefono}</Text>
                            </View>
                            <View style={styles.actionCell}>
                                <TouchableOpacity style={styles.iconButton} onPress={() => iniciarEdicion(item)}>
                                    <Ionicons name="pencil-outline" size={20} color="#ca8a04" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.iconButton} onPress={() => eliminarUsuario(item.id)}>
                                    <Ionicons name="trash-outline" size={20} color="#dc2626" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )) : (
                        <Text style={styles.emptyText}>No hay usuarios registrados.</Text>
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
      textPrimary: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
      },
      textSecondary: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
      },
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

export default TablaUsuarios;