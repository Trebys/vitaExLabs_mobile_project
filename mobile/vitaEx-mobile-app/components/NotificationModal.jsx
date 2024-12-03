import React from "react";
import { Modal, View, Text, StyleSheet, Pressable } from "react-native";

const NotificationModal = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  type = "success", // "success", "error", "warning"
}) => {
  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          buttonBackground: styles.successButton,
          buttonText: styles.successButtonText,
        };
      case "error":
        return {
          buttonBackground: styles.errorButton,
          buttonText: styles.errorButtonText,
        };
      case "warning":
        return {
          buttonBackground: styles.warningButton,
          buttonText: styles.warningButtonText,
        };
      default:
        return {
          buttonBackground: styles.successButton,
          buttonText: styles.successButtonText,
        };
    }
  };

  const { buttonBackground, buttonText } = getStyles();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.singleButtonContainer}>
            <Pressable style={[buttonBackground]} onPress={onConfirm}>
              <Text style={buttonText}>Confirmar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  singleButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  successButton: {
    backgroundColor: "#009007",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  successButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  errorButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  errorButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  warningButton: {
    backgroundColor: "#fbbf24",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  warningButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default NotificationModal;
