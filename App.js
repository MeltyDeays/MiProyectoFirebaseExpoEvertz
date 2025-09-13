import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Button } from "react-native";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

export default function App() {
  const [comidas, setComidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComidas = async () => {
    console.log("🔄 Iniciando fetch de Comidas...");
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, "Comidas")); // ⚠️ Con C mayúscula
      console.log(`📊 Número de docs encontrados: ${querySnapshot.size}`);
      const comidasData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log("🍽️ Comidas cargadas:", JSON.stringify(comidasData, null, 2));
      setComidas(comidasData);
    } catch (err) {
      console.error("❌ Error detallado:", err.code, err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComidas();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando comidas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error}</Text>
        <Button title="Reintentar Fetch" onPress={fetchComidas} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Lista de Comidas ({comidas.length})</Text>
      <Button title="Recargar Datos" onPress={fetchComidas} />
      <FlatList
        data={comidas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.nombre}>{item["Nombre de comidas"] || "Sin nombre"}</Text>
            <Text style={styles.precio}>Precio: {item.Precio || "N/A"}</Text>
            <Text style={styles.rating}>Rating: {item.Rating || "N/A"}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No hay comidas. Verifica Firebase y logs.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", justifyContent: "center" },
  titulo: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  item: { backgroundColor: "#f0f0f0", padding: 15, marginVertical: 8, borderRadius: 10 },
  nombre: { fontSize: 18, fontWeight: "bold", color: "#333" },
  precio: { fontSize: 16, color: "#28a745", marginTop: 5 },
  rating: { fontSize: 16, color: "#ffc107", marginTop: 5 },
  empty: { textAlign: "center", color: "gray", fontSize: 16 },
  error: { color: "red", textAlign: "center", fontSize: 16 },
});
