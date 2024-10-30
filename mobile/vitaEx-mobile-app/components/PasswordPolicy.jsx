import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
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

  useEffect(() => {
    // Solicitud para obtener la política de contraseñas
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
    // Validar el estado de la contraseña según la política
    const validatePassword = () => {
      const lengthValid =
        password.length >= passwordPolicy.min_length &&
        password.length <= passwordPolicy.max_length;
      const uppercaseValid = /[A-Z]/.test(password);
      const lowercaseValid = /[a-z]/.test(password);
      const specialCharValid = /\W/.test(password);
      const noRepeatValid = new Set(password).size === password.length;

      setPolicyStatus({
        length: lengthValid,
        uppercase: uppercaseValid,
        lowercase: lowercaseValid,
        specialChar: specialCharValid,
        noRepeat: noRepeatValid,
      });
    };
    validatePassword();
  }, [password, passwordPolicy]);

  return (
    <View style={styles.passwordPolicyContainer}>
      <Text style={styles.passwordPolicyTitle}>
        Requisitos para la contraseña:
      </Text>

      <PolicyItem
        label={`Longitud: ${passwordPolicy.min_length} a ${passwordPolicy.max_length} caracteres`}
        valid={policyStatus.length}
      />
      <PolicyItem
        label="Debe contener al menos una letra mayúscula"
        valid={policyStatus.uppercase}
      />
      <PolicyItem
        label="Debe contener al menos una letra minúscula"
        valid={policyStatus.lowercase}
      />
      <PolicyItem
        label="Debe contener al menos un carácter especial"
        valid={policyStatus.specialChar}
      />
      <PolicyItem
        label="No debe tener caracteres repetidos"
        valid={policyStatus.noRepeat}
      />
    </View>
  );
}

function PolicyItem({ label, valid }) {
  return (
    <View style={styles.policyItem}>
      <FontAwesome
        name={valid ? "check-circle" : "times-circle"}
        size={16}
        color={valid ? "green" : "red"}
      />
      <Text style={valid ? styles.validText : styles.invalidText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  passwordPolicyContainer: {
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f0f4f8",
    borderRadius: 8,
  },
  passwordPolicyTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 16,
  },
  policyItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  validText: {
    color: "green",
    marginLeft: 8,
  },
  invalidText: {
    color: "red",
    marginLeft: 8,
  },
});
