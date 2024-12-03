import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";

export function ScreenLayout({ children }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.screenLayout,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screenLayout: {
    flex: 1,
    backgroundColor: "#38a169",
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
});
