import { Stack, usePathname } from "expo-router";
import { TabBar } from "../components/TabBar";
//imports de las rutas de la app
export default function Layout() {
  const path = usePathname();

  // Rutas que deben tener un título de encabezado específico
  const headerTitles = {
    "/user_page": "Usuario",
    "/charts_page": "Gráficos",
    "/reserchs_page": "Investigaciones",
    "/upload_data_page": "Cargar Datos",
    "/": "Iniciar Sesión", // para la ruta principal que usa el Login
    "/register_page": "Registro",
  };

  // Rutas que muestran el TabBar
  const mainRoutes = [
    "/user_page",
    "/charts_page",
    "/reserchs_page",
    "/upload_data_page",
  ];

  // Rutas donde NO debe aparecer el TabBar (Login y Registro)
  const noTabBarRoutes = ["/", "/register_page"]; // index.js asume "/"

  const isMainRoute = mainRoutes.includes(path);
  const hideTabBar = noTabBarRoutes.includes(path);
  const currentTitle = headerTitles[path] || "Página principal";

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "white" },
          headerTintColor: "black",
          headerTitle: currentTitle,
          headerTitleAlign: "center",
          headerLeft: isMainRoute ? () => null : undefined, // Evitar flecha en las rutas principales
        }}
      />
      {!hideTabBar && <TabBar />}
      {/* Mostrar TabBar solo si no es Login o Registro */}
    </>
  );
}
