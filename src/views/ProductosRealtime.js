import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { ref, set, push, onValue } from "firebase/database";
import { realtimeDB } from "../../firebaseconfig";

const ProductosRealtime = () => {
  // Estados para el formulario y la lista
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [productosRT, setProductosRT] = useState([]);

  // Método para guardar datos
  const guardarEnRT = async () => {
    if (!nombre || !precio) {
      Alert.alert("Error", "Rellena ambos campos");
      return;
    }
    try {
      const referencia = ref(realtimeDB, "productos_rt");
      const nuevoRef = push(referencia); // crea ID automático
      await set(nuevoRef, {
        nombre: nombre,
        precio: Number(precio),
      });
      setNombre("");
      setPrecio("");
      Alert.alert("Éxito", "Producto guardado en Realtime");
    } catch (error) {
      console.log("Error al guardar:", error);
    }
  };

  // Método para leer datos
  const leerRT = () => {
    const referencia = ref(realtimeDB, "productos_rt");
    onValue(referencia, (snapshot) => {
      if (snapshot.exists()) {
        const dataObj = snapshot.val(); // snapshot.val() devuelve objeto {id: {data}}
        // convertir ese objeto en un array limpio
        const lista = Object.entries(dataObj).map(([id, datos]) => ({
          id,
          ...datos,
        }));
        setProductosRT(lista);
      } else {
        setProductosRT([]);
      }
    });
  };

  // Cargar datos al iniciar la vista
  useEffect(() => {
    leerRT(); // Se conecta a los cambios en tiempo real
  }, []);

  // Renderizado del componente
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Prueba Realtime Database</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre producto"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Precio"
        keyboardType="numeric"
        value={precio}
        onChangeText={setPrecio}
      />
      <Button title="Guardar en Realtime" onPress={guardarEnRT} />

      <Text style={styles.subtitulo}>Productos en RT:</Text>
      {productosRT.length === 0 ? (
        <Text>No hay productos</Text>
      ) : (
        productosRT.map((p) => (
          <Text key={p.id}>
            • {p.nombre} - ${p.precio}
          </Text>
        ))
      )}
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 50 },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  subtitulo: { fontSize: 18, marginTop: 20, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default ProductosRealtime;