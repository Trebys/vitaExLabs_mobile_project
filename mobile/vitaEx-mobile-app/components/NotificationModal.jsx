import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  SafeAreaView,
  StyleSheet,
} from "react-native";

export function NotificationModal({ variant = "single", onConfirm, onCancel }) {
  const [modalVisible, setModalVisible] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {/* Título */}
            <Text style={styles.modalTitle}>
              {variant === "single" ? "Notificación" : "Edición de Usuario"}
            </Text>
            {/* Mensaje */}
            <Text style={styles.modalMessage}>
              {variant === "single"
                ? "Se han guardado los cambios."
                : "¿Está seguro que quiere guardar los cambios de este Usuario?"}
            </Text>

            {/* Botones */}
            <View style={styles.buttonContainer}>
              {variant === "double" && (
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    onCancel();
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
              )}
              <Pressable
                style={styles.confirmButton}
                onPress={() => {
                  onConfirm();
                  setModalVisible(false);
                }}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semitransparente
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderColor: "red",
    borderWidth: 2,
    marginRight: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "red",
    fontWeight: "bold",
  },
  confirmButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "green",
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
