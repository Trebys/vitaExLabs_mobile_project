import React, { useRef, useEffect } from "react";
import { View, Image, StyleSheet, Animated, Platform } from "react-native";

const labImage = require("../assets/womes_background.jpg");
const vitaexLogo = require("../assets/vitaex_logo.jpeg");

export function LogoImage() {
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={labImage}
        style={[
          styles.backgroundImage,
          Platform.OS === "web" && styles.backgroundImageWeb,
        ]}
        resizeMode="cover"
      />
      <Animated.View
        style={[
          styles.logoContainer,
          Platform.OS === "web" && styles.logoContainerWeb,
          { transform: [{ scale: bounceAnim }] },
        ]}
      >
        <Image
          source={vitaexLogo}
          style={[
            styles.logoImage,
            Platform.OS === "web" && styles.logoImageWeb,
          ]}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginVertical: 16,
  },
  backgroundImage: {
    width: "95%",
    height: "80%",
    marginBottom: "12%",
  },
  backgroundImageWeb: {
    height: "60%",
    marginBottom: "5%",
  },
  logoContainer: {
    position: "absolute",
    top: "70%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  logoContainerWeb: {
    top: "60%",
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  logoImageWeb: {
    width: 120,
    height: 120,
  },
});
