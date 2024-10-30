import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router"; // Importamos el hook useRouter para la navegación
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios"; // Importa axios para hacer las solicitudes HTTP

export function User() {
  const router = useRouter(); // Hook para manejar la navegación
  const [username, setUsername] = useState("");
  const [passwordChangeDate, setPasswordChangeDate] = useState(""); // Estado para la fecha de cambio de contraseña
  const [isModalVisible, setIsModalVisible] = useState(false); // Estado para el modal

  // Funciones de navegación para cada opción
  const goToMyData = () => router.push("/my_data_page");
  const goToStudyInstructions = () => router.push("/study_instructions");
  const goToTopicsOfInterest = () => router.push("/topics_of_interest");

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "No se encontró el token de autenticación.");
        return;
      }

      await axios.post(
        "http://10.0.2.2:8000/api/logout/",
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      await AsyncStorage.removeItem("username");
      await AsyncStorage.removeItem("token");

      router.replace("/");

      Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente.");
    } catch (error) {
      console.error("Error al cerrar sesión: ", error);
      Alert.alert("Error", "Hubo un problema al cerrar sesión.");
    }
  };

  // Efecto para obtener el username almacenado y la fecha de cambio de contraseña
  useEffect(() => {
    const fetchUserData = async () => {
      const storedUsername = await AsyncStorage.getItem("username");
      const token = await AsyncStorage.getItem("token");
      if (storedUsername) {
        setUsername(storedUsername);
      }

      if (token) {
        try {
          const response = await axios.get(
            "http://10.0.2.2:8000/api/user/", // Asegúrate de que esta URL devuelva la fecha de cambio de contraseña
            {
              headers: {
                Authorization: `Token ${token}`,
              },
            },
          ); // Depuración de los datos recibidos
          setUsername(response.data.username); // Actualización del username obtenido del backend
          setPasswordChangeDate(response.data.password_change_date); // Guarda la fecha de cambio de contraseña
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      }
    };

    fetchUserData();
  }, []);

  // Función para calcular los días restantes para cambiar la contraseña
  const calculateDaysUntilPasswordChange = () => {
    const currentDate = new Date();
    const passwordChangeDateObj = new Date(passwordChangeDate);
    const timeDiff = passwordChangeDateObj - currentDate;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysRemaining > 0
      ? `Te quedan ${daysRemaining} días para cambiar tu contraseña.`
      : "Tu contraseña ha expirado, debes cambiarla.";
  };

  // Función para mostrar el modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setIsModalVisible(false);
  };

  // Generar URL de avatar dinámicamente
  const avatarUrl = `https://ui-avatars.com/api/?name=${username}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        {/* Cabecera con imagen de perfil y nombre */}
        <View style={styles.profileContainer}>
          <View style={styles.profileImageWrapper}>
            <Image
              style={styles.profileImage}
              source={{ uri: avatarUrl }} // URL dinámica basada en el username
            />
            <Pressable style={styles.editIcon}>
              <Text style={styles.editIconText}>✏️</Text>
            </Pressable>
          </View>
          {/* Muestra el username dinámicamente */}
          <Text style={styles.userName}>{username}</Text>
        </View>

        {/* Opciones de configuración */}
        <View style={styles.optionContainer}>
          <Pressable style={styles.option} onPress={goToMyData}>
            <Text style={styles.optionText}>Mis datos</Text>
            <Text style={styles.optionArrow}>›</Text>
          </Pressable>

          <Pressable style={styles.option} onPress={goToStudyInstructions}>
            <Text style={styles.optionText}>
              Indicaciones para cargar estudios
            </Text>
            <Text style={styles.optionArrow}>›</Text>
          </Pressable>

          <Pressable style={styles.option} onPress={goToTopicsOfInterest}>
            <Text style={styles.optionText}>Temas de interés</Text>
            <Text style={styles.optionArrow}>›</Text>
          </Pressable>

          {/* Nueva opción para mostrar el tiempo para renovar la contraseña */}
          <Pressable style={styles.option} onPress={showModal}>
            <Text style={styles.optionText}>
              Tiempo para renovar contraseña
            </Text>
            <Text style={styles.optionArrow}>›</Text>
          </Pressable>
        </View>

        {/* Botón de Cerrar Sesión */}
        <View style={styles.logoutContainer}>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
          </Pressable>
        </View>

        {/* Modal para mostrar la fecha o tiempo restante para cambiar la contraseña */}
        <Modal visible={isModalVisible} transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Tiempo para cambiar la contraseña
              </Text>
              <Text>{calculateDaysUntilPasswordChange()}</Text>
              <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                <Text style={styles.modalButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  profileContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImageWrapper: {
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E0E0E0",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#000",
    borderRadius: 20,
    padding: 5,
  },
  editIconText: {
    color: "white",
    fontSize: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  optionContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  optionArrow: {
    fontSize: 18,
    color: "#999",
  },
  logoutContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  logoutButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: "#38A169",
    padding: 10,
    borderRadius: 8,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
