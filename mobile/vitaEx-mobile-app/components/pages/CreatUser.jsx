import React from "react";
import {
  Pressable,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import TextInputComponent from "../TextInputComponent";

export function CreateUser() {
  return (
    <SafeAreaView
      style={
        Platform.OS === "web" ? styles.safeAreaViewWeb : styles.safeAreaView
      }
    >
      <ScrollView>
        {/* Título de la pantalla */}
        <Text style={Platform.OS === "web" ? styles.titleWeb : styles.title}>
          Crear Usuario
        </Text>
        <Text
          style={Platform.OS === "web" ? styles.subtitleWeb : styles.subtitle}
        >
          Crea una cuenta como administrador
        </Text>

        {/* Input de Primer Nombre */}
        <TextInputComponent placeholder="Primer Nombre" />

        {/* Input de Apellidos */}
        <TextInputComponent placeholder="Apellidos" />

        {/* Input de Correo Electrónico */}
        <TextInputComponent placeholder="Correo Electrónico" />

        {/* Input de Contraseña */}
        <TextInputComponent placeholder="Crear Contraseña" secureTextEntry />

        {/* Input para Confirmar Contraseña */}
        <TextInputComponent
          placeholder="Confirmar Contraseña"
          secureTextEntry
        />

        {/* Input de Rol */}
        <View style={styles.roleInputContainer}>
          <Text style={styles.roleLabel}>Rol</Text>
          <Text style={styles.roleValue}>Administrador</Text>
        </View>

        {/* Botón de Crear Usuario */}
        <Pressable
          style={Platform.OS === "web" ? styles.buttonWeb : styles.button}
        >
          <Text style={styles.buttonText}>Crear Usuario</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Estilos generales (para todas las plataformas)
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
    borderColor: "#D1D5DB", // Gris claro
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#F3F4F6", // Fondo gris claro
  },
  roleLabel: {
    color: "gray",
  },
  roleValue: {
    color: "black",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#38A169", // Verde
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Estilos específicos para web
  safeAreaViewWeb: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 64, // Más padding horizontal para web
    alignItems: "center", // Centra el contenido
    justifyContent: "center", // Centra verticalmente
  },
  titleWeb: {
    fontSize: 32, // Tamaño más grande en web
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitleWeb: {
    color: "gray",
    marginBottom: 24,
    textAlign: "center",
  },
  buttonWeb: {
    backgroundColor: "#38A169",
    padding: 20,
    borderRadius: 8,
    marginTop: 32,
    width: "50%", // Botón ocupa el 50% del ancho en web
    alignItems: "center",
  },
});
