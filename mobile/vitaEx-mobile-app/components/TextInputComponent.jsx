import React, { useState } from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const TextInputComponent = ({
  placeholder,
  secureTextEntry = false,
  value,
  onChangeText,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        secureTextEntry={!!secureTextEntry && !isPasswordVisible} // Asegura que sea booleano
        placeholderTextColor="#808080"
        value={value}
        onChangeText={onChangeText}
      />
      {secureTextEntry && (
        <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
          <FontAwesome
            name={isPasswordVisible ? "eye-slash" : "eye"}
            size={20}
            color="gray"
            style={styles.icon}
          />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: "100%",
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#F3F4F6",
  },
  textInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  icon: {
    marginLeft: 10,
  },
});

export default TextInputComponent;
