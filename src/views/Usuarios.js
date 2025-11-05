import React, { useState, useEffect } from 'react';  
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, Button, Text } from 'react-native'; 
import { db } from '../../firebaseconfig';  
import { collection, addDoc, updateDoc, doc, deleteDoc, onSnapshot, query, getDocs } from 'firebase/firestore'; 

import FormularioUsuario from '../components/FormularioUsuario';  
import TablaUsuarios from '../components/TablaUsuarios';  

import * as FileSystem from "expo-file-system/legacy"; 
import * as Sharing from "expo-sharing"; 
import * as Clipboard from "expo-clipboard";
import * as Print from 'expo-print'; // <-- Importación PDF

// Función para cargar datos de UNA colección (JSON)
const cargarDatosFirebase = async (nombreColeccion) => {
  if (!nombreColeccion || typeof nombreColeccion !== 'string') {
    console.error("Error: Se requiere un nombre de colección válido.");
    return;
  }
  try {
    const datosExportados = {};
    const snapshot = await getDocs(collection(db, nombreColeccion));
    datosExportados[nombreColeccion] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return datosExportados;
  } catch (error) {
    console.error(`Error extrayendo datos de la colección '${nombreColeccion}':`, error);
  }
};


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

    // ... (Aquí van tus funciones: validarDatos, guardarUsuario, actualizarUsuario, confirmarEliminacion, eliminarUsuario, iniciarEdicion)
    
    const validarDatos = async (datos) => {  
        try {  
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


    // --- CÓDIGO DE EXPORTACIÓN (JSON) ---

    const colecciones = ["productos", "usuarios", "ciudades"]; 

    const exportarColeccion = async (nombreColeccion) => {
      try {
        const datos = await cargarDatosFirebase(nombreColeccion); 
        if (!datos || Object.keys(datos).length === 0) {
          Alert.alert("Error", `No se pudieron cargar datos para '${nombreColeccion}'`);
          return;
        }
        const jsonString = JSON.stringify(datos, null, 2);
        const baseFileName = `datos_${nombreColeccion}.json`;
        
        await Clipboard.setStringAsync(jsonString);
        if (!(await Sharing.isAvailableAsync())) {
          Alert.alert("Error", "La función Compartir/Guardar no está disponible.");
          return;
        }
        const fileUri = FileSystem.cacheDirectory + baseFileName;
        await FileSystem.writeAsStringAsync(fileUri, jsonString);
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: `Compartir datos de ${nombreColeccion} (JSON)`
        });
        Alert.alert("Éxito", `Datos de '${nombreColeccion}' copiados y listos para compartir.`);
      } catch (error) {
        console.error(`Error al exportar ${nombreColeccion}:`, error);
        Alert.alert("Error al exportar", error.message);
      }
    };

    const cargarTODOSDatosFirebase = async () => {
      try {
        const datosExportados = {};
        for (const col of colecciones) {
          const datosCol = await cargarDatosFirebase(col);
          if (datosCol) {
            Object.assign(datosExportados, datosCol);
          }
        }
        return datosExportados;
      } catch (error) {
        console.error("Error extrayendo todos los datos:", error);
        return null;
      }
    };

    const exportarTodosLosDatos = async () => {
      try {
        const datos = await cargarTODOSDatosFirebase(); 
        if (!datos || Object.keys(datos).length === 0) {
          Alert.alert("Error", "No se pudieron cargar los datos.");
          return;
        }
        const jsonString = JSON.stringify(datos, null, 2);
        const baseFileName = "datos_firebase_TODOS.json";
        
        await Clipboard.setStringAsync(jsonString);
        if (!(await Sharing.isAvailableAsync())) {
          Alert.alert("Error", "La función Compartir/Guardar no está disponible.");
          return;
        }
        const fileUri = FileSystem.cacheDirectory + baseFileName;
        await FileSystem.writeAsStringAsync(fileUri, jsonString);
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Compartir TODOS los datos de Firebase (JSON)'
        });
        Alert.alert("Éxito", "Todos los datos han sido copiados y están listos para compartir.");
      } catch (error) {
        console.error("Error al exportar o compartir todo:", error);
        Alert.alert("Error al exportar todo", error.message);
      }
    };

    
    // --- FUNCIONES PARA PDF ---

    const generarHTMLParaUsuarios = (data) => {
      let tableRows = '';
      data.forEach(user => {
        tableRows += `
          <tr>
            <td>${user.nombre || ''}</td>
            <td>${user.correo || ''}</td>
            <td>${user.telefono || ''}</td>
            <td>${user.edad || ''}</td>
          </tr>
        `;
      });

      return `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: sans-serif; margin: 20px; }
              h1 { text-align: center; color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              th { background-color: #f4f4f4; color: #333; }
              tr:nth-child(even) { background-color: #f9f9f9; }
            </style>
          </head>
          <body>
            <h1>Reporte de Usuarios</h1>
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Edad</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </body>
        </html>
      `;
    };

    const exportarUsuariosPDF = async () => {
      if (usuarios.length === 0) {
        Alert.alert("Sin datos", "No hay usuarios para exportar a PDF.");
        return;
      }
      try {
        const htmlContent = generarHTMLParaUsuarios(usuarios);
        const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });
        if (!(await Sharing.isAvailableAsync())) {
          Alert.alert("Error", "La función Compartir no está disponible.");
          return;
        }
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Exportar Usuarios (PDF)',
          UTI: '.pdf'
        });
      } catch (error) {
        console.error("Error al generar PDF:", error);
        Alert.alert("Error", "No se pudo generar el PDF: " + error.message);
      }
    };

    const generarHTMLParaTodo = (datos) => {
      let htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: sans-serif; margin: 20px; }
              h1 { text-align: center; color: #1e3a8a; }
              h2 { text-transform: capitalize; color: #333; border-bottom: 2px solid #eee; padding-bottom: 5px; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 30px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; word-break: break-word; }
              th { background-color: #f4f4f4; color: #333; }
              tr:nth-child(even) { background-color: #f9f9f9; }
            </style>
          </head>
          <body>
            <h1>Reporte Completo de Firebase</h1>
      `;

      for (const coleccionNombre in datos) {
        const items = datos[coleccionNombre];
        if (!items || items.length === 0) {
          htmlContent += `<h2>${coleccionNombre}</h2><p>No hay datos.</p>`;
          continue;
        }

        htmlContent += `<h2>${coleccionNombre}</h2>`;
        htmlContent += `<table><thead><tr>`;

        const headers = Object.keys(items[0]);
        headers.forEach(header => {
          htmlContent += `<th>${header}</th>`;
        });
        htmlContent += `</tr></thead><tbody>`;

        items.forEach(item => {
          htmlContent += `<tr>`;
          headers.forEach(header => {
            let valor = item[header];
            if (typeof valor === 'object' && valor !== null) {
              valor = JSON.stringify(valor);
            }
            htmlContent += `<td>${valor || ''}</td>`;
          });
          htmlContent += `</tr>`;
        });
        htmlContent += `</tbody></table>`;
      }
      htmlContent += `</body></html>`;
      return htmlContent;
    };
  
    const exportarTodoPDF = async () => {
        const datos = await cargarTODOSDatosFirebase();
        if (!datos || Object.keys(datos).length === 0) {
          Alert.alert("Sin datos", "No hay datos de ninguna colección para exportar.");
          return;
        }
        try {
          const htmlContent = generarHTMLParaTodo(datos);
          const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });
          if (!(await Sharing.isAvailableAsync())) {
            Alert.alert("Error", "La función Compartir no está disponible.");
            return;
          }
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Exportar Todo (PDF)',
            UTI: '.pdf'
          });
        } catch (error) {
          console.error("Error al generar PDF de TODO:", error);
          Alert.alert("Error", "No se pudo generar el PDF: " + error.message);
        }
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

                {/* --- BLOQUE DE BOTONES (ACTUALIZADO) --- */}
                <View style={{ marginVertical: 12, padding: 10, backgroundColor: '#f9fafb', borderRadius: 8, elevation: 2 }}>
                  <Text style={{fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#374151'}}>
                    Opciones de Exportación
                  </Text>
                  <View style={{gap: 8}}>
                    <Button 
                      title="Exportar 'usuarios' (JSON)" 
                      onPress={() => exportarColeccion("usuarios")} 
                      color="#3b82f6"
                    />
                    <Button 
                      title="Exportar 'productos' (JSON)" 
                      onPress={() => exportarColeccion("productos")} 
                      color="#1d4ed8"
                    />
                     <Button 
                      title="Exportar 'ciudades' (JSON)" 
                      onPress={() => exportarColeccion("ciudades")} 
                      color="#047857"
                    />
                    <Button 
                      title="Exportar TODO (JSON)" 
                      onPress={exportarTodosLosDatos} 
                      color="#166534"
                    />
                    <Button 
                      title="Exportar Usuarios (PDF)" 
                      onPress={exportarUsuariosPDF} 
                      color="#ef4444" // Rojo
                    />
                    {/* --- NUEVO BOTÓN PDF --- */}
                    <Button 
                      title="Exportar TODO (PDF)" 
                      onPress={exportarTodoPDF} 
                      color="#b91c1c" // Rojo Oscuro
                    />
                  </View>
                </View>
                {/* --- FIN BLOQUE DE BOTONES --- */}
                
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