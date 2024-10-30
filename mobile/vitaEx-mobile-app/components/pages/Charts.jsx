import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckIcon } from "../Icons"; // Usamos los íconos personalizados
import { Picker } from "@react-native-picker/picker";

export function Charts() {
  const [selectedStudy1, setSelectedStudy1] = useState("Estudio 1");
  const [selectedStudy2, setSelectedStudy2] = useState("Estudio 2");

  return (
    <SafeAreaView style={styles.container}>
      {/* Envuelve todo el contenido en ScrollView para permitir desplazamiento */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Análisis de resultados</Text>

        {/* Inputs de selección de estudios con Picker */}
        <View style={styles.inputContainer}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedStudy1}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedStudy1(itemValue)}
            >
              <Picker.Item label="Estudio 1" value="Estudio 1" />
              <Picker.Item label="Estudio A" value="Estudio A" />
              <Picker.Item label="Estudio B" value="Estudio B" />
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedStudy2}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedStudy2(itemValue)}
            >
              <Picker.Item label="Estudio 2" value="Estudio 2" />
              <Picker.Item label="Estudio C" value="Estudio C" />
              <Picker.Item label="Estudio D" value="Estudio D" />
            </Picker>
          </View>
        </View>

        {/* Botones de filtro */}
        <View style={styles.actionContainer}>
          <Pressable style={styles.filterButton}>
            <CheckIcon size={20} color="green" />
            <Text style={styles.actionText}>Filtrar</Text>
          </Pressable>
        </View>

        {/* Gráfico 1 */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{selectedStudy1}</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.placeholderText}>Gráfico Placeholder</Text>
          </View>
        </View>

        {/* Gráfico 2 */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{selectedStudy2}</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.placeholderText}>Gráfico Placeholder</Text>
          </View>
        </View>

        {/* Botón de análisis */}
        <Pressable style={styles.analyzeButton}>
          <Text style={styles.analyzeButtonText}>Analizar</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    marginHorizontal: 8,
  },
  picker: {
    height: 50,
    color: "black",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 8,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 16,
  },
  chartContainer: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#666",
    fontSize: 14,
  },
  analyzeButton: {
    backgroundColor: "#38A169",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  analyzeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
