// Archivo: src/utils/exportUtils.js

import { Alert } from 'react-native';
import { db } from '../../firebaseconfig'; // Ajusta esta ruta si es necesario
import { collection, getDocs } from 'firebase/firestore';
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import * as Print from 'expo-print';

// --- FUNCIONES DE CARGA DE DATOS ---

export const cargarDatosFirebase = async (nombreColeccion) => {
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

export const cargarTODOSDatosFirebase = async (colecciones) => {
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

// --- EXPORTACIÓN JSON ---

export const exportarColeccionJSON = async (nombreColeccion) => {
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

export const exportarTodosLosDatosJSON = async (colecciones) => {
  try {
    const datos = await cargarTODOSDatosFirebase(colecciones);
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

// --- EXPORTACIÓN PDF (SÓLO EL COMPLETO) ---

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

export const exportarTodoPDF = async (colecciones) => {
  const datos = await cargarTODOSDatosFirebase(colecciones);
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


// --- ¡NUEVAS FUNCIONES DE EXCEL! ---

const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

export const exportarDatosExcel = async (datos, nombreArchivo) => {
  if (!datos || datos.length === 0) {
     Alert.alert("Sin datos", "No hay datos para exportar a Excel.");
     return;
  }
  
  try {
      // *** ¡AQUÍ ESTÁ TU URL! ***
      const response = await fetch("https://m93lnwukg4.execute-api.us-east-2.amazonaws.com/generarexcel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ datos: datos })
      });

      if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      const fileUri = FileSystem.documentDirectory + (nombreArchivo || "reporte.xlsx");

      await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64
      });

      if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
              mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              dialogTitle: 'Descargar Reporte Excel'
          });
      } else {
          Alert.alert("Compartir no disponible.");
      }
  } catch (error) {
      console.error("Error generando Excel:", error);
      Alert.alert("Error al generar Excel", error.message);
  }
};