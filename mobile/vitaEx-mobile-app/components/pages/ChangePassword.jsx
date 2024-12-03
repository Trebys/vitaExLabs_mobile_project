import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { PasswordPolicy } from "../PasswordPolicy";
import axios from "axios";
import { useRouter } from "expo-router";
import NotificationModal from "../NotificationModal";

export function ChangePassword() {
  const [email, setEmail] = useState("");
  const [tempCode, setTempCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  //Estados NoticationModal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("success"); // "success", "error", "warning"

  const router = useRouter();

  // Animations
  const stepOpacity = useRef(new Animated.Value(1)).current;

  const animateStepChange = () => {
    Animated.sequence([
      Animated.timing(stepOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(stepOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };
  //Función para mostrar el modal
  const showModal = (title, message, type = "success") => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
  };
  //Función para cerrar el modal
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleEmailSubmit = async () => {
    if (!email) {
      showModal("Error", "Por favor, ingresa tu correo electrónico.", "error");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://10.0.2.2:8000/api/recover-account/", { email });
      setStep(2);
      animateStepChange();
    } catch {
      showModal(
        "Error",
        "No se pudo encontrar un usuario con ese correo electrónico.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async () => {
    if (!tempCode) {
      showModal("Error", "Por favor, ingresa el código temporal.", "error");
      return;
    }

    setLoading(true);
    try {
      const verifyResponse = await axios.post(
        "http://10.0.2.2:8000/api/verify-code/",
        { email, code: tempCode },
      );

      if (verifyResponse.data.valid) {
        setQuestion(
          Math.random() > 0.5
            ? "¿Cuál es el nombre de tu mascota?"
            : "¿Cuál es tu color favorito?",
        );
        setStep(3);
        animateStepChange();
      } else {
        showModal("Error", "Código temporal incorrecto o expirado.", "error");
      }
    } catch {
      showModal("Error", "Error al verificar el código temporal.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityQuestion = async () => {
    if (!answer) {
      showModal("Error", "Por favor, ingresa tu respuesta.", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://10.0.2.2:8000/api/validate-security-question/",
        { email, question, answer },
      );

      if (response.data.valid) {
        setStep(4);
        animateStepChange();
      } else {
        showModal("Error", "La respuesta es incorrecta.", "error");
      }
    } catch {
      showModal(
        "Error",
        "Error al validar la respuesta de seguridad.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) {
      showModal("Error", "Por favor, ingresa una nueva contraseña.", "error");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://10.0.2.2:8000/api/change-password/", {
        email,
        newPassword,
      });
      alert("");
      showModal("Exito", "Contraseña cambiada con éxito.", "success");
      router.push("/");
    } catch {
      showModal("Error", "Hubo un problema al cambiar la contraseña.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
      <Text style={styles.description}>
        Ingresa tu correo, el código temporal y tu nueva contraseña.
      </Text>

      <Animated.View style={{ opacity: stepOpacity }}>
        {step === 1 && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Pressable
              style={styles.button}
              onPress={handleEmailSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Enviar Código</Text>
              )}
            </Pressable>
          </>
        )}

        {step === 2 && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Código temporal"
              value={tempCode}
              onChangeText={setTempCode}
              keyboardType="default"
              autoCapitalize="none"
            />
            <Pressable
              style={styles.button}
              onPress={handleCodeSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Verificar Código</Text>
              )}
            </Pressable>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.question}>{question}</Text>
            <TextInput
              style={styles.input}
              placeholder="Respuesta"
              value={answer}
              onChangeText={setAnswer}
            />
            <Pressable
              style={styles.button}
              onPress={handleSecurityQuestion}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Validar Respuesta</Text>
              )}
            </Pressable>
          </>
        )}

        {step === 4 && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Nueva contraseña"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <PasswordPolicy password={newPassword} />
            <Pressable
              style={styles.button}
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Cambiar Contraseña</Text>
              )}
            </Pressable>
          </>
        )}
      </Animated.View>
      <NotificationModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onConfirm={handleCloseModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#555",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#38A169",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
