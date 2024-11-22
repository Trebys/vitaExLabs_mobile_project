import { Stack, usePathname } from "expo-router";
import { TabBar } from "../components/TabBar";

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
    "/main_page": "Página principal", // Título para la página principal
    "/my_data_page": "Mis datos",
    "/my_researchs_page": "Mis estudios",
    "/change_password_page": "Cambiar contraseña",
    "/payment_gateway_page": "Pasarela de pago",
    "/premium_user_plan_page": "",
    "/ministry_of_health_data_page": "Datos Ministerio de Salud",
    "/news_aging_page": "Noticias de Envejecimiento",
  };

  // Rutas principales donde NO debería aparecer la flecha de retroceso
  const mainRoutes = [
    "/",
    "/user_page",
    "/charts_page",
    "/reserchs_page",
    "/upload_data_page",
    "/main_page",
    "/my_researchs_page",
    "/change_password_page",
  ];

  // Rutas donde NO debe aparecer el TabBar (Login y Registro)
  const noTabBarRoutes = [
    "/",
    "/register_page",
    "/change_password_page",
    "/payment_gateway_page",
    "/premium_user_plan_page",
  ];

  const isMainRoute = mainRoutes.includes(path);
  const hideTabBar = noTabBarRoutes.includes(path);
  const currentTitle = headerTitles[path];

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "white" },
          headerTintColor: "black",
          headerTitle: currentTitle,
          headerTitleAlign: "center",
          headerShown: true,
          headerBackVisible: !isMainRoute, // Solo mostrar la flecha si no es una ruta principal
        }}
      />
      {!hideTabBar && <TabBar />}
    </>
  );
}
