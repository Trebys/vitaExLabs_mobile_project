import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PayPalSandboxPayment } from "../PayPalSandboxPayment";
import { useRouter } from "expo-router";

export function PremiumUserPlan() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const router = useRouter();

  const plans = [
    {
      name: "Básico",
      price: "$10.00",
      amount: 10.0,
      description: "5 descargas de estudios de API",
      color: "#00b894",
    },
    {
      name: "Estándar",
      price: "$20.00",
      amount: 20.0,
      description: "10 descargas de estudios de API",
      color: "#0984e3",
    },
    {
      name: "Premium",
      price: "$50.00",
      amount: 50.0,
      description: "Descargas ilimitadas",
      color: "#2d3436",
    },
  ];

  const handlePlanSelection = async (plan) => {
    try {
      setSelectedPlan(plan);
      await AsyncStorage.multiSet([
        ["plan_nombre", plan.name],
        ["plan_monto", plan.amount.toString()],
        ["plan_descripcion", plan.description],
      ]);
      setIsPaymentModalVisible(true);
    } catch (error) {
      console.error("Error al seleccionar el plan", error);
    }
  };

  const handleBankPayment = () => {
    setIsPaymentModalVisible(false);
    router.push("/payment_gateway_page");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Planes de Suscripción</Text>
      {plans.map((plan, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.planCard, { borderColor: plan.color }]}
          onPress={() => handlePlanSelection(plan)}
        >
          <Text style={[styles.price, { color: plan.color }]}>
            {plan.price}
          </Text>
          <View style={styles.details}>
            <Text style={styles.descriptionText}>✓ {plan.description}</Text>
          </View>
          <Text style={[styles.planName, { backgroundColor: plan.color }]}>
            {plan.name}
          </Text>
        </TouchableOpacity>
      ))}

      <Modal
        visible={isPaymentModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona el Método de Pago</Text>
            <TouchableOpacity
              style={styles.bankButton}
              onPress={handleBankPayment}
            >
              <Text style={styles.bankButtonText}>Banco_X</Text>
            </TouchableOpacity>
            <View style={styles.paypalContainer}>
              <PayPalSandboxPayment />
            </View>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsPaymentModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f3f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  planCard: {
    width: "90%",
    borderWidth: 2,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  price: {
    fontSize: 28,
    fontWeight: "bold",
  },
  details: {
    marginTop: 10,
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  planName: {
    width: "100%",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    paddingVertical: 10,
    borderRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  bankButton: {
    backgroundColor: "#38A169",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 15,
  },
  bankButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  paypalContainer: {
    marginVertical: 15,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E53E3E",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PremiumUserPlan;
