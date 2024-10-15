import React from "react";
import { View, StyleSheet } from "react-native";

export function ScreenLayout({ children }) {
  return <View style={styles.screenLayout}>{children}</View>;
}

const styles = StyleSheet.create({
  screenLayout: {
    flex: 1,
    backgroundColor: "#38a169", // Equivalente a bg-green-600
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
  "@media (min-width: 768px)": {
    screenLayout: {
      paddingLeft: 32, // Equivalente a md:px-8
      paddingRight: 32,
    },
  },
  "@media (min-width: 1024px)": {
    screenLayout: {
      paddingLeft: 48, // Equivalente a lg:px-12
      paddingRight: 48,
    },
  },
});
