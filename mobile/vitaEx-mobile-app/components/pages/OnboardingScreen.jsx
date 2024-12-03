import React from "react";
import { Image, StyleSheet, Dimensions } from "react-native";
import Onboarding from "react-native-onboarding-swiper";
const { width, height } = Dimensions.get("window");

const OnboardingScreen = ({ onFinish }) => {
  return (
    <Onboarding
      onSkip={onFinish}
      onDone={onFinish}
      imageContainerStyles={styles.imageContainer}
      containerStyles={styles.container}
      pages={[
        {
          backgroundColor: "#fff",
          image: (
            <Image
              source={require("../../assets/1.jpg")}
              style={styles.image}
            />
          ),
          title: "¡Bienvenido!",
          subtitle:
            "Ingresa con tus credenciales o selecciona 'Regístrate ahora' para crear una nueva cuenta.",
        },
        {
          backgroundColor: "#fff",
          image: (
            <Image
              source={require("../../assets/2.jpg")}
              style={styles.image}
            />
          ),
          title: "Verifica tu Correo",
          subtitle:
            "Recibirás un email con un código de verificación. Ingresa el código para acceder al sistema.",
        },
        {
          backgroundColor: "#fff",
          image: (
            <Image
              source={require("../../assets/3.jpg")}
              style={styles.image}
            />
          ),
          title: "Explora la App",
          subtitle:
            "Navega por la aplicación utilizando la barra de navegación en la parte inferior de la pantalla.",
        },
        {
          backgroundColor: "#fff",
          image: (
            <Image
              source={require("../../assets/4.jpg")}
              style={styles.image}
            />
          ),
          title: "Acceso Rápido",
          subtitle:
            "Accede fácilmente a diversas funciones de interés con un solo click.",
        },
        {
          backgroundColor: "#fff",
          image: (
            <Image
              source={require("../../assets/5.jpg")}
              style={styles.image}
            />
          ),
          title: "Analiza tus Estudios",
          subtitle:
            "Compara tus estudios subidos previamente mediante gráficos interactivos.",
        },
        {
          backgroundColor: "#fff",
          image: (
            <Image
              source={require("../../assets/6.jpg")}
              style={styles.image}
            />
          ),
          title: "Descubre Contenido",
          subtitle:
            "Explora estudios globales sobre temas de interés gracias a nuestras alianzas.",
        },
        {
          backgroundColor: "#fff",
          image: (
            <Image
              source={require("../../assets/7.jpg")}
              style={styles.image}
            />
          ),
          title: "¡Comienza Ahora!",
          subtitle:
            "Sube, visualiza, edita y comparte tus estudios y resultados con tus colaboradores.",
        },
      ]}
    />
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  image: {
    width: width * 0.95,
    height: height * 0.5,
    resizeMode: "contain",
  },
  imageContainer: {
    paddingBottom: 20,
  },
});
