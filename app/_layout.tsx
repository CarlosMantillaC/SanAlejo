import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="contenedor/[id]"
          options={{ title: "Detalle contenedor" }}
        />
        <Stack.Screen
          name="contenedor-form"
          options={{ presentation: "modal", title: "Formulario contenedor" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
