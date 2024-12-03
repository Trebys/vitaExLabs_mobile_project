import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, StyleSheet, Pressable, Animated } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const TextInputComponent = ({
  placeholder,
  secureTextEntry = false,
  value,
  onChangeText,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Referencia para animación
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación al montar el componente
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.inputContainer,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
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
    </Animated.View>
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
