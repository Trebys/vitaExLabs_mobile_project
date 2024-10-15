import React from "react";
import { View, Text, StyleSheet, Image, Platform } from "react-native";

export function SystemSections() {
  return (
    <View
      style={[styles.container, Platform.OS === "web" && styles.containerWeb]}
    >
      {/* Texto de bienvenida */}
      <Text style={styles.title}>Bienvenido a VitaEx Labs</Text>

      {/* Imagen relacionada con la investigación en laboratorio */}
      <Image
        source={require("../assets/lupa.jpg")} // Cambia a "lupa.jpg"
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    width: "100%",
    height: "45%", // Ajustada para dar espacio a la imagen
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: "2%",
    // Ajuste en la web
  },
  containerWeb: {
    height: "50%", // Ajuste en la web
    marginBottom: "5%",
  },
  title: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  image: {
    width: "90%", // Ocupa el 90% del ancho del contenedor
    height: 200, // Ajusta la altura según lo necesario
    borderRadius: 10, // Bordes redondeados para una mejor apariencia
    marginBottom: 30, // Aumenta el margen inferior entre la imagen y el cuadro negro
  },
});
