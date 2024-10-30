import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { PasswordPolicy } from "../PasswordPolicy";
import { router } from "expo-router";

export function ChangePassword() {
  const [email, setEmail] = useState("");
  const [tempCode, setTempCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [answer, setAnswer] = useState(""); // Nueva respuesta de seguridad
  const [question, setQuestion] = useState(""); // Pregunta de seguridad
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async () => {
    if (!email) {
      Alert.alert("Error", "Por favor, ingresa tu correo electrónico.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://10.0.2.2:8000/api/recover-account/", { email });
      Alert.alert("Éxito", "Código temporal enviado a tu correo.");
      setStep(2);
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo encontrar un usuario con ese correo electrónico.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async () => {
    if (!tempCode) {
      Alert.alert("Error", "Por favor, ingresa el código temporal.");
      return;
    }

    setLoading(true);
    try {
      const verifyResponse = await axios.post(
        "http://10.0.2.2:8000/api/verify-code/",
        { email, code: tempCode },
      );

      if (verifyResponse.data.valid) {
        // Elegir pregunta aleatoria
        const randomQuestion =
          Math.random() > 0.5
            ? "¿Cuál es el nombre de tu mascota?"
            : "¿Cuál es tu color favorito?";
        setQuestion(randomQuestion);
        setStep(3); // Pasar a la etapa de pregunta de seguridad
      } else {
        Alert.alert("Error", "Código temporal incorrecto o expirado.");
      }
    } catch (error) {
      Alert.alert("Error", "Error al verificar el código temporal.");
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityQuestion = async () => {
    if (!answer) {
      Alert.alert("Error", "Por favor, ingresa tu respuesta.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://10.0.2.2:8000/api/validate-security-question/",
        { email, question, answer },
      );

      if (response.data.valid) {
        setStep(4); // Paso para cambiar la contraseña
      } else {
        Alert.alert("Error", "La respuesta es incorrecta.");
      }
    } catch (error) {
      Alert.alert("Error", "Error al validar la respuesta de seguridad.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) {
      Alert.alert("Error", "Por favor, ingresa una nueva contraseña.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://10.0.2.2:8000/api/change-password/",
        { email, newPassword },
      );
      Alert.alert("Éxito", response.data.message);
      router.push("/");
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al cambiar la contraseña.");
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
            <Text style={styles.buttonText}>Enviar Código</Text>
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
            <Text style={styles.buttonText}>Verificar Código</Text>
          </Pressable>
        </>
      )}

      {step === 3 && (
        <>
          <Text>{question}</Text>
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
            <Text style={styles.buttonText}>Validar Respuesta</Text>
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
            <Text style={styles.buttonText}>Cambiar Contraseña</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "white",
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
    color: "#666",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 8,
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
