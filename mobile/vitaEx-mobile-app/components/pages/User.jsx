import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function User() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        {/* Cabecera con imagen de perfil y nombre */}
        <View style={styles.profileContainer}>
          <View style={styles.profileImageWrapper}>
            <Image
              style={styles.profileImage}
              source={{ uri: "https://www.example.com/user-avatar.png" }} // Reemplaza con la URL de tu imagen
            />
            <Pressable style={styles.editIcon}>
              <Text style={styles.editIconText}>✏️</Text>
            </Pressable>
          </View>
          <Text style={styles.userName}>Lucas Scott</Text>
        </View>

        {/* Opciones de configuración */}
        <View style={styles.optionContainer}>
          <Pressable style={styles.option}>
            <Text style={styles.optionText}>Mis datos</Text>
            <Text style={styles.optionArrow}>›</Text>
          </Pressable>

          <Pressable style={styles.option}>
            <Text style={styles.optionText}>
              Indicaciones para cargar estudios
            </Text>
            <Text style={styles.optionArrow}>›</Text>
          </Pressable>

          <Pressable style={styles.option}>
            <Text style={styles.optionText}>Temas de interés</Text>
            <Text style={styles.optionArrow}>›</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  profileContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImageWrapper: {
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E0E0E0",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#000",
    borderRadius: 20,
    padding: 5,
  },
  editIconText: {
    color: "white",
    fontSize: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  optionContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  optionArrow: {
    fontSize: 18,
    color: "#999",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "white",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    color: "#666",
    fontSize: 12,
  },
  navTextSelected: {
    color: "#38A169",
  },
});
