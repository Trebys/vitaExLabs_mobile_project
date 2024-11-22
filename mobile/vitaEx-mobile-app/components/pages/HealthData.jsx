import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";

export function HealthData() {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchHealthData = async () => {
    try {
      const response = await axios.get(
        "http://10.0.2.2:8000/api/ministerio_salud/obtencion_datos/",
      );
      setHealthData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener los datos de salud", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const openModal = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setModalVisible(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#38A169" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {healthData.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => openModal(item)}
          >
            <Text style={styles.cardTitle}>{item.enfermedad}</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>Tasa de Incidencia:</Text>
              <Text style={styles.cardValue}>{item.tasa_incidente} %</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>Factores de Riesgo:</Text>
              <Text
                style={styles.cardValue}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.factores_riesgo}
              </Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>Región:</Text>
              <Text style={styles.cardValue}>{item.region}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>Año:</Text>
              <Text style={styles.cardValue}>{item.año}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedItem && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedItem.enfermedad}</Text>
              <View style={styles.modalContent}>
                <Text style={styles.cardLabel}>Tasa de Incidencia:</Text>
                <Text style={styles.cardValue}>
                  {selectedItem.tasa_incidente} %
                </Text>
              </View>
              <View style={styles.modalContent}>
                <Text style={styles.cardLabel}>Factores de Riesgo:</Text>
                <Text style={styles.cardValue}>
                  {selectedItem.factores_riesgo}
                </Text>
              </View>
              <View style={styles.modalContent}>
                <Text style={styles.cardLabel}>Región:</Text>
                <Text style={styles.cardValue}>{selectedItem.region}</Text>
              </View>
              <View style={styles.modalContent}>
                <Text style={styles.cardLabel}>Año:</Text>
                <Text style={styles.cardValue}>{selectedItem.año}</Text>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F3F4F6",
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 8,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A5568",
  },
  cardValue: {
    fontSize: 16,
    color: "#2D3748",
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    alignSelf: "flex-end",
    backgroundColor: "#38A169",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    lineHeight: 18,
    textAlign: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 10,
    textAlign: "center",
  },
  modalContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 8,
  },
});

export default HealthData;
