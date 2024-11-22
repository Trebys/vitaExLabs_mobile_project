import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";

export function PayPalSandboxPayment() {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(null);

  // Cargar el monto desde AsyncStorage
  useEffect(() => {
    const fetchAmount = async () => {
      try {
        const storedAmount = await AsyncStorage.getItem("plan_monto");
        if (storedAmount) {
          setAmount(parseFloat(storedAmount).toFixed(2));
        }
      } catch (error) {
        console.error("Error obteniendo el monto", error);
      }
    };

    fetchAmount();
  }, []);

  const initiatePayment = async () => {
    if (!amount) return;

    setLoading(true);
    try {
      const response = await fetch("http://10.0.2.2:8000/api/paypal/payment/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();
      if (data.approval_url) {
        Linking.openURL(data.approval_url);
      }
    } catch (error) {
      console.error("Error iniciando el pago", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {!loading && amount && (
        <TouchableOpacity style={styles.paypalButton} onPress={initiatePayment}>
          <Text style={styles.paypalButtonText}>
            Pay with PayPal (${amount})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  paypalButton: {
    backgroundColor: "#FFC439",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  paypalButtonText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
});

export default PayPalSandboxPayment;
