import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function MyData() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [universityData, setUniversityData] = useState(null);

  // Función para obtener los datos del usuario desde el backend
  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get("http://10.0.2.2:8000/api/user/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setUserData(response.data);
      fetchUniversityData(response.data.email); // Llama a la función con el correo del usuario
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener los datos del usuario", error);
      setLoading(false);
    }
  };

  const fetchUniversityData = async (email) => {
    try {
      const response = await axios.get(
        "http://10.0.2.2:8000/api/universidad_x/consultar_estudiante/",
        {
          params: { correo: email },
        },
      );
      if (response.status === 200) {
        setUniversityData(response.data);
      } else {
        setUniversityData(null);
      }
    } catch (error) {
      console.error("Error al obtener los datos universitarios", error);
      setUniversityData(null);
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

          {/* Datos Universitarios */}
          <View style={styles.separator} />
          {universityData ? (
            <View>
              <Text style={styles.headerText}>Datos Universitarios</Text>
              <View style={styles.dataRow}>
                <Text style={styles.label}>Nombre:</Text>
                <Text style={styles.value}>{universityData.nombre}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.label}>Carrera:</Text>
                <Text style={styles.value}>{universityData.carrera}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.label}>Nivel Académico:</Text>
                <Text style={styles.value}>
                  {universityData.nivel_academico}
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.label}>Fecha de Graduación:</Text>
                <Text style={styles.value}>
                  {universityData.fecha_graduacion}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noUniversityDataText}>
              Este usuario no está inscrito en la universidad X.
            </Text>
          )}
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
    marginBottom: 20, // Añade un margen inferior para separar más los contenedores
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
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 20, // Incrementa el margen para mayor separación
  },
  noUniversityDataText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});
