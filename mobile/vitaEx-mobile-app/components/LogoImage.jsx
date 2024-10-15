import React from "react";
import { View, Image, StyleSheet, Platform } from "react-native";

// Importa las imágenes locales
const labImage = require("../assets/womes_background.jpg");
const vitaexLogo = require("../assets/vitaex_logo.jpeg");

export function LogoImage() {
  return (
    <View style={styles.container}>
      {/* Imagen de fondo */}
      <Image
        source={labImage}
        style={[
          styles.backgroundImage,
          Platform.OS === "web" && styles.backgroundImageWeb,
        ]}
        resizeMode="cover"
      />
      {/* Contenedor del logo */}
      <View
        style={[
          styles.logoContainer,
          Platform.OS === "web" && styles.logoContainerWeb,
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginVertical: 16,
  },
  backgroundImage: {
    width: "95%", // Ocupa todo el ancho disponible en móviles
    height: "80%",
    marginBottom: "12%",
  },
  backgroundImageWeb: {
    height: "60%", // En la web, ajustamos el tamaño de la imagen
    marginBottom: "5%", // Menos margen inferior en pantallas grandes
  },
  logoContainer: {
    position: "absolute",
    top: "70%", // Ajuste en móviles
    backgroundColor: "white",
    borderRadius: 16,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  logoContainerWeb: {
    top: "60%", // Ajuste para que el logo esté más centrado en la web
  },
  logoImage: {
    width: 100, // Ajuste para pantallas pequeñas (móviles)
    height: 100,
  },
  logoImageWeb: {
    width: 120, // Logo más grande en la web
    height: 120,
  },
});
