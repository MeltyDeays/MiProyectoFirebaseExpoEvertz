import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList } from 'react-native';
import { realtimeDB } from '../../firebaseconfig'; // Usar realtimeDB
import { ref, set, push, onValue } from 'firebase/database'; // Importar funciones de Realtime DB

// Función para clasificar el IMC
const getIMCClassification = (imc) => {
  if (imc < 18.5) return 'Bajo peso';
  if (imc >= 18.5 && imc <= 24.9) return 'Peso normal';
  if (imc >= 25 && imc <= 29.9) return 'Sobrepeso';
  if (imc >= 30) return 'Obesidad';
  return 'N/A';
};

const IMC = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [imcResult, setImcResult] = useState(null); // { value: '22.5', classification: 'Peso normal' }
  const [records, setRecords] = useState([]);

  const calculateIMC = async () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);

    if (!w || !h || w <= 0 || h <= 0) {
      Alert.alert('Error', 'Por favor, ingrese un peso y altura válidos.');
      return;
    }

    const imcValue = w / (h * h);
    const classification = getIMCClassification(imcValue);
    const result = {
      value: imcValue.toFixed(2),
      classification: classification,
    };
    setImcResult(result);

    try {
      const recordsRef = ref(realtimeDB, 'imc_records');
      const newRecordRef = push(recordsRef);
      await set(newRecordRef, {
        weight: w,
        height: h,
        imc: result.value,
        classification: result.classification,
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Éxito', `Su IMC es ${result.value} (${result.classification}). El registro ha sido guardado.`);
      setWeight('');
      setHeight('');
    } catch (error) {
      console.error("Error guardando el registro de IMC: ", error);
      Alert.alert('Error', 'No se pudo guardar el registro.');
    }
  };

  useEffect(() => {
    const recordsRef = ref(realtimeDB, 'imc_records');
    const unsubscribe = onValue(recordsRef, (snapshot) => {
      if (snapshot.exists()) {
        const dataObj = snapshot.val();
        const recordsList = Object.keys(dataObj).map(key => ({
          id: key,
          ...dataObj[key]
        })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecords(recordsList);
      } else {
        setRecords([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.recordItem}>
      <Text>Fecha: {new Date(item.createdAt).toLocaleString()}</Text>
      <Text>Peso: {item.weight} kg, Altura: {item.height} m</Text>
      <Text style={styles.recordImc}>IMC: {item.imc} ({item.classification})</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calculadora de IMC</Text>
      <TextInput
        style={styles.input}
        placeholder="Peso (kg)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Altura (m)"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
      />
      <Button title="Calcular y Guardar IMC" onPress={calculateIMC} />

      {imcResult && (
        <Text style={styles.result}>
          Último IMC: {imcResult.value} - {imcResult.classification}
        </Text>
      )}

      <Text style={styles.historyTitle}>Historial de Cálculos</Text>
      <FlatList
        data={records}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  result: {
    marginTop: 20,
    padding: 10,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#3b82f6',
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 20,
  },
  list: {
    flex: 1,
  },
  recordItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  recordImc: {
    fontWeight: 'bold',
    marginTop: 5,
    fontSize: 16,
  }
});

export default IMC;