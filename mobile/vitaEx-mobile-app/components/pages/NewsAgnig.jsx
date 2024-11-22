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

export function NewsAging() {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);

  // Función para obtener las noticias desde la API
  const fetchNewsData = async () => {
    try {
      const response = await axios.get(
        "http://10.0.2.2:8000/api/noticiero_x/obtener_noticias/",
      );
      setNewsData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener las noticias", error);
      setLoading(false);
    }
  };

  // Llama a la función cuando el componente se monta
  useEffect(() => {
    fetchNewsData();
  }, []);

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
        {newsData.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => setSelectedNews(item)}
          >
            <Text style={styles.cardTitle}>{item.titulo}</Text>
            <Text style={styles.cardContent}>
              {item.contenido.slice(0, 80)}...
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.footerLabel}>Categoría: </Text>
              <Text style={styles.footerValue}>{item.categoria}</Text>
              <Text style={styles.footerLabel}>Fecha de Publicación: </Text>
              <Text style={styles.footerValue}>{item.fecha_publicacion}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal para mostrar la noticia completa */}
      {selectedNews && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedNews(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedNews(null)}
              >
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedNews.titulo}</Text>
              <Text style={styles.modalContentText}>
                {selectedNews.contenido}
              </Text>
              <View style={styles.modalFooter}>
                <Text style={styles.footerLabel}>Categoría: </Text>
                <Text style={styles.footerValue}>{selectedNews.categoria}</Text>
                <Text style={styles.footerLabel}>Fecha de Publicación: </Text>
                <Text style={styles.footerValue}>
                  {selectedNews.fecha_publicacion}
                </Text>
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 16,
    color: "#4A5568",
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "column",
    marginTop: 10,
  },
  footerLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4A5568",
  },
  footerValue: {
    fontSize: 14,
    color: "#2D3748",
    marginBottom: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "85%",
    position: "relative",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 8,
    textAlign: "center",
    marginTop: 20,
  },
  modalContentText: {
    fontSize: 16,
    color: "#2D3748",
    lineHeight: 24,
    marginBottom: 20,
  },
  modalFooter: {
    marginTop: 10,
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
});

export default NewsAging;
