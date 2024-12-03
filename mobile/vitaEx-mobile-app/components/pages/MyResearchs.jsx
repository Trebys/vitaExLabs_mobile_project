import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  Modal,
  Button,
  Platform,
  ScrollView,
  Linking,
} from "react-native";
import { NavigationButtons } from "../NavigationButtons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EditIcon, ExportIcon, ResultsIcon, ViewFileIcon } from "../Icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import Papa from "papaparse";
import * as IntentLauncher from "expo-intent-launcher"; // Importamos IntentLauncher

export function MyResearchs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [researchData, setResearchData] = useState([]);
  const [authToken, setAuthToken] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedState, setEditedState] = useState("");

  // Estados para manejar los resultados
  const [isResultsModalVisible, setResultsModalVisible] = useState(false);
  const [parsedData, setParsedData] = useState(null);

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
      fetchResearchData();
    }
  }, [authToken]);

  const fetchResearchData = async () => {
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
      setResearchData(response.data);
    } catch (error) {
      console.error("Error fetching research data", error);
      Alert.alert("Error", "Hubo un problema al obtener los estudios.");
    }
  };

  const handleEdit = (study) => {
    setSelectedStudy(study);
    setEditedName(study.nombre_archivo);
    setEditedState(study.estado);
    setModalVisible(true);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(
        `http://10.0.2.2:8000/api/edit-study/${selectedStudy.id}/`,
        {
          nombre_archivo: editedName,
          estado: editedState,
        },
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        },
      );
      if (response.status === 200) {
        Alert.alert("Éxito", "Estudio actualizado correctamente");
        fetchResearchData();
        setModalVisible(false);
        resetModalFields();
      }
    } catch (error) {
      console.error("Error updating study", error);
      Alert.alert("Error", "No se pudo actualizar el estudio.");
    }
  };

  const resetModalFields = () => {
    setSelectedStudy(null);
    setEditedName("");
    setEditedState("");
  };

  function handleViewFile(filePath) {
    const fullPath = `http://10.0.2.2:8000/media/${filePath}`;
    Linking.openURL(fullPath).catch((err) => {
      console.error("Error opening file", err);
      Alert.alert("Error", "No se pudo abrir el archivo.");
    });
  }

  async function handleExport(item) {
    const fileUrl = `http://10.0.2.2:8000/media/${item.ruta}`;
    const fileName = item.nombre_archivo || "estudio.pdf";
    const localFileUri = `${FileSystem.documentDirectory}${fileName}`;

    try {
      // Descargar el archivo
      const downloadResult = await FileSystem.downloadAsync(
        fileUrl,
        localFileUri,
      );

      // Verificar si la función de compartir está disponible
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(
          "Error",
          "La función de compartir no está disponible en este dispositivo.",
        );
        return;
      }

      // Compartir el archivo
      await Sharing.shareAsync(downloadResult.uri, {
        mimeType: "application/pdf",
        dialogTitle: "Compartir Estudio",
      });
    } catch (error) {
      console.error("Error al descargar o compartir el archivo", error);
      Alert.alert("Error", "No se pudo descargar o compartir el archivo.");
    }
  }

  async function handleResults(resultados) {
    if (resultados.length === 0) {
      Alert.alert("No hay resultados", "Este estudio no tiene resultados aún.");
    } else {
      try {
        let hasParsedData = false;

        for (const result of resultados) {
          const fileExtension = result.nombre_archivo
            ? result.nombre_archivo.split(".").pop().split("?")[0]
            : result.ruta.split(".").pop().split("?")[0];

          if (
            fileExtension.toLowerCase() === "xlsx" ||
            fileExtension.toLowerCase() === "xls"
          ) {
            // Si es un archivo Excel, abrir con una aplicación externa
            await handleOpenResultFile(result);
          } else {
            // Procesar y mostrar los datos en el modal
            const data = await handleOpenResultFile(result, false);
            if (data) {
              setParsedData(data);
              hasParsedData = true;
              setResultsModalVisible(true);
            }
          }
        }

        if (!hasParsedData) {
          // Si no se pudo procesar ningún archivo para mostrar en el modal
          Alert.alert(
            "Resultados",
            "Los resultados se han abierto con aplicaciones externas.",
          );
        }
      } catch (error) {
        console.error("Error al procesar los resultados", error);
        Alert.alert("Error", "No se pudieron procesar los resultados.");
      }
    }
  }

  // Función para manejar la apertura de archivos de resultados
  async function handleOpenResultFile(result, openModal = true) {
    const fileUrl = `http://10.0.2.2:8000/media/${result.ruta}`;
    const fileName = result.nombre_archivo || "resultado";
    const fileExtension = result.nombre_archivo
      ? result.nombre_archivo.split(".").pop().split("?")[0]
      : result.ruta.split(".").pop().split("?")[0];
    const localFileUri = `${FileSystem.documentDirectory}${fileName}.${fileExtension}`;

    try {
      // Descargar el archivo
      const downloadResult = await FileSystem.downloadAsync(
        fileUrl,
        localFileUri,
      );

      console.log("URL del archivo:", fileUrl);
      console.log("Nombre del archivo:", fileName);
      console.log("Extensión del archivo:", fileExtension);
      console.log("Archivo descargado en:", downloadResult.uri);

      if (fileExtension.toLowerCase() === "csv") {
        const fileContent = await FileSystem.readAsStringAsync(
          downloadResult.uri,
        );

        console.log("Contenido del archivo CSV:", fileContent);

        // Parsear el contenido CSV con papaparse
        const results = Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
        });

        console.log("Resultados del parseo CSV:", results);

        if (results.errors.length) {
          console.error("Errores al parsear el CSV:", results.errors);
          Alert.alert("Error", "No se pudo leer el archivo CSV correctamente.");
          return null;
        }

        if (results.data.length === 0) {
          Alert.alert("Error", "El archivo CSV está vacío.");
          return null;
        }

        if (openModal) {
          setParsedData(results.data);
          setResultsModalVisible(true);
        }

        return results.data;
      } else if (fileExtension.toLowerCase() === "txt") {
        const fileContent = await FileSystem.readAsStringAsync(
          downloadResult.uri,
        );

        console.log("Contenido del archivo TXT:", fileContent);

        const data = [{ contenido: fileContent }];

        if (openModal) {
          setParsedData(data);
          setResultsModalVisible(true);
        }

        return data;
      } else if (
        fileExtension.toLowerCase() === "xlsx" ||
        fileExtension.toLowerCase() === "xls"
      ) {
        // Abrir archivos Excel con una aplicación externa
        if (Platform.OS === "android") {
          const cUri = await FileSystem.getContentUriAsync(downloadResult.uri);
          console.log("Content URI:", cUri);

          IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
            data: cUri,
            flags: 1,
            type: getMimeType(fileExtension),
          });
        } else if (Platform.OS === "ios") {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: getMimeType(fileExtension),
            dialogTitle: "Abrir Resultado",
            UTI: getMimeType(fileExtension),
          });
        } else {
          Alert.alert(
            "Plataforma no soportada",
            "La apertura de archivos no está soportada en esta plataforma.",
          );
        }

        return null;
      } else {
        Alert.alert(
          "Archivo no soportado",
          "No se puede mostrar este tipo de archivo.",
        );
        return null;
      }
    } catch (error) {
      console.error("Error al manejar el archivo de resultado", error);
      Alert.alert("Error", "No se pudo manejar el archivo de resultado.");
      return null;
    }
  }

  // Función para obtener el tipo MIME basado en la extensión
  function getMimeType(extension) {
    switch (extension.toLowerCase()) {
      case "csv":
        return "text/csv";
      case "xlsx":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      case "xls":
        return "application/vnd.ms-excel";
      case "pdf":
        return "application/pdf";
      case "txt":
        return "text/plain";
      case "json":
        return "application/json";
      default:
        return "*/*";
    }
  }

  return (
    <View style={styles.container}>
      <NavigationButtons activePage="my_researchs" />

      <Text style={styles.title}>Mis estudios</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="Buscar estudios..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={researchData.filter((item) =>
          item.nombre_archivo.toLowerCase().includes(searchQuery.toLowerCase()),
        )}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.studyItem}>
            <Text style={styles.studyTitle}>{item.nombre_archivo}</Text>
            <Text style={styles.studySubtitle}>
              Subido el: {new Date(item.fecha_subida).toLocaleDateString()}
            </Text>

            <View style={styles.buttonContainer}>
              <Pressable
                style={styles.iconButton}
                onPress={() => handleViewFile(item.ruta)}
              >
                <ViewFileIcon size={24} />
              </Pressable>

              <Pressable
                style={styles.iconButton}
                onPress={() => handleEdit(item)}
              >
                <EditIcon size={24} />
              </Pressable>

              <Pressable
                style={styles.iconButton}
                onPress={() => handleExport(item)}
              >
                <ExportIcon size={24} />
              </Pressable>

              <Pressable
                style={styles.iconButton}
                onPress={() => handleResults(item.resultados)}
              >
                <ResultsIcon size={24} />
              </Pressable>
            </View>

            {/* Resultados debajo de los botones */}
            {item.resultados && item.resultados.length > 0 ? (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Resultados:</Text>
                {item.resultados.map((resultado) => (
                  <Text key={resultado.id} style={styles.resultItem}>
                    {resultado.tipo_analisis}: {resultado.ruta}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={styles.noResultsText}>Sin resultados</Text>
            )}
          </View>
        )}
      />

      {/* Modal de edición */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          resetModalFields();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Estudio</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre del Archivo"
              value={editedName}
              onChangeText={setEditedName}
            />

            <TextInput
              style={styles.input}
              placeholder="Estado"
              value={editedState}
              onChangeText={setEditedState}
            />

            <Button title="Guardar Cambios" onPress={handleSaveEdit} />
            <Button
              title="Cancelar"
              onPress={() => {
                setModalVisible(false);
                resetModalFields();
              }}
              color="red"
            />
          </View>
        </View>
      </Modal>

      {/* Modal de resultados */}
      <Modal
        visible={isResultsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setResultsModalVisible(false);
          setParsedData(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContentLarge}>
            <Text style={styles.modalTitle}>Resultados</Text>

            {parsedData ? (
              <ScrollView style={styles.scrollView}>
                {parsedData.map((record, index) => (
                  <View key={index} style={styles.recordContainer}>
                    {Object.entries(record).map(([key, value]) => (
                      <Text key={key} style={styles.recordText}>
                        <Text style={styles.recordKey}>{key}:</Text> {value}
                      </Text>
                    ))}
                    <View style={styles.separator} />
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.noResultsText}>
                No hay datos para mostrar.
              </Text>
            )}

            <Pressable
              style={styles.closeButton}
              onPress={() => {
                setResultsModalVisible(false);
                setParsedData(null);
              }}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (tus estilos existentes)
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  searchBar: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
  },
  studyItem: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 16,
  },
  studyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  studySubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  resultsContainer: {
    marginTop: 8,
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 5,
  },
  resultsTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  resultItem: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
  },
  noResultsText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: "100%",
  },
  modalContentLarge: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    height: "80%",
    justifyContent: "center",
  },
  scrollView: {
    marginVertical: 10,
  },
  recordContainer: {
    marginBottom: 10,
  },
  recordText: {
    fontSize: 14,
    color: "#333",
  },
  recordKey: {
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 5,
  },
  closeButton: {
    backgroundColor: "#009007",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
