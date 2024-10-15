import React from "react";
import { View, TextInput, StyleSheet } from "react-native";

const TextInputComponent = ({
  placeholder,
  secureTextEntry = false,
  value,
  onChangeText,
}) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#808080" // Color del placeholder
        value={value} // Asegurarse de que el valor esté conectado con el estado
        onChangeText={onChangeText} // Asegurarse de que los cambios actualicen el estado
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: "100%",
    marginBottom: 16, // 16 unidades de margen inferior para separar los inputs
  },
  textInput: {
    height: 48, // Altura del input (12 unidades como en Tailwind)
    borderWidth: 1,
    borderColor: "#D1D5DB", // Gris claro (equivalente a 'border-gray-300')
    paddingHorizontal: 16, // Padding horizontal (px-4 en Tailwind)
    borderRadius: 8, // Bordes redondeados (lg en Tailwind)
    backgroundColor: "#F3F4F6", // Fondo gris claro (bg-gray-100 en Tailwind)
  },
});

export default TextInputComponent;
