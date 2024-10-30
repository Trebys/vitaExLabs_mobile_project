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
} from "react-native";
import { NavigationButtons } from "../NavigationButtons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EditIcon, ExportIcon, ResultsIcon, ViewFileIcon } from "../Icons";
import { Linking } from "react-native";

export function MyResearchs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [researchData, setResearchData] = useState([]);
  const [authToken, setAuthToken] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState(null); // Estudio seleccionado para editar
  const [editedName, setEditedName] = useState("");
  const [editedState, setEditedState] = useState("");

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
    setModalVisible(true); // Mostrar el modal
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(
        `http://10.0.2.2:8000/api/edit-study/${selectedStudy.id}/`,
        {
          nombre_archivo: editedName,
          estado: editedState, // Aquí solo enviamos el nombre y estado
        },
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        },
      );
      if (response.status === 200) {
        Alert.alert("Éxito", "Estudio actualizado correctamente");
        fetchResearchData(); // Actualizar la lista
        setModalVisible(false); // Cerrar el modal
        resetModalFields(); // Limpiar campos
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
                onPress={() => handleExport(item.id)}
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
          resetModalFields(); // Limpiar campos al cerrar
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
                resetModalFields(); // Limpiar campos al cancelar
              }}
              color="red"
            />
          </View>
        </View>
      </Modal>
    </View>
  );

  function handleViewFile(filePath) {
    const fullPath = `http://10.0.2.2:8000/media/${filePath}`;
    Linking.openURL(fullPath).catch((err) => {
      console.error("Error opening PDF", err);
      Alert.alert("Error", "No se pudo abrir el archivo PDF.");
    });
  }

  function handleExport(estudioId) {
    console.log("Exportar estudio", estudioId);
  }

  function handleResults(resultados) {
    if (resultados.length === 0) {
      Alert.alert("No hay resultados", "Este estudio no tiene resultados aún.");
    } else {
      console.log("Resultados del estudio", resultados);
    }
  }
}

const styles = StyleSheet.create({
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
});
