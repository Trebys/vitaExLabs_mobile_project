import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Main } from "./components/pages/Main";

//Si importo el componente Login, no pasa nada, tengo que revisar si la forma de enrutar estilo nextjs y el archivo app.js tendran conflicto despues cuando hostee la app.
export default function App() {
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}
