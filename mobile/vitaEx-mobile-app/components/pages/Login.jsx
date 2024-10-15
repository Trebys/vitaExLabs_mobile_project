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
import { useRouter } from "expo-router"; // Importa el hook useRouter de expo-router
import TextInputComponent from "../TextInputComponent";
import axios from "axios"; // Para hacer la solicitud HTTP

// Importa las imágenes locales
const labImage = require("../../assets/womes_background.jpg");
const vitaexLogo = require("../../assets/vitaex_logo.jpeg");

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter(); // Hook para navegar entre rutas de expo-router

  const handleLogin = async () => {
    console.log("Usuario ingresado:", username);
    console.log("Contraseña ingresada:", password);

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
          username: username,
          password: password,
        },
      );

      const token = response.data.token;
      console.log("Token recibido:", token);
      Alert.alert("Inicio de sesión exitoso");

      // Redirige a la página principal utilizando el hook de expo-router
      router.push("/main_page"); // Asegúrate de que la ruta /Main exista
    } catch (error) {
      if (error.response) {
        console.log("Error en el servidor:", error.response.data);
        Alert.alert(
          "Error",
          error.response.data.detail || "Credenciales incorrectas",
        );
      } else {
        console.log("Error en la solicitud:", error.message);
        Alert.alert("Error", "Error de conexión");
      }
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
      </View>

      <Pressable>
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
        onPress={handleLogin}
      >
        <Text style={styles.loginButtonText}>Entrar</Text>
      </Pressable>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>¿No estás registrado?</Text>
        <Pressable>
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
