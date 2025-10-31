import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { db } from '../../firebaseconfig';
import { collection, addDoc, updateDoc, doc, deleteDoc, onSnapshot, query } from 'firebase/firestore'; 

import FormularioUsuario from '../components/FormularioUsuario';
import TablaUsuarios from '../components/TablaUsuarios';

const Usuarios = () => {
    const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: "", correo: "", telefono: "", edad: "" });
    const [usuarios, setUsuarios] = useState([]);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [usuarioId, setUsuarioId] = useState(null);

    useEffect(() => {
        const q = query(collection(db, "usuarios"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const listaUsuarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsuarios(listaUsuarios);
        }, (error) => {
            console.error("Error al obtener usuarios:", error);
            Alert.alert("Error de Conexión", "No se pudieron cargar los usuarios en tiempo real.");
        });
        
        return () => unsubscribe();
    }, []);

    const limpiarFormulario = () => {
        setNuevoUsuario({ nombre: "", correo: "", telefono: "", edad: "" });
        setUsuarioId(null);
        setModoEdicion(false);
    };

    const validarDatos = async (datos) => {
        try {
            // ⚠️ ¡IMPORTANTE! Reemplaza esto con tu URL real de AWS API Gateway
            const API_URL = "https://y01haecv13.execute-api.us-east-2.amazonaws.com/validarusuario";
         
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos),
            });

            const resultado = await response.json();

            if (resultado.success) {
                return resultado.data;
            } else {
                if (resultado.errors && Array.isArray(resultado.errors)) {
                    Alert.alert("Errores en los datos", resultado.errors.join("\n"));
                } else {
                    Alert.alert("Error del Servidor", resultado.message || "Ocurrió un error inesperado.");
                }
                return null;
            }
        } catch (error) {
            console.error("Error al validar con Lambda:", error);
            Alert.alert("Error de Red", "No se pudo conectar con el servidor de validación en AWS.");
            return null;
        }
    };

    const guardarUsuario = async () => {
        const datosValidados = await validarDatos(nuevoUsuario);
        if (datosValidados) {
            try {
                await addDoc(collection(db, "usuarios"), { 
                    nombre: datosValidados.nombre,
                    correo: datosValidados.correo,
                    telefono: datosValidados.telefono,
                    edad: parseInt(datosValidados.edad, 10),
                });
                limpiarFormulario();
                Alert.alert("Éxito", "Usuario registrado correctamente.");
            } catch (error) {
                Alert.alert("Error", "Fallo al guardar en Firestore.");
            }
        }
    };

    const actualizarUsuario = async () => {
        const datosValidados = await validarDatos(nuevoUsuario);
        if (datosValidados && usuarioId) {
            try {
                await updateDoc(doc(db, "usuarios", usuarioId), { 
                    nombre: datosValidados.nombre,
                    correo: datosValidados.correo,
                    telefono: datosValidados.telefono,
                    edad: parseInt(datosValidados.edad, 10),
                });
                limpiarFormulario();
                Alert.alert("Éxito", "Usuario actualizado correctamente.");
            } catch (error) {
                Alert.alert("Error", "Fallo al actualizar en Firestore.");
            }
        }
    };

    const confirmarEliminacion = (id) => {
        Alert.alert(
            "Confirmar Eliminación",
            "¿Estás seguro de que deseas eliminar este usuario?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", style: "destructive", onPress: () => eliminarUsuario(id) }
            ]
        );
    };

    const eliminarUsuario = async (id) => {
        try {
            await deleteDoc(doc(db, "usuarios", id));
            Alert.alert("Éxito", "Usuario eliminado correctamente.");
        } catch (error) {
            Alert.alert("Error", "Fallo al conectar con Firestore para eliminar.");
        }
    };

    const iniciarEdicion = (usuario) => {
        setNuevoUsuario({ 
            nombre: usuario.nombre, 
            correo: usuario.correo, 
            telefono: usuario.telefono, 
            edad: String(usuario.edad)
        });
        setUsuarioId(usuario.id);
        setModoEdicion(true);
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.flexContainer}
        >
            <ScrollView style={styles.container}>
                <FormularioUsuario 
                    nuevoUsuario={nuevoUsuario}
                    setNuevoUsuario={setNuevoUsuario}
                    guardarUsuario={guardarUsuario}
                    actualizarUsuario={actualizarUsuario}
                    modoEdicion={modoEdicion}
                    cancelarEdicion={limpiarFormulario}
                />
                <TablaUsuarios 
                    usuarios={usuarios}
                    iniciarEdicion={iniciarEdicion}
                    eliminarUsuario={confirmarEliminacion}
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

export default Usuarios;