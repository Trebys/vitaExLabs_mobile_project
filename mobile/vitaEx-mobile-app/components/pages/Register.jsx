import React, { useState, useEffect, useRef } from "react";
import {
  Pressable,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Switch,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Animated,
} from "react-native";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import TextInputComponent from "../TextInputComponent";
import { PasswordPolicy } from "../PasswordPolicy";
import { useRouter } from "expo-router";

export function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [favoriteColor, setFavoriteColor] = useState("");
  const [petsName, setPetsName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Investigador");
  const [isSelected, setSelection] = useState(false);

  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cantons, setCantons] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCanton, setSelectedCanton] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const [verificationModalVisible, setVerificationModalVisible] =
    useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const router = useRouter();

  const roles = ["Investigador", "Científico", "Colaborador"];

  // Referencias de animación
  const titleAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;
  const tseButtonAnim = useRef(new Animated.Value(0)).current;
  // Animaciones al cargar el componente
  useEffect(() => {
    Animated.sequence([
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(tseButtonAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleTSEConsultation = async () => {
    if (email) {
      try {
        const response = await axios.get(
          `http://10.0.2.2:8000/api/tse/obtencion_datos_tse/`,
          { params: { email } },
        );
        if (response.status === 200) {
          setFirstName(response.data.nombre);
          setLastName(response.data.apellidos);
        } else {
          Alert.alert(
            "No encontrado",
            "No se encontró un usuario con ese correo.",
          );
        }
      } catch (error) {
        console.error("Error al buscar correo en la base de datos:", error);
        Alert.alert("Error", "Hubo un problema al consultar los datos.");
      }
    } else {
      Alert.alert("Error", "Por favor ingresa un correo electrónico.");
    }
  };

  const handleRegister = async () => {
    if (!isSelected) {
      Alert.alert("Error", "Debes aceptar los Términos y Condiciones.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await axios.post(
        "http://10.0.2.2:8000/api/email-and-code-verification/",
        {
          email,
        },
      );

      if (
        response.data.message ===
        "Código de verificación enviado al correo. Por favor ingrésalo para continuar."
      ) {
        setVerificationCode(""); // Reiniciar el código de verificación
        setVerificationModalVisible(true); // Mostrar el modal para ingresar el código
      }
    } catch (error) {
      if (error.response && error.response.data.error) {
        Alert.alert("Error", error.response.data.error);
      } else {
        Alert.alert("Error", "Hubo un problema al verificar el correo.");
      }
    }
  };

  const handleVerifyCode = async () => {
    try {
      const response = await axios.post(
        "http://10.0.2.2:8000/api/email-and-code-verification/",
        {
          email,
          code: verificationCode,
        },
      );

      if (
        response.data.message ===
        "Código verificado correctamente. Ahora puedes proceder con el registro completo."
      ) {
        await handleFinalRegistration();
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Código de verificación incorrecto o ha expirado. Intenta nuevamente.",
      );
    }
  };

  const handleFinalRegistration = async () => {
    const ubicacionJson = {
      pais:
        countries.find((country) => country.cod_ubicacion === selectedCountry)
          ?.nombre || "",
      provincia:
        provinces.find(
          (province) => province.cod_ubicacion === selectedProvince,
        )?.nombre || "",
      canton:
        cantons.find((canton) => canton.cod_ubicacion === selectedCanton)
          ?.nombre || "",
      distrito:
        districts.find(
          (district) => district.cod_ubicacion === selectedDistrict,
        )?.nombre || "",
    };

    try {
      const response = await axios.post("http://10.0.2.2:8000/api/register/", {
        first_name: firstName,
        last_name: lastName,
        username,
        email,
        password,
        role,
        favorite_color: favoriteColor,
        pets_name: petsName,
        ubicacion_json: ubicacionJson,
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert("Registro exitoso", "Usuario registrado correctamente.");
        setVerificationModalVisible(false);
        router.push("/");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Hubo un problema al completar el registro. Intenta nuevamente.",
      );
    }
  };

  const handleCancelVerification = () => {
    setVerificationModalVisible(false); // Oculta el modal
    setVerificationCode(""); // Limpia el código de verificación ingresado
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ScrollView>
        {/* Animación del título */}
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: titleAnim,
              transform: [
                {
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          Regístrate
        </Animated.Text>
        <Text style={styles.subtitle}>Crea una cuenta para empezar</Text>

        <TextInputComponent
          placeholder="Primer Nombre"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInputComponent
          placeholder="Apellidos"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInputComponent
          placeholder="Nombre de usuario"
          value={username}
          onChangeText={setUsername}
        />
        <TextInputComponent
          placeholder="Correo Electrónico"
          value={email}
          onChangeText={setEmail}
        />
        {/* Animación del botón "Consultar TSE" */}
        <Animated.View
          style={{
            opacity: tseButtonAnim,
            transform: [
              {
                scale: tseButtonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
            ],
          }}
        >
          <Pressable style={styles.tseButton} onPress={handleTSEConsultation}>
            <Text style={styles.tseButtonText}>Consultar TSE</Text>
          </Pressable>
        </Animated.View>

        <TextInputComponent
          placeholder="Color Favorito"
          value={favoriteColor}
          onChangeText={setFavoriteColor}
        />
        <TextInputComponent
          placeholder="Nombre de Mascota"
          value={petsName}
          onChangeText={setPetsName}
        />
        <TextInputComponent
          placeholder="Crear Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInputComponent
          placeholder="Confirmar Contraseña"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <PasswordPolicy password={password} />

        {/* Picker de Roles */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Seleccione un Rol</Text>
          <Picker
            selectedValue={role}
            onValueChange={(itemValue) => setRole(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Seleccione un Rol" value="" />
            {roles.map((roleOption) => (
              <Picker.Item
                key={roleOption}
                label={roleOption}
                value={roleOption}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.switchContainer}>
          <Switch value={isSelected} onValueChange={setSelection} />
          <Text style={styles.termsText}>
            He leído y estoy de acuerdo con los{" "}
            <Text style={styles.linkText}>Términos y Condiciones</Text> y la{" "}
            <Text style={styles.linkText}>Política de Privacidad</Text>.
          </Text>
        </View>

        {/* Animación del botón de registro */}
        <Animated.View
          style={{
            opacity: buttonAnim,
            transform: [
              {
                scale: buttonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
            ],
          }}
        >
          <Pressable style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Registrarse</Text>
          </Pressable>
        </Animated.View>

        <Modal
          visible={verificationModalVisible}
          animationType="slide"
          transparent
        >
          <Animated.View
            style={[
              styles.modalContainer,
              {
                opacity: modalAnim,
                transform: [{ scale: modalAnim }],
              },
            ]}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Verificación de Correo</Text>
              <TextInput
                placeholder="Código de Verificación"
                style={styles.input}
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="numeric"
              />
              <Pressable style={styles.verifyButton} onPress={handleVerifyCode}>
                <Text style={styles.verifyButtonText}>Verificar Código</Text>
              </Pressable>
              <Pressable
                style={styles.cancelButton}
                onPress={handleCancelVerification}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: { flex: 1, backgroundColor: "white", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  subtitle: { fontSize: 16, color: "gray", marginBottom: 24 },
  pickerContainer: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
  },
  pickerLabel: {
    fontSize: 14,
    color: "gray",
    marginBottom: 4,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  tseButton: {
    backgroundColor: "#38A169",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  tseButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  termsText: { marginLeft: 8, color: "gray" },
  linkText: { color: "#38A169" },
  registerButton: {
    backgroundColor: "#38A169",
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    alignItems: "center",
    alignSelf: "center",
    width: "100%",
  },
  registerButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
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
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    width: "100%",
    padding: 10,
    marginBottom: 16,
  },
  verifyButton: {
    backgroundColor: "#38A169",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  verifyButtonText: { color: "white", fontWeight: "bold" },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  cancelButtonText: { color: "black", fontWeight: "bold" },
});

export default Register;
