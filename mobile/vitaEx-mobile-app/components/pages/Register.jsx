import React, { useState } from "react";
import {
  Pressable,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Switch,
  StyleSheet,
  Alert,
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
  const [favoriteColor, setFavoriteColor] = useState(""); // Nuevo campo
  const [petsName, setPetsName] = useState(""); // Nuevo campo
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Investigador");
  const [isSelected, setSelection] = useState(false);

  const router = useRouter();

  const roles = ["Investigador", "Científico", "Colaborador"];

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
      const response = await axios.post("http://10.0.2.2:8000/api/register/", {
        first_name: firstName,
        last_name: lastName,
        username: username,
        email: email,
        password: password,
        role: role,
        favorite_color: favoriteColor,
        pets_name: petsName,
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert("Registro exitoso", "Usuario registrado correctamente.");
        router.push("/");
      }
    } catch (error) {
      // Verifica si el error tiene una respuesta y si tiene un mensaje específico desde el backend
      if (error.response) {
        const errorData = error.response.data;
        if (errorData.errors) {
          // Errores de validación de contraseña o similares
          Alert.alert("Error de validación", errorData.errors.join("\n"));
        } else if (errorData.email || errorData.username) {
          // Errores de email o username (si ya existe)
          const messages = [];
          if (errorData.email)
            messages.push(`Correo: ${errorData.email.join("\n")}`);
          if (errorData.username)
            messages.push(
              `Nombre de usuario: ${errorData.username.join("\n")}`,
            );
          Alert.alert("Error de registro", messages.join("\n"));
        } else {
          // Otros errores
          Alert.alert(
            "Error",
            "Hubo un problema al registrar el usuario. Por favor intenta de nuevo.",
          );
        }
      } else {
        // Error sin respuesta del servidor (error de red, por ejemplo)
        Alert.alert(
          "Error de conexión",
          "No se pudo conectar con el servidor. Verifica tu conexión.",
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ScrollView>
        <Text style={styles.title}>Regístrate</Text>
        <Text style={styles.subtitle}>Crea una cuenta para empezar</Text>

        <TextInputComponent
          placeholder="Primer Nombre"
          value={firstName}
          onChangeText={(text) => setFirstName(text)}
        />
        <TextInputComponent
          placeholder="Apellidos"
          value={lastName}
          onChangeText={(text) => setLastName(text)}
        />
        <TextInputComponent
          placeholder="Nombre de usuario"
          value={username}
          onChangeText={(text) => setUsername(text)}
        />
        <TextInputComponent
          placeholder="Correo Electrónico"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />

        <TextInputComponent
          placeholder="Color Favorito"
          value={favoriteColor}
          onChangeText={(text) => setFavoriteColor(text)}
        />
        <TextInputComponent
          placeholder="Nombre de Mascota"
          value={petsName}
          onChangeText={(text) => setPetsName(text)}
        />

        <TextInputComponent
          placeholder="Crear Contraseña"
          secureTextEntry={true}
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        <TextInputComponent
          placeholder="Confirmar Contraseña"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
        />

        <PasswordPolicy password={password} />

        <View style={styles.roleInputContainer}>
          <Text style={styles.roleLabel}>Rol</Text>
          <Picker
            selectedValue={role}
            style={styles.picker}
            onValueChange={(itemValue) => setRole(itemValue)}
          >
            {roles.map((rol) => (
              <Picker.Item key={rol} label={rol} value={rol} />
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

        <Pressable style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Registrarse</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "gray",
    marginBottom: 24,
  },
  roleInputContainer: {
    width: "100%",
    marginBottom: 16,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#F3F4F6",
  },
  roleLabel: {
    color: "gray",
    fontSize: 14,
    marginBottom: 4,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  termsText: {
    marginLeft: 8,
    color: "gray",
  },
  linkText: {
    color: "#38A169",
  },
  registerButton: {
    backgroundColor: "#38A169",
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    alignItems: "center",
  },
  registerButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Register;
