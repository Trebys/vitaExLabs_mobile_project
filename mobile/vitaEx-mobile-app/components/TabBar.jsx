import React, { useEffect, useState } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import {
  UserIcon,
  ChartIcon,
  HomeIcon,
  ReserchsIcon,
  UploadIcon,
} from "./Icons";
import { useRouter, usePathname } from "expo-router";

export function TabBar() {
  const router = useRouter();
  const path = usePathname();

  const [activeTab, setActiveTab] = useState(path);

  useEffect(() => {
    setActiveTab(path);
  }, [path]);

  const handleTabPress = (route) => {
    setActiveTab(route);
    router.replace(route); // Usamos replace para evitar la flecha de "atrás" en el tab bar
  };

  return (
    <View style={styles.tabBar}>
      <Pressable
        style={styles.tabItem}
        onPress={() => handleTabPress("/user_page")}
      >
        <UserIcon
          size={28}
          style={activeTab === "/user_page" ? styles.activeIcon : styles.icon}
        />
        <Text
          style={
            activeTab === "/user_page" ? styles.activeText : styles.inactiveText
          }
        >
          Usuario
        </Text>
      </Pressable>

      <Pressable
        style={styles.tabItem}
        onPress={() => handleTabPress("/charts_page")}
      >
        <ChartIcon
          size={28}
          style={activeTab === "/charts_page" ? styles.activeIcon : styles.icon}
        />
        <Text
          style={
            activeTab === "/charts_page"
              ? styles.activeText
              : styles.inactiveText
          }
        >
          Gráficos
        </Text>
      </Pressable>

      <Pressable
        style={styles.tabItemCenter}
        onPress={() => handleTabPress("/main_page")}
      >
        <HomeIcon
          size={32}
          style={activeTab === "/main_page" ? styles.activeIcon : styles.icon}
        />
        <Text
          style={
            activeTab === "/main_page" ? styles.activeText : styles.inactiveText
          }
        >
          Inicio
        </Text>
      </Pressable>

      <Pressable
        style={styles.tabItem}
        onPress={() => handleTabPress("/reserchs_page")}
      >
        <ReserchsIcon
          size={28}
          style={
            activeTab === "/reserchs_page" ? styles.activeIcon : styles.icon
          }
        />
        <Text
          style={
            activeTab === "/reserchs_page"
              ? styles.activeText
              : styles.inactiveText
          }
        >
          Investigaciones
        </Text>
      </Pressable>

      <Pressable
        style={styles.tabItem}
        onPress={() => handleTabPress("/upload_data_page")}
      >
        <UploadIcon
          size={28}
          style={
            activeTab === "/upload_data_page" ? styles.activeIcon : styles.icon
          }
        />
        <Text
          style={
            activeTab === "/upload_data_page"
              ? styles.activeText
              : styles.inactiveText
          }
        >
          Cargar Datos
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    height: 70, // Ajusta la altura para dar más espacio a los íconos
    marginBottom: 10, // Añade margen inferior para que no esté tan pegado
  },
  tabItem: {
    alignItems: "center",
    flex: 1, // Distribuye equitativamente los íconos
  },
  tabItemCenter: {
    alignItems: "center",
    flex: 1, // Asegura que el ícono central (Inicio) esté bien alineado
  },
  icon: {
    color: "gray",
  },
  activeIcon: {
    color: "green",
  },
  inactiveText: {
    color: "gray",
    fontSize: 11,
    marginTop: 4,
  },
  activeText: {
    color: "green",
    fontWeight: "bold",
    fontSize: 11,
    marginTop: 4,
  },
});
