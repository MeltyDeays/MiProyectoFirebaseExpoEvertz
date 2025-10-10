import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FormularioUsuario = ({ 
    nuevoUsuario, 
    setNuevoUsuario, 
    guardarUsuario, 
    actualizarUsuario, 
    modoEdicion, 
    cancelarEdicion 
}) => {
    
    const handleChange = (name, value) => {
        setNuevoUsuario(prev => ({ ...prev, [name]: value }));
    };

    return (
        <View style={styles.card}>
            <Text style={styles.title}>{modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}</Text>
            
            <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Nombre"
                    value={nuevoUsuario.nombre}
                    onChangeText={(val) => handleChange('nombre', val)}
                />
            </View>

            <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Correo Electrónico"
                    value={nuevoUsuario.correo}
                    onChangeText={(val) => handleChange('correo', val)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#9ca3af" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Teléfono (8 dígitos)"
                    value={nuevoUsuario.telefono}
                    onChangeText={(val) => handleChange('telefono', val)}
                    keyboardType="phone-pad"
                    maxLength={8}
                />
            </View>

            <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#9ca3af" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Edad"
                    value={nuevoUsuario.edad}
                    onChangeText={(val) => handleChange('edad', val)}
                    keyboardType="number-pad"
                    maxLength={3}
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
                    onPress={modoEdicion ? actualizarUsuario : guardarUsuario}
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
        backgroundColor: '#2563eb', // Un azul diferente para Usuarios
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

export default FormularioUsuario;