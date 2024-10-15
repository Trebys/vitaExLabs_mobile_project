import React, { useState } from "react";
import {
  Pressable,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Switch,
  StyleSheet,
  Platform,
} from "react-native";
import TextInputComponent from "../TextInputComponent";

export function Register() {
  const [isSelected, setSelection] = useState(false);

  return (
    <SafeAreaView
      style={
        Platform.OS === "web" ? styles.safeAreaViewWeb : styles.safeAreaView
      }
    >
      <ScrollView>
        {/* Título de la pantalla */}
        <Text style={Platform.OS === "web" ? styles.titleWeb : styles.title}>
          Regístrate
        </Text>
        <Text
          style={Platform.OS === "web" ? styles.subtitleWeb : styles.subtitle}
        >
          Crea una cuenta para empezar
        </Text>

        {/* Input de Primer Nombre */}
        <TextInputComponent placeholder="Primer Nombre" />

        {/* Input de Apellidos */}
        <TextInputComponent placeholder="Apellidos" />

        {/* Input de Correo Electrónico */}
        <TextInputComponent placeholder="Correo Electrónico" />

        {/* Input de Contraseña */}
        <TextInputComponent
          placeholder="Crear Contraseña"
          secureTextEntry={true}
        />

        {/* Input para Confirmar Contraseña */}
        <TextInputComponent
          placeholder="Confirmar Contraseña"
          secureTextEntry={true}
        />

        {/* Input de Rol */}
        <View style={styles.roleInputContainer}>
          <Text style={styles.roleLabel}>Rol</Text>
          <Text style={styles.roleValue}>Investigador</Text>
        </View>

        {/* Switch de aceptación de términos */}
        <View style={styles.switchContainer}>
          <Switch value={isSelected} onValueChange={setSelection} />
          <Text style={styles.termsText}>
            He leído y estoy de acuerdo con los{" "}
            <Text style={styles.linkText}>Términos y Condiciones</Text> y la{" "}
            <Text style={styles.linkText}>Política de Privacidad</Text>.
          </Text>
        </View>

        {/* Botón de Registro */}
        <Pressable
          style={
            Platform.OS === "web"
              ? styles.registerButtonWeb
              : styles.registerButton
          }
        >
          <Text style={styles.registerButtonText}>Registrarse</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Estilos generales
  safeAreaView: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    color: "gray",
    marginBottom: 16,
  },
  roleInputContainer: {
    width: "100%",
    marginBottom: 16,
    borderColor: "#D1D5DB", // gris
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#F3F4F6", // gris claro
  },
  roleLabel: {
    color: "gray",
  },
  roleValue: {
    color: "black",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  termsText: {
    marginLeft: 8,
    color: "gray",
  },
  linkText: {
    color: "#38A169", // verde
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

  // Estilos específicos para web
  safeAreaViewWeb: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  titleWeb: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitleWeb: {
    color: "gray",
    marginBottom: 24,
    textAlign: "center",
  },
  registerButtonWeb: {
    backgroundColor: "#38A169",
    padding: 20,
    borderRadius: 8,
    marginTop: 32,
    width: "50%", // ancho específico para web
    alignItems: "center",
  },
});
