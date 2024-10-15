import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { ScreenLayout } from "../ScreenLayout";
import { SystemSections } from "../SystemSections";
import { LogoImage } from "../LogoImage";

export function Main() {
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ScreenLayout>
        <LogoImage />
        <SystemSections />
      </ScreenLayout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: "#f7fafc", // Equivalente a bg-gray-100
  },

  // Media Queries
  "@media (min-width: 768px)": {
    screenLayout: {
      paddingLeft: 32,
      paddingRight: 32,
    },
  },
  "@media (min-width: 1024px)": {
    screenLayout: {
      paddingLeft: 48,
      paddingRight: 48,
    },
  },
});
