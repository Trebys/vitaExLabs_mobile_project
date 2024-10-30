import React, { useState } from "react";
import {
  Pressable,
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  Image,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import TextInputComponent from "../TextInputComponent";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const labImage = require("../../assets/womes_background.jpg");
const vitaexLogo = require("../../assets/vitaex_logo.jpeg");

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState(""); // Nuevo estado para el código de verificación
  const [step, setStep] = useState(1); // 1 para login, 2 para verificación
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert(
        "Error",
        "Por favor, ingresa un nombre de usuario y una contraseña.",
      );
      return;
    }

    try {
      const response = await axios.post(
        "http://10.0.2.2:8000/api/token-auth/",
        {
          username,
          password,
        },
      );

      if (response.data.message?.includes("Código de verificación enviado")) {
        Alert.alert("Verificación Requerida", response.data.message);
        setStep(2); // Cambia al paso de verificación de código
      } else if (response.data.token) {
        const token = response.data.token;
        await AsyncStorage.setItem("username", username); // Guarda el username en AsyncStorage
        await AsyncStorage.setItem("token", token); // Guarda el token en AsyncStorage
        Alert.alert("Inicio de sesión exitoso");
        router.push("/main_page");
      }
    } catch (error) {
      const message = error.response?.data.message;
      if (message) {
        Alert.alert("Error", message);
      } else {
        console.log("Error en la solicitud:", error.message);
        Alert.alert("Error", "Error de conexión");
      }
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert("Error", "Por favor, ingresa el código de verificación.");
      return;
    }

    try {
      const response = await axios.post(
        "http://10.0.2.2:8000/api/verify-code/",
        {
          username,
          code: verificationCode,
        },
      );

      if (response.data.valid) {
        const token = response.data.token;
        await AsyncStorage.setItem("username", username); // Guarda el username en AsyncStorage
        await AsyncStorage.setItem("token", token); // Guarda el token en AsyncStorage
        Alert.alert("Inicio de sesión exitoso");
        router.push("/main_page");
      } else {
        Alert.alert("Error", "Código incorrecto o expirado.");
      }
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al verificar el código.");
    }
  };

  return (
    <SafeAreaView
      style={
        Platform.OS === "web" ? styles.safeAreaViewWeb : styles.safeAreaView
      }
    >
      <View style={styles.logoContainer}>
        <Image
          source={labImage}
          style={[
            styles.backgroundImage,
            Platform.OS === "web" && styles.backgroundImageWeb,
          ]}
          resizeMode="cover"
        />
        <View
          style={[
            styles.logoOverlay,
            Platform.OS === "web" && styles.logoOverlayWeb,
          ]}
        >
          <Image
            source={vitaexLogo}
            style={[
              styles.logoImage,
              Platform.OS === "web" && styles.logoImageWeb,
            ]}
            resizeMode="contain"
          />
        </View>
      </View>

      <Text style={Platform.OS === "web" ? styles.titleWeb : styles.title}>
        Bienvenido A VitaEx Labs App!
      </Text>

      <View
        style={
          Platform.OS === "web"
            ? styles.inputContainerWeb
            : styles.inputContainer
        }
      >
        <TextInputComponent
          placeholder="Nombre de usuario"
          value={username}
          onChangeText={(text) => setUsername(text)}
        />
        <TextInputComponent
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        {step === 2 && (
          <TextInputComponent
            placeholder="Código de verificación"
            value={verificationCode}
            onChangeText={(text) => setVerificationCode(text)}
          />
        )}
      </View>

      <Pressable onPress={() => router.push("/change_password_page")}>
        <Text
          style={
            Platform.OS === "web"
              ? styles.forgotPasswordTextWeb
              : styles.forgotPasswordText
          }
        >
          ¿Olvidaste tu contraseña?
        </Text>
      </Pressable>

      <Pressable
        style={
          Platform.OS === "web" ? styles.loginButtonWeb : styles.loginButton
        }
        onPress={step === 1 ? handleLogin : handleVerifyCode}
      >
        <Text style={styles.loginButtonText}>
          {step === 1 ? "Entrar" : "Verificar Código"}
        </Text>
      </Pressable>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>¿No estás registrado?</Text>
        <Pressable onPress={() => router.push("/register_page")}>
          <Text style={styles.registerLink}>Regístrate ahora</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  // Estilos generales
  safeAreaView: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: "100%",
    marginBottom: 20,
  },
  backgroundImage: {
    width: "100%",
    height: 200,
    marginBottom: "12%",
  },
  backgroundImageWeb: {
    width: "100%",
    height: 300,
    marginBottom: "5%",
    position: "relative",
  },
  logoOverlay: {
    position: "absolute",
    top: "50%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  logoOverlayWeb: {
    top: "40%",
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  logoImageWeb: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  forgotPasswordText: {
    color: "#38A169",
    textAlign: "center",
    marginTop: 10,
  },
  loginButton: {
    backgroundColor: "#38A169",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  loginButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: {
    color: "black",
  },
  registerLink: {
    color: "#38A169",
    marginLeft: 8,
  },
  safeAreaViewWeb: {
    flex: 1,
    paddingHorizontal: 64,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWeb: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 30,
  },
  inputContainerWeb: {
    width: "50%",
    marginBottom: 20,
  },
  forgotPasswordTextWeb: {
    color: "#38A169",
    textAlign: "center",
    marginTop: 15,
  },
  loginButtonWeb: {
    backgroundColor: "#38A169",
    padding: 20,
    borderRadius: 8,
    marginTop: 30,
    width: "50%",
    alignItems: "center",
  },
});
