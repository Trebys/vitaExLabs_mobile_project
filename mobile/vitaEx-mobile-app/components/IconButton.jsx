import React from "react";
import { Text, Pressable, Platform } from "react-native";

export function IconButton({ IconComponent, label, onPress }) {
  return (
    <Pressable onPress={onPress} className="items-center">
      <IconComponent
        className="text-green-500"
        size={Platform.OS === "web" ? 40 : 30} // Ajuste de tamaño en web
      />
      <Text
        className={
          Platform.OS === "web"
            ? "mt-2 text-base text-green-600" // Aseguramos que el texto sea verde en web
            : "mt-2 text-sm text-green-600" // Aseguramos que el texto sea verde en móvil
        }
        style={{ color: "green" }} // Fallback por si la clase no aplica en web
      >
        {label}
      </Text>
    </Pressable>
  );
}
