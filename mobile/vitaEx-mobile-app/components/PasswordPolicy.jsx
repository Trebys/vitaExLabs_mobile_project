import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";

export function PasswordPolicy({ password }) {
  const [passwordPolicy, setPasswordPolicy] = useState({
    min_length: 8,
    max_length: 14,
  });
  const [policyStatus, setPolicyStatus] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    specialChar: false,
    noRepeat: false,
  });
  const [animations] = useState({
    length: new Animated.Value(0),
    uppercase: new Animated.Value(0),
    lowercase: new Animated.Value(0),
    specialChar: new Animated.Value(0),
    noRepeat: new Animated.Value(0),
  });

  useEffect(() => {
    async function fetchPasswordPolicy() {
      try {
        const response = await axios.get(
          "http://10.0.2.2:8000/api/password-policy/",
        );
        setPasswordPolicy(response.data);
      } catch (error) {
        console.error("Error fetching password policy", error);
      }
    }
    fetchPasswordPolicy();
  }, []);

  useEffect(() => {
    const validatePassword = () => {
      const lengthValid =
        password.length >= passwordPolicy.min_length &&
        password.length <= passwordPolicy.max_length;
      const uppercaseValid = /[A-Z]/.test(password);
      const lowercaseValid = /[a-z]/.test(password);
      const specialCharValid = /\W/.test(password);
      const noRepeatValid = new Set(password).size === password.length;

      const updatedStatus = {
        length: lengthValid,
        uppercase: uppercaseValid,
        lowercase: lowercaseValid,
        specialChar: specialCharValid,
        noRepeat: noRepeatValid,
      };

      setPolicyStatus(updatedStatus);
      triggerAnimations(updatedStatus);
    };

    validatePassword();
  }, [password, passwordPolicy]);

  const triggerAnimations = (updatedStatus) => {
    Object.keys(updatedStatus).forEach((key) => {
      Animated.timing(animations[key], {
        toValue: updatedStatus[key] ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  };

  return (
    <View style={styles.passwordPolicyContainer}>
      <Text style={styles.passwordPolicyTitle}>
        Requisitos para la contraseña:
      </Text>

      <PolicyItem
        label={`Longitud: ${passwordPolicy.min_length} a ${passwordPolicy.max_length} caracteres`}
        valid={policyStatus.length}
        animation={animations.length}
      />
      <PolicyItem
        label="Debe contener al menos una letra mayúscula"
        valid={policyStatus.uppercase}
        animation={animations.uppercase}
      />
      <PolicyItem
        label="Debe contener al menos una letra minúscula"
        valid={policyStatus.lowercase}
        animation={animations.lowercase}
      />
      <PolicyItem
        label="Debe contener al menos un carácter especial"
        valid={policyStatus.specialChar}
        animation={animations.specialChar}
      />
      <PolicyItem
        label="No debe tener caracteres repetidos"
        valid={policyStatus.noRepeat}
        animation={animations.noRepeat}
      />
    </View>
  );
}

function PolicyItem({ label, valid, animation }) {
  const animatedColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FF6B6B", "#38A169"], // De rojo a verde
  });

  const animatedScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1], // Escala de 90% a 100%
  });

  return (
    <Animated.View
      style={[
        styles.policyItem,
        { transform: [{ scale: animatedScale }], borderColor: animatedColor },
      ]}
    >
      <FontAwesome
        name={valid ? "check-circle" : "times-circle"}
        size={16}
        color={valid ? "green" : "red"}
      />
      <Animated.Text
        style={[
          valid ? styles.validText : styles.invalidText,
          { color: animatedColor },
        ]}
      >
        {label}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  passwordPolicyContainer: {
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  passwordPolicyTitle: {
    fontWeight: "bold",
    marginBottom: 12,
    fontSize: 18,
    color: "#1f2937",
  },
  policyItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  validText: {
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 14,
  },
  invalidText: {
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 14,
  },
});
