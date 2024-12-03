import React, { useState, useRef, useEffect } from "react";
import {
  Pressable,
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  Image,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import TextInputComponent from "../TextInputComponent";
import NotificationModal from "../NotificationModal";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OnboardingScreen from "./OnboardingScreen";
const labImage = require("../../assets/womes_background.jpg");
const vitaexLogo = require("../../assets/vitaex_logo.jpeg");

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(null); // Estado para controlar el onboarding
  const [notification, setNotification] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success", // success, error, warning
    onConfirm: () => {},
  });

  const router = useRouter();

  // Animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const forgotPasswordOpacity = useRef(new Animated.Value(0)).current;
  const forgotPasswordTranslateY = useRef(new Animated.Value(0)).current;
  const registerOpacity = useRef(new Animated.Value(0)).current;
  const registerTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Verificar si el usuario ya vio el onboarding
    const checkOnboardingStatus = async () => {
      try {
        const hasSeenOnboarding =
          await AsyncStorage.getItem("hasSeenOnboarding");
        //await AsyncStorage.clear(); //Quitar esta linea para que funcione correctamente el onboarding
        if (hasSeenOnboarding === null) {
          setShowOnboarding(true);
        } else {
          setShowOnboarding(false);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setShowOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    // Iniciar las animaciones solo si no se muestra el onboarding
    if (showOnboarding === false) {
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(forgotPasswordOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(forgotPasswordTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(registerOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(registerTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showOnboarding]);
  const handleOnboardingFinish = async () => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      setShowOnboarding(false);
    } catch (error) {
      console.error("Error setting onboarding status:", error);
    }
  };
  const handleLogin = async () => {
    if (!username || !password) {
      setNotification({
        visible: true,
        title: "Error",
        message: "Por favor, ingresa un nombre de usuario y una contraseña.",
        type: "error",
        onConfirm: () => setNotification({ ...notification, visible: false }),
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://10.0.2.2:8000/api/token-auth/",
        {
          username,
          password,
        },
      );

      if (response.data.message?.includes("Código de verificación enviado")) {
        setNotification({
          visible: true,
          title: "Verificación Requerida",
          message: response.data.message,
          type: "warning",
          onConfirm: () => setNotification({ ...notification, visible: false }),
        });
        setStep(2);
      } else if (response.data.token) {
        const token = response.data.token;
        await AsyncStorage.setItem("username", username);
        await AsyncStorage.setItem("token", token);
        setNotification({
          visible: true,
          title: "Inicio de sesión exitoso",
          message: "Has iniciado sesión correctamente.",
          type: "success",
          onConfirm: () => {
            setNotification({ ...notification, visible: false });
            router.push("/main_page");
          },
        });
      }
    } catch (error) {
      const message = error.response?.data.message || "Error de conexión";
      setNotification({
        visible: true,
        title: "Error",
        message,
        type: "error",
        onConfirm: () => setNotification({ ...notification, visible: false }),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setNotification({
        visible: true,
        title: "Error",
        message: "Por favor, ingresa el código de verificación.",
        type: "error",
        onConfirm: () => setNotification({ ...notification, visible: false }),
      });
      return;
    }

    setLoading(true);

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
        await AsyncStorage.setItem("username", username);
        await AsyncStorage.setItem("token", token);
        setNotification({
          visible: true,
          title: "Inicio de sesión exitoso",
          message: "Has iniciado sesión correctamente.",
          type: "success",
          onConfirm: () => {
            setNotification({ ...notification, visible: false });
            router.push("/main_page");
          },
        });
      } else {
        setNotification({
          visible: true,
          title: "Error",
          message: "Código incorrecto o expirado.",
          type: "error",
          onConfirm: () => setNotification({ ...notification, visible: false }),
        });
      }
    } catch {
      setNotification({
        visible: true,
        title: "Error",
        message: "Hubo un problema al verificar el código.",
        type: "error",
        onConfirm: () => setNotification({ ...notification, visible: false }),
      });
    } finally {
      setLoading(false);
    }
  };
  if (showOnboarding === null) {
    // Mostrar indicador de carga mientras se verifica AsyncStorage
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#38A169" />
      </View>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onFinish={handleOnboardingFinish} />;
  }

  return (
    <SafeAreaView
      style={
        Platform.OS === "web" ? styles.safeAreaViewWeb : styles.safeAreaView
      }
    >
      {/* Notificación */}
      <NotificationModal
        visible={notification.visible}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        onConfirm={notification.onConfirm}
      />

      {/* Contenido del Login */}
      <View style={styles.logoContainer}>
        <Image
          source={labImage}
          style={[
            styles.backgroundImage,
            Platform.OS === "web" && styles.backgroundImageWeb,
          ]}
          resizeMode="cover"
        />
        <Animated.View
          style={[
            styles.logoOverlay,
            Platform.OS === "web" && styles.logoOverlayWeb,
            { transform: [{ scale: logoScale }] },
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
        </Animated.View>
      </View>

      <Animated.Text
        style={[
          Platform.OS === "web" ? styles.titleWeb : styles.title,
          { opacity: titleOpacity },
        ]}
      >
        Bienvenido A VitaEx Labs App!
      </Animated.Text>

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

      <Animated.View
        style={{
          opacity: forgotPasswordOpacity,
          transform: [{ translateY: forgotPasswordTranslateY }],
        }}
      >
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
      </Animated.View>

      <Pressable
        style={
          Platform.OS === "web" ? styles.loginButtonWeb : styles.loginButton
        }
        onPress={step === 1 ? handleLogin : handleVerifyCode}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.loginButtonText}>
            {step === 1 ? "Entrar" : "Verificar Código"}
          </Text>
        )}
      </Pressable>

      <Animated.View
        style={[
          styles.registerContainer,
          {
            opacity: registerOpacity,
            transform: [{ translateY: registerTranslateY }],
          },
        ]}
      >
        <Text style={styles.registerText}>¿No estás registrado?</Text>
        <Pressable onPress={() => router.push("/register_page")}>
          <Text style={styles.registerLink}>Regístrate ahora</Text>
        </Pressable>
      </Animated.View>
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

export default Login;
