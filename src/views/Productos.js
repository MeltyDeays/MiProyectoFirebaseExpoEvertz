import React, { useEffect, useState } from "react";
import { View, StyleSheet, Button, Alert, Text } from "react-native"; 
import { db } from "../../firebaseconfig";
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';
import FormularioProductos from "../components/FormularioProductos";
import TablaProductos from "../components/TablaProductos.js";
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

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoId, setProductoId] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: "",
    stock: "" // <-- Añadido para que coincida con el formulario
  });

  const cargarDatos = async () => {
    try {
      const resultado = await cargarDatosFirebase("productos");
      if (resultado && resultado.productos) {
        setProductos(resultado.productos);
      } else {
        const querySnapshot = await getDocs(collection(db, "productos")); 
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProductos(data);
      }
    } catch (error) {
      console.error("Error al obtener documentos: ", error);
    }
  };

  const eliminarProducto = async (id) => {
    try {
      await deleteDoc(doc(db, "productos", id));
      cargarDatos(); 
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const manejoCambio = (nombre, valor) => {
    setNuevoProducto((prev) => ({
      ...prev,
      [nombre]: valor,
    }));
  };

  const guardarProducto = async () => {
    try {
      if (nuevoProducto.nombre && nuevoProducto.precio && nuevoProducto.stock) {
        await addDoc(collection(db, "productos"), {
          nombre: nuevoProducto.nombre,
          precio: parseFloat(nuevoProducto.precio),
          stock: parseInt(nuevoProducto.stock, 10) // <-- Añadido
        });
        cargarDatos(); 
        setNuevoProducto({nombre: "", precio: "", stock: ""}); // <-- Limpiar
      } else {
        alert("Por favor, complete todos los campos.");
      }
    } catch (error) {
      console.error("Error al registrar producto: ", error);
    }
  };

  const actualizarProducto = async () => {
    try{
      if(nuevoProducto.nombre && nuevoProducto.precio && nuevoProducto.stock) {
        await updateDoc(doc(db, "productos", productoId), {
          nombre: nuevoProducto.nombre,
          precio: parseFloat(nuevoProducto.precio),
          stock: parseInt(nuevoProducto.stock, 10) // <-- Añadido
        });
        setNuevoProducto({nombre: "", precio: "", stock: ""}); // <-- Limpiar
        setModoEdicion(false); 
        setProductoId(null);
        cargarDatos(); 
      } else {
        alert("Por favor, complete todos los campos");
      }
    } catch (error) {
      console.error("Error al actualizar producto: ", error);
    }
  };

  const editarProducto = (producto) => {
    setNuevoProducto({
      nombre: producto.nombre,
      precio: producto.precio.toString(),
      stock: (producto.stock || 0).toString() // <-- Añadido
    });
    setProductoId(producto.id);
    setModoEdicion(true)
  };
  
  //... (tus funciones de consulta 'pruebaConsulta1' y 'ejecutarConsultasSolicitadas' van aquí)
   useEffect(() => {
    cargarDatos();
    // pruebaConsulta1(); // Descomenta si las necesitas
    // ejecutarConsultasSolicitadas(); // Descomenta si las necesitas
  }, []);

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

  // --- NUEVAS FUNCIONES PARA PDF ---

  const generarHTMLParaProductos = (data) => {
    let tableRows = '';
    data.forEach(prod => {
      const precio = typeof prod.precio === 'number' ? `C$${prod.precio.toFixed(2)}` : (prod.precio || '');
      tableRows += `
        <tr>
          <td>${prod.nombre || ''}</td>
          <td>${precio}</td>
          <td>${prod.stock || '0'}</td>
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
          </style>
        </head>
        <body>
          <h1>Reporte de Productos</h1>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
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

  const exportarProductosPDF = async () => {
    if (productos.length === 0) {
      Alert.alert("Sin datos", "No hay productos para exportar a PDF.");
      return;
    }
    try {
      const htmlContent = generarHTMLParaProductos(productos);
      const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Error", "La función Compartir no está disponible.");
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Exportar Productos (PDF)',
        UTI: '.pdf'
      });
    } catch (error) {
      console.error("Error al generar PDF de productos:", error);
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
    <View style={styles.container}>
      <FormularioProductos
        nuevoProducto={nuevoProducto}
        manejoCambio={manejoCambio}
        guardarProducto={guardarProducto}
        actualizarProducto={actualizarProducto}
        modoEdicion={modoEdicion}
        cancelarEdicion={() => { // <-- Añadido Cancelar
          setNuevoProducto({nombre: "", precio: "", stock: ""});
          setModoEdicion(false);
          setProductoId(null);
        }}
      />

      {/* --- BLOQUE DE BOTONES (ACTUALIZADO) --- */}
      <View style={{ marginVertical: 12, padding: 10, backgroundColor: '#f9fafb', borderRadius: 8, elevation: 2 }}>
        <Text style={{fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#374151'}}>
          Opciones de Exportación
        </Text>
        <View style={{gap: 8}}>
          <Button 
            title="Exportar 'productos' (JSON)" 
            onPress={() => exportarColeccion("productos")} 
            color="#3b82f6"
          />
          <Button 
            title="Exportar 'usuarios' (JSON)" 
            onPress={() => exportarColeccion("usuarios")} 
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
          {/* --- NUEVOS BOTONES PDF --- */}
          <Button 
            title="Exportar Productos (PDF)" 
            onPress={exportarProductosPDF} 
            color="#ef4444" // Rojo
          />
           <Button 
            title="Exportar TODO (PDF)" 
            onPress={exportarTodoPDF} 
            color="#b91c1c" // Rojo Oscuro
          />
        </View>
      </View>
      {/* --- FIN BLOQUE DE BOTONES --- */}

      <TablaProductos 
        productos={productos} 
        eliminarProducto={eliminarProducto}
        editarProducto={editarProducto}
        cargarDatos={cargarDatos}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});

export default Productos;