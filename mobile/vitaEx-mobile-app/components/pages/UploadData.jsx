import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Usa los iconos personalizados que tienes definidos
import { FileUploadIcon, CsvIcon, ExcelIcon, PdfIcon } from "../Icons";
import { NavigationButtons } from "../NavigationButtons";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function UploadData() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [estudioId, setEstudioId] = useState("");
  const [tipoAnalisis, setTipoAnalisis] = useState("");
  const [isPdf, setIsPdf] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        setAuthToken(token);
      }
    };
    fetchToken();
  }, []);

  const handleFilePicker = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/comma-separated-values",
      ],
    });

    if (!result.canceled) {
      setSelectedFile(result.assets[0]);
      setIsPdf(result.assets[0].mimeType === "application/pdf");
      setModalVisible(true);
    } else {
      Alert.alert("Error", "No se seleccionó ningún archivo");
    }
  };

  const handleSaveFile = async () => {
    if (!selectedFile || (!isPdf && (!estudioId || !tipoAnalisis))) {
      Alert.alert(
        "Error",
        "Debe proporcionar el archivo, estudio ID y tipo de análisis",
      );
      return;
    }

    const formData = new FormData();
    formData.append("archivo", {
      uri: selectedFile.uri,
      name: selectedFile.name,
      type: selectedFile.mimeType || "text/csv",
    });

    if (isPdf) {
      formData.append("nombre_archivo", selectedFile.name);
      formData.append("estado", "activo");
    } else {
      formData.append("estudio_id", estudioId);
      formData.append("tipo_analisis", tipoAnalisis);
    }

    const uploadUrl = isPdf
      ? "http://10.0.2.2:8000/api/upload-pdf/"
      : "http://10.0.2.2:8000/api/upload-result-file/";

    try {
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Token ${authToken}`,
        },
      });

      if (response.status === 201) {
        Alert.alert("Éxito", "Archivo subido correctamente");
      } else {
        Alert.alert("Error", "Hubo un problema al subir el archivo");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        // Mostrar el mensaje de error específico que proviene del backend
        Alert.alert("Error", error.response.data.error);
      } else {
        Alert.alert("Error", "Hubo un problema al subir el archivo");
      }
    }

    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Carga y visualización de mis datos</Text>
      <NavigationButtons activePage="upload_data" />

      <View style={styles.uploadSection}>
        <Text style={styles.uploadText}>Upload file</Text>
        <Pressable style={styles.uploadButton} onPress={handleFilePicker}>
          <View style={styles.iconContainer}>
            <FileUploadIcon style={styles.fileUploadIcon} />
          </View>
          <Text style={styles.uploadPlaceholder}>
            {selectedFile ? selectedFile.name : "Click to upload"}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Estudios en formato</Text>
      <View style={styles.fileOptions}>
        <View style={styles.fileType}>
          <PdfIcon style={styles.fileIcon} />
          <Text style={styles.fileText}>PDF</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Resultados del estudio</Text>
      <View style={styles.fileOptions}>
        <View style={styles.fileType}>
          <CsvIcon style={styles.fileIcon} />
          <Text style={styles.fileText}>CSV File</Text>
        </View>
        <Text style={styles.orText}>or</Text>
        <View style={styles.fileType}>
          <ExcelIcon style={styles.fileIcon} />
          <Text style={styles.fileText}>Excel File</Text>
        </View>
      </View>

      <Pressable style={styles.saveButton} onPress={handleSaveFile}>
        <Text style={styles.saveButtonText}>Guardar</Text>
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Datos del Estudio</Text>
            {!isPdf && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="ID del Estudio"
                  value={estudioId}
                  onChangeText={setEstudioId}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Tipo de Análisis"
                  value={tipoAnalisis}
                  onChangeText={setTipoAnalisis}
                />
              </>
            )}
            <Pressable style={styles.saveButton} onPress={handleSaveFile}>
              <Text style={styles.saveButtonText}>Subir Archivo</Text>
            </Pressable>
            <Pressable
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
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
    textAlign: "center",
    marginBottom: 20,
  },
  uploadSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  uploadButton: {
    alignItems: "center",
  },
  fileUploadIcon: {
    fontSize: 40, // Ajusta el tamaño del ícono de subida
  },
  iconContainer: {
    alignItems: "center",
  },
  uploadPlaceholder: {
    marginTop: 10,
    color: "#999",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  fileOptions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  fileType: {
    alignItems: "center",
    marginHorizontal: 20,
  },
  fileIcon: {
    fontSize: 60, // Ajusta el tamaño de los íconos de archivo
  },
  fileText: {
    marginTop: 10,
    color: "#333",
    fontWeight: "bold",
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 16,
    color: "#999",
  },
  saveButton: {
    backgroundColor: "#38A169",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#E53E3E",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
