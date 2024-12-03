import { StyleSheet } from "react-native";
const UserStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  profileContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImageWrapper: {
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E0E0E0",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#000",
    borderRadius: 20,
    padding: 5,
  },
  editIconText: {
    color: "white",
    fontSize: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  optionContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  optionArrow: {
    fontSize: 18,
    color: "#999",
  },
  logoutContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  logoutButton: {
    backgroundColor: "red",
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  exchangeText: {
    fontSize: 16,
    marginVertical: 5,
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: "#38A169",
    padding: 10,
    borderRadius: 8,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
export default UserStyles;
