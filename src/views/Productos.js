import React, { useEffect, useState } from "react";
import { View, StyleSheet, Button, Alert, Text } from "react-native"; 
import { db } from "../../firebaseconfig";
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore'; // Imports limpiados
import FormularioProductos from "../components/FormularioProductos";
import TablaProductos from "../components/TablaProductos.js";
import * as Print from 'expo-print';
import * as Sharing from "expo-sharing";

// --- ¡IMPORTANDO LAS FUNCIONES CENTRALES! ---
// (Ajusta la ruta a tu archivo exportUtils.js)
import { 
  cargarDatosFirebase,
  exportarColeccionJSON,
  exportarTodosLosDatosJSON,
  exportarTodoPDF,
  exportarDatosExcel // <-- ¡La nueva función de Excel!
} from '../utils/exportUtils'; // <-- AJUSTA ESTA RUTA


const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoId, setProductoId] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: "",
    stock: ""
  });
  
  // Lista de colecciones para exportar TODO
  const colecciones = ["productos", "usuarios", "ciudades"]; 

  const cargarDatos = async () => {
    try {
      // Usamos la función importada
      const resultado = await cargarDatosFirebase("productos"); 
      if (resultado && resultado.productos) {
        setProductos(resultado.productos);
      } else {
        // Fallback por si acaso
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
          stock: parseInt(nuevoProducto.stock, 10)
        });
        cargarDatos(); 
        setNuevoProducto({nombre: "", precio: "", stock: ""});
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
          stock: parseInt(nuevoProducto.stock, 10)
        });
        setNuevoProducto({nombre: "", precio: "", stock: ""});
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
      stock: (producto.stock || 0).toString()
    });
    setProductoId(producto.id);
    setModoEdicion(true)
  };
  
   useEffect(() => {
    cargarDatos();
  }, []);

  // --- FUNCIONES DE EXPORTACIÓN ESPECÍFICAS DE PRODUCTOS ---

  // PDF Específico de Productos (se queda aquí porque usa el state 'productos')
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
  
  // *** ¡NUEVA FUNCIÓN PARA EL BOTÓN EXCEL! ***
  const exportarProductosExcel = () => {
    // Llama a la función importada pasándole los datos del state
    exportarDatosExcel(productos, "reporte_productos.xlsx");
  };

  // --- FIN FUNCIONES DE EXPORTACIÓN ---


  return (
    <View style={styles.container}>
      <FormularioProductos
        nuevoProducto={nuevoProducto}
        manejoCambio={manejoCambio}
        guardarProducto={guardarProducto}
        actualizarProducto={actualizarProducto}
        modoEdicion={modoEdicion}
        cancelarEdicion={() => {
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
          {/* --- ¡NUEVO BOTÓN DE EXCEL! --- */}
           <Button 
            title="Exportar Productos (Excel)" 
            onPress={exportarProductosExcel} 
            color="#10B981" // Verde
          />
          <Button 
            title="Exportar Productos (PDF)" 
            onPress={exportarProductosPDF} 
            color="#ef4444" // Rojo
          />
           <Button 
            title="Exportar 'productos' (JSON)" 
            onPress={() => exportarColeccionJSON("productos")} 
            color="#3b82f6" // Azul
          />
          <Button 
            title="Exportar 'usuarios' (JSON)" 
            onPress={() => exportarColeccionJSON("usuarios")} 
            color="#1d4ed8"
          />
           <Button 
            title="Exportar 'ciudades' (JSON)" 
            onPress={() => exportarColeccionJSON("ciudades")} 
            color="#047857"
          />
          <Button 
            title="Exportar TODO (PDF)" 
            onPress={() => exportarTodoPDF(colecciones)} 
            color="#b91c1c" // Rojo Oscuro
          />
          <Button 
            title="Exportar TODO (JSON)" 
            onPress={() => exportarTodosLosDatosJSON(colecciones)} 
            color="#166534"
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