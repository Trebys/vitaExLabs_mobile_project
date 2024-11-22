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
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import xml2js from "react-native-xml2js";

export function User() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [passwordChangeDate, setPasswordChangeDate] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

  const [exchangeRate, setExchangeRate] = useState(null);

  const goToMyData = () => router.push("/my_data_page");
  const goToStudyInstructions = () => router.push("/study_instructions");
  const goToTopicsOfInterest = () => router.push("/topics_of_interest");
  const goToPremiumUserPlan = () => router.push("/premium_user_plan_page");
  const goToMinistryOfHealthData = () =>
    router.push("/ministry_of_health_data_page");
  const goToNewsAging = () => router.push("/news_aging_page");

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
          headers: { Authorization: `Token ${token}` },
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

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUsername = await AsyncStorage.getItem("username");

      const token = await AsyncStorage.getItem("token");

      if (storedUsername) setUsername(storedUsername);

      if (token) {
        try {
          const response = await axios.get("http://10.0.2.2:8000/api/user/", {
            headers: { Authorization: `Token ${token}` },
          });

          // Set nombre from response and save it to AsyncStorage
          const fetchedNombre = response.data.first_name;
          setUsername(fetchedNombre);

          // Guardar el nombre en AsyncStorage
          await AsyncStorage.setItem("nombre", fetchedNombre);
          setUsername(response.data.username);
          setPasswordChangeDate(response.data.password_change_date);
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      }
    };

    fetchUserData();
  }, []);

  const calculateDaysUntilPasswordChange = () => {
    const currentDate = new Date();
    const passwordChangeDateObj = new Date(passwordChangeDate);
    const timeDiff = passwordChangeDateObj - currentDate;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysRemaining > 0
      ? `Te quedan ${daysRemaining} días para cambiar tu contraseña.`
      : "Tu contraseña ha expirado, debes cambiarla.";
  };

  const showPasswordModal = () => {
    setIsPasswordModalVisible(true);
  };
  const closePasswordModal = () => {
    setIsPasswordModalVisible(false);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const fetchExchangeRate = async () => {
    try {
      const responseCompra = await axios.get(
        "https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx/ObtenerIndicadoresEconomicosXML",
        {
          params: {
            Indicador: 317,
            FechaInicio: "10/11/2024",
            FechaFinal: "10/11/2024",
            Nombre: "Esteban",
            SubNiveles: "N",
            CorreoElectronico: "estelopez2014@gmail.com",
            Token: "E31E1L2ST1",
          },
          headers: { "Content-Type": "application/xml" },
        },
      );

      const decodedXmlCompra = responseCompra.data
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");

      const parser = new xml2js.Parser();
      parser.parseString(decodedXmlCompra, (err, resultCompra) => {
        if (err) {
          console.error("Error parsing XML:", err);
          Alert.alert(
            "Error",
            "Hubo un problema al procesar el tipo de cambio.",
          );
          return;
        }

        const compra = parseFloat(
          resultCompra?.string?.Datos_de_INGC011_CAT_INDICADORECONOMIC?.[0]
            ?.INGC011_CAT_INDICADORECONOMIC?.[0]?.NUM_VALOR?.[0],
        ).toFixed(2);

        if (compra) {
          axios
            .get(
              "https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx/ObtenerIndicadoresEconomicosXML",
              {
                params: {
                  Indicador: 318,
                  FechaInicio: "10/11/2024",
                  FechaFinal: "10/11/2024",
                  Nombre: "Esteban",
                  SubNiveles: "N",
                  CorreoElectronico: "estelopez2014@gmail.com",
                  Token: "E31E1L2ST1",
                },
                headers: { "Content-Type": "application/xml" },
              },
            )
            .then((responseVenta) => {
              const decodedXmlVenta = responseVenta.data
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&amp;/g, "&");

              parser.parseString(decodedXmlVenta, (err, resultVenta) => {
                if (err) {
                  console.error("Error parsing XML:", err);
                  Alert.alert(
                    "Error",
                    "Hubo un problema al procesar el tipo de cambio de venta.",
                  );
                  return;
                }

                const venta = parseFloat(
                  resultVenta?.string
                    ?.Datos_de_INGC011_CAT_INDICADORECONOMIC?.[0]
                    ?.INGC011_CAT_INDICADORECONOMIC?.[0]?.NUM_VALOR?.[0],
                ).toFixed(2);

                if (venta) {
                  setExchangeRate({ compra, venta });
                  setIsModalVisible(true);
                } else {
                  console.error("No se pudo encontrar el valor de venta.");
                }
              });
            })
            .catch((error) => {
              console.error("Error fetching exchange rate venta:", error);
            });
        } else {
          console.error("No se pudo encontrar el valor de compra.");
        }
      });
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al obtener el tipo de cambio.");
      console.error("Error fetching exchange rate:", error);
    }
  };

  const avatarUrl = `https://ui-avatars.com/api/?name=${username}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.profileContainer}>
          <View style={styles.profileImageWrapper}>
            <Image style={styles.profileImage} source={{ uri: avatarUrl }} />
            <Pressable style={styles.editIcon}>
              <Text style={styles.editIconText}>✏️</Text>
            </Pressable>
          </View>
          <Text style={styles.userName}>{username}</Text>
        </View>

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
          <Pressable style={styles.option} onPress={showPasswordModal}>
            <Text style={styles.optionText}>
              Tiempo para renovar contraseña
            </Text>
            <Text style={styles.optionArrow}>›</Text>
          </Pressable>
          <Pressable style={styles.option} onPress={goToPremiumUserPlan}>
            <Text style={styles.optionText}>Planes Premium</Text>
            <Text style={styles.optionArrow}>›</Text>
          </Pressable>
          <Pressable style={styles.option} onPress={fetchExchangeRate}>
            <Text style={styles.optionText}>Ver Tipo de Cambio</Text>
            <Text style={styles.optionArrow}>›</Text>
          </Pressable>
          <Pressable style={styles.option} onPress={goToMinistryOfHealthData}>
            <Text style={styles.optionText}>Ver Datos Ministerio De Salud</Text>
            <Text style={styles.optionArrow}>›</Text>
          </Pressable>
          <Pressable style={styles.option} onPress={goToNewsAging}>
            <Text style={styles.optionText}>
              Ver Noticias Sobre Envejecimiento
            </Text>
            <Text style={styles.optionArrow}>›</Text>
          </Pressable>
        </View>

        <View style={styles.logoutContainer}>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
          </Pressable>
        </View>

        <Modal visible={isPasswordModalVisible} transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Renovación de Contraseña</Text>
              <Text>{calculateDaysUntilPasswordChange()}</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={closePasswordModal}
              >
                <Text style={styles.modalButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={isModalVisible} transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Tipo de Cambio USD a CRC</Text>
              {exchangeRate ? (
                <>
                  <Text style={styles.exchangeText}>
                    Compra (USD a CRC): {exchangeRate.compra}
                  </Text>
                  <Text style={styles.exchangeText}>
                    Venta (USD a CRC): {exchangeRate.venta}
                  </Text>
                </>
              ) : (
                <Text>Cargando...</Text>
              )}
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
  exchangeText: {
    fontSize: 16,
    marginVertical: 5,
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

export default User;
