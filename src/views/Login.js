import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, KeyboardAvoidingView } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Ionicons } from '@expo/vector-icons';
// ⚠️ ¡OJO! Asegúrate que la ruta a tu configuración de firebase sea correcta.
// Si tu archivo se llama 'firebase.js' en la raíz, la ruta sería '../../firebase'
import { auth } from "../../firebase"; // <--- REVISA ESTA RUTA

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    
    const manejarLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Por favor completa ambos campos.");
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setLoading(true);
            onLoginSuccess(); // Notifica al componente App que el login fue exitoso
        } catch (error) {
            setLoading(false);
            console.log(error);
            let mensaje = "Error al iniciar sesión.";

            if (error.code === "auth/invalid-email") {
                mensaje = "Correo inválido.";
            }
            if (error.code === "auth/user-not-found") {
                mensaje = "Usuario no encontrado.";
            }
            if (error.code === "auth/wrong-password") {
                mensaje = "Contraseña incorrecta.";
            }
            
            Alert.alert("Error", mensaje);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.card}>
                <Ionicons name="log-in-outline" size={48} color="#2563eb" style={styles.headerIcon} />
                <Text style={styles.title}>Bienvenido</Text>
                <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
                
                <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Correo Electrónico"
                        placeholderTextColor="#9ca3af"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
                
                <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        placeholderTextColor="#9ca3af"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!isPasswordVisible}
                    />
                    <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                        <Ionicons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={22} color="#9ca3af" style={styles.icon} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button} onPress={manejarLogin} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Entrar</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 16,
        backgroundColor: "#f1f5f9", // Mismo fondo que el resto de la app
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
            android: { elevation: 8 },
        })
    },
    headerIcon: {
        alignSelf: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        color: '#1e293b',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#64748b',
        marginBottom: 32,
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
    button: {
        backgroundColor: "#2563eb", // Mismo azul que en Usuarios
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
            android: { elevation: 3 },
        })
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default Login;