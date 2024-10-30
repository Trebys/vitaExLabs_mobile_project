import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export function NavigationButtons({ activePage }) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Botón para Cargar Datos */}
      <Pressable
        onPress={() => router.push("/upload_data_page")}
        style={[
          styles.button,
          activePage === "upload_data"
            ? styles.activeButton
            : styles.inactiveButton,
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            activePage === "upload_data"
              ? styles.activeText
              : styles.inactiveText,
          ]}
        >
          Cargar Datos
        </Text>
      </Pressable>

      {/* Botón para Mis Estudios */}
      <Pressable
        onPress={() => router.push("/my_researchs_page")}
        style={[
          styles.button,
          activePage === "my_researchs"
            ? styles.activeButton
            : styles.inactiveButton,
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            activePage === "my_researchs"
              ? styles.activeText
              : styles.inactiveText,
          ]}
        >
          Mis Estudios
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: "green",
    borderColor: "green",
  },
  inactiveButton: {
    backgroundColor: "white",
    borderColor: "green",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  activeText: {
    color: "white",
  },
  inactiveText: {
    color: "green",
  },
});
