import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function Charts() {
  const [studies, setStudies] = useState([]);
  const [selectedStudy1, setSelectedStudy1] = useState(null);
  const [selectedResult1, setSelectedResult1] = useState(null);
  const [selectedStudy2, setSelectedStudy2] = useState(null);
  const [selectedResult2, setSelectedResult2] = useState(null);
  const [chartData1, setChartData1] = useState(null);
  const [chartData2, setChartData2] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        setAuthToken(token);
      }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (authToken) {
      fetchStudiesData();
    }
  }, [authToken]);

  const fetchStudiesData = async () => {
    if (!authToken) return;
    try {
      const response = await axios.get(
        "http://10.0.2.2:8000/api/get-studies-with-results/",
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        },
      );
      setStudies(response.data);
    } catch (error) {
      console.error("Error fetching studies data", error);
      Alert.alert("Error", "Hubo un problema al obtener los estudios.");
    }
  };

  const handleStudySelect = (
    study,
    setStudy,
    setSelectedResult,
    setChartData,
  ) => {
    setStudy(study);
    setSelectedResult(null);
    setChartData(null);
  };

  const handleResultSelect = (result, setSelectedResult, setChartData) => {
    setSelectedResult(result);
    setChartData(result?.visualizaciones || []);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Análisis de resultados</Text>

        {/* Selectores de estudios y resultados para el primer gráfico */}
        <View style={styles.inputContainer}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedStudy1}
              style={styles.picker}
              onValueChange={(study) =>
                handleStudySelect(
                  study,
                  setSelectedStudy1,
                  setSelectedResult1,
                  setChartData1,
                )
              }
            >
              <Picker.Item label="Seleccione un estudio" value={null} />
              {studies.map((study) => (
                <Picker.Item
                  key={study.id}
                  label={study.nombre_archivo}
                  value={study}
                />
              ))}
            </Picker>
          </View>

          {selectedStudy1 && (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedResult1}
                style={styles.picker}
                onValueChange={(result) =>
                  handleResultSelect(result, setSelectedResult1, setChartData1)
                }
              >
                <Picker.Item
                  label="Seleccione un archivo de resultados"
                  value={null}
                />
                {selectedStudy1.resultados.map((result) => (
                  <Picker.Item
                    key={result.id}
                    label={result.tipo_analisis}
                    value={result}
                  />
                ))}
              </Picker>
            </View>
          )}
        </View>

        {/* Gráfico y Análisis del Estudio 1 */}
        {chartData1 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>
              {selectedResult1 ? selectedResult1.tipo_analisis : "Gráfico 1"}
            </Text>
            {chartData1.map((visual) => (
              <Image
                key={visual.configuracion.path}
                source={{
                  uri: `http://10.0.2.2:8000/media/${visual.configuracion.path}`,
                }}
                style={styles.chartImage}
              />
            ))}
          </View>
        )}

        {/* Selectores de estudios y resultados para el segundo gráfico */}
        <View style={styles.inputContainer}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedStudy2}
              style={styles.picker}
              onValueChange={(study) =>
                handleStudySelect(
                  study,
                  setSelectedStudy2,
                  setSelectedResult2,
                  setChartData2,
                )
              }
            >
              <Picker.Item label="Seleccione un estudio" value={null} />
              {studies.map((study) => (
                <Picker.Item
                  key={study.id}
                  label={study.nombre_archivo}
                  value={study}
                />
              ))}
            </Picker>
          </View>

          {selectedStudy2 && (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedResult2}
                style={styles.picker}
                onValueChange={(result) =>
                  handleResultSelect(result, setSelectedResult2, setChartData2)
                }
              >
                <Picker.Item
                  label="Seleccione un archivo de resultados"
                  value={null}
                />
                {selectedStudy2.resultados.map((result) => (
                  <Picker.Item
                    key={result.id}
                    label={result.tipo_analisis}
                    value={result}
                  />
                ))}
              </Picker>
            </View>
          )}
        </View>

        {/* Gráfico y Análisis del Estudio 2 */}
        {chartData2 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>
              {selectedResult2 ? selectedResult2.tipo_analisis : "Gráfico 2"}
            </Text>
            {chartData2.map((visual) => (
              <Image
                key={visual.configuracion.path}
                source={{
                  uri: `http://10.0.2.2:8000/media/${visual.configuracion.path}`,
                }}
                style={styles.chartImage}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { padding: 16, backgroundColor: "#fff" },
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
  picker: { height: 50, color: "black" },
  chartContainer: {
    marginBottom: 32, // Espaciado entre gráficos
    padding: 10, // Añadir algo de espacio interno
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  chartTitle: {
    fontSize: 18, // Aumentar el tamaño de la fuente del título
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  chartImage: {
    height: 400, // Aumentar la altura de las imágenes
    resizeMode: "contain",
    marginBottom: 20, // Separar la imagen del siguiente elemento
    alignSelf: "center", // Centrar las imágenes
    width: "100%", // Ajustar la anchura al 100% del contenedor
  },
});

export default Charts;
