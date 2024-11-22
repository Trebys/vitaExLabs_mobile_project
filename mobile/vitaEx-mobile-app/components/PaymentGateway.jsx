import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";

export function PaymentGateway() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const nombre = await AsyncStorage.getItem("nombre"); // Cambiar aquí
        const apellidos = await AsyncStorage.getItem("apellidos");
        const correo = await AsyncStorage.getItem("correo");
        const monto = await AsyncStorage.getItem("plan_monto"); // Cambiar aquí
        const descripcion = await AsyncStorage.getItem("plan_descripcion"); // Cambiar aquí

        if (nombre) setFirstName(nombre);
        if (apellidos) setLastName(apellidos);
        if (correo) setEmail(correo);
        if (monto) setAmount(monto);
        if (descripcion) setDescription(descripcion);
      } catch (error) {
        Alert.alert("Error", "No se pudieron cargar los datos del usuario.");
        console.error(error);
      }
    };

    loadUserData();
  }, []);

  const handlePayment = async () => {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !cardNumber ||
      !expMonth ||
      !expYear ||
      !cvv ||
      !amount ||
      !description
    ) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    try {
      const response = await axios.post(
        "http://10.0.2.2:8000/api/banco_x/procesar_pago/",
        {
          nombre: firstName,
          apellidos: lastName,
          correo: email,
          numero_tarjeta: cardNumber,
          mes_vencimiento: expMonth,
          anio_vencimiento: expYear,
          cvv: cvv,
          monto: amount,
          descripcion: description,
          fecha: new Date().toISOString(),
        },
      );

      if (response.status === 201) {
        Alert.alert("Pago Exitoso", "Tu pago ha sido procesado correctamente.");
        router.push("/main_page");
      } else {
        Alert.alert(
          "Error",
          response.data.error || "Error en el procesamiento del pago.",
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Hubo un problema al procesar el pago. Inténtalo de nuevo.",
      );
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.header}>Información de Facturación</Text>

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={firstName}
        onChangeText={setFirstName}
      />

      <Text style={styles.label}>Apellidos</Text>
      <TextInput
        style={styles.input}
        placeholder="Apellidos"
        value={lastName}
        onChangeText={setLastName}
      />

      <Text style={styles.label}>Correo Electrónico</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo Electrónico"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.header}>Información de Pago</Text>

      <Text style={styles.label}>Número de Tarjeta</Text>
      <TextInput
        style={styles.input}
        placeholder="Número de Tarjeta"
        keyboardType="numeric"
        value={cardNumber}
        onChangeText={setCardNumber}
      />

      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>Mes Exp.</Text>
          <TextInput
            style={[styles.input, styles.expInput]}
            placeholder="Mes Exp."
            keyboardType="numeric"
            maxLength={2}
            value={expMonth}
            onChangeText={setExpMonth}
          />
        </View>

        <View style={styles.column}>
          <Text style={styles.label}>Año Exp.</Text>
          <Picker
            selectedValue={expYear}
            style={[styles.picker, styles.expInput]}
            onValueChange={(itemValue) => setExpYear(itemValue)}
          >
            <Picker.Item label="Año Exp." value="" />
            {Array.from({ length: 10 }, (_, i) => (
              <Picker.Item
                key={i}
                label={`${new Date().getFullYear() + i}`}
                value={`${new Date().getFullYear() + i}`}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.column}>
          <Text style={styles.label}>CVV</Text>
          <TextInput
            style={[styles.input, styles.cvvInput]}
            placeholder="CVV"
            keyboardType="numeric"
            maxLength={3}
            value={cvv}
            onChangeText={setCvv}
          />
        </View>
      </View>

      <Text style={styles.label}>Monto</Text>
      <TextInput
        style={styles.input}
        placeholder="Monto"
        keyboardType="numeric"
        value={amount}
        editable={false} // Monto no editable
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={description}
        editable={false} // Descripción no editable
      />

      <TouchableOpacity style={styles.button} onPress={handlePayment}>
        <Text style={styles.buttonText}>Procesar Pago</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  label: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  column: {
    flex: 1,
    marginRight: 5,
  },
  expInput: {
    flex: 1,
  },
  cvvInput: {
    width: 80,
  },
  picker: {
    backgroundColor: "#ffffff",
    borderRadius: 5,
    height: 50,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PaymentGateway;
