import React, { useState } from "react";
import { Modal, View, Text, Pressable, SafeAreaView } from "react-native";

export function LogoutModal() {
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = () => {
    // Aquí puedes agregar la lógica de cierre de sesión
    console.log("Sesión cerrada");
    setModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      {/* Botón para abrir el modal */}
      <Pressable
        className="bg-green-600 p-3 rounded-lg"
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-white font-bold">
          Abrir Modal de Cerrar Sesión
        </Text>
      </Pressable>

      {/* Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="w-4/5 bg-white p-6 rounded-lg shadow-lg">
            <Text className="text-lg font-bold text-center">Cerrar Sesión</Text>
            <Text className="text-center text-gray-500 mt-4">
              ¿Estás seguro de que deseas cerrar sesión? Tendrás que iniciar
              sesión nuevamente para usar la aplicación.
            </Text>

            <View className="flex-row justify-between mt-6">
              {/* Botón de Cancelar */}
              <Pressable
                className="flex-1 border border-gray-300 rounded-lg p-3 mr-2"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-center text-gray-700 font-bold">
                  Cancelar
                </Text>
              </Pressable>

              {/* Botón de Cerrar Sesión */}
              <Pressable
                className="flex-1 bg-green-600 rounded-lg p-3"
                onPress={handleLogout}
              >
                <Text className="text-center text-white font-bold">
                  Cerrar Sesión
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Text className="text-white"> Hi</Text>
    </SafeAreaView>
  );
}
