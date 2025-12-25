import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import "react-native-reanimated"

import { useColorScheme } from "~/hooks/use-color-scheme"

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
            <Stack.Screen
              name="(settings)/edit-profile"
              options={{ presentation: "modal", title: "Edit Profile" }}
            />
            <Stack.Screen
              name="(settings)/loans"
              options={{ presentation: "modal", title: "Loans" }}
            />
            <Stack.Screen
              name="(settings)/categories"
              options={{ presentation: "modal", title: "Categories" }}
            />
            <Stack.Screen
              name="(settings)/tags"
              options={{ presentation: "modal", title: "Tags" }}
            />
            <Stack.Screen
              name="(settings)/trash"
              options={{ presentation: "modal", title: "Trash" }}
            />
            <Stack.Screen
              name="(settings)/preferences"
              options={{ presentation: "modal", title: "Preferences" }}
            />
            <Stack.Screen
              name="(settings)/data-management"
              options={{ presentation: "modal", title: "Data Management" }}
            />
          </Stack>

          <StatusBar style="auto" />
        </ThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}
