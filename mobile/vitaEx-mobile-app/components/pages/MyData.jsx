import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function MyData() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener los datos del usuario desde el backend
  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token"); // Obtener el token almacenado
      const response = await axios.get("http://10.0.2.2:8000/api/user/", {
        headers: {
          Authorization: `Token ${token}`, // Enviar el token para la autenticación
        },
      });
      setUserData(response.data); // Guardar los datos del usuario
      setLoading(false); // Desactivar el indicador de carga
    } catch (error) {
      console.error("Error al obtener los datos del usuario", error);
      setLoading(false); // Desactivar el indicador de carga en caso de error
    }
  };

  // Obtener los datos cuando el componente se monta
  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#38A169" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {userData ? (
        <View style={styles.userInfoContainer}>
          <Text style={styles.headerText}>Mis datos</Text>
          <View style={styles.dataRow}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{userData.first_name}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.label}>Apellidos:</Text>
            <Text style={styles.value}>{userData.last_name}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.label}>Correo Electrónico:</Text>
            <Text style={styles.value}>{userData.email}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.label}>Rol:</Text>
            <Text style={styles.value}>{userData.role}</Text>
          </View>
          {/* Agregar otros datos relevantes */}
        </View>
      ) : (
        <Text style={styles.errorText}>No se pudieron obtener los datos.</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  userInfoContainer: {
    backgroundColor: "#F3F4F6",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A5568",
  },
  value: {
    fontSize: 16,
    color: "#2D3748",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
});
