import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useUnistyles } from "react-native-unistyles"
import "react-native-reanimated"

import { ScreenSharedHeader } from "~/components/screen-shared-header"
import { ToastManager } from "~/components/ui/toast"
import { TooltipProvider } from "~/components/ui/tooltip"

export default function RootLayout() {
  const { theme } = useUnistyles()

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TooltipProvider>
        <BottomSheetModalProvider>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.colors.surface,
              },
              headerTintColor: theme.colors.primary,
              headerTitleStyle: {
                color: theme.colors.onSurface,
                fontWeight: "bold",
              },
              // header: (props) => <ScreenSharedHeader props={props} />,
              // animation: "fade",
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="toast-demo"
              options={{ presentation: "modal", title: "Toast Demo" }}
            />

            {/* settings screens */}
            <Stack.Screen
              name="(settings)/edit-profile"
              options={{ presentation: "modal", title: "Edit Profile" }}
            />
            <Stack.Screen
              name="(settings)/loans"
              options={{ presentation: "modal", title: "Loan" }}
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
              name="(settings)/(preferences)/preferences"
              options={{ presentation: "modal", title: "Preferences" }}
            />
            <Stack.Screen
              name="(settings)/data-management"
              options={{ presentation: "modal", title: "Data Management" }}
            />
            <Stack.Screen
              name="(settings)/notifications"
              options={{ presentation: "modal", title: "Notifications" }}
            />
            <Stack.Screen
              name="(settings)/budgets"
              options={{ presentation: "modal", title: "Budgets" }}
            />
            <Stack.Screen
              name="(settings)/pending-transactions"
              options={{
                presentation: "modal",
                title: "Pending Transactions",
              }}
            />
            <Stack.Screen
              name="(settings)/bill-splitter"
              options={{ presentation: "modal", title: "Bill Splitter" }}
            />
            <Stack.Screen
              name="(settings)/goals"
              options={{ presentation: "modal", title: "Goals" }}
            />

            {/* settings screens (preferences) */}
            <Stack.Screen
              name="(settings)/(preferences)/theme"
              options={{ presentation: "modal", title: "Theme" }}
            />
            <Stack.Screen
              name="(settings)/(preferences)/toast-style"
              options={{
                presentation: "modal",
                title: "Toast Style",
              }}
            />
            <Stack.Screen
              name="(settings)/(preferences)/exchange-rates"
              options={{ presentation: "modal", title: "Exchange Rates" }}
            />
            <Stack.Screen
              name="(settings)/(preferences)/trash-bin"
              options={{ presentation: "modal", title: "Trash bin" }}
            />
            <Stack.Screen
              name="(settings)/(preferences)/reminder"
              options={{ presentation: "modal", title: "Reminder" }}
            />
            <Stack.Screen
              name="(settings)/(preferences)/numpad"
              options={{ presentation: "modal", title: "Numpad" }}
            />
            <Stack.Screen
              name="(settings)/(preferences)/pending-transactions"
              options={{
                presentation: "modal",
                title: "Pending transactions",
              }}
            />
            <Stack.Screen
              name="(settings)/(preferences)/privacy"
              options={{ presentation: "modal", title: "Privacy" }}
            />
            <Stack.Screen
              name="(settings)/(preferences)/money-formatting"
              options={{ presentation: "modal", title: "Money Formatting" }}
            />
            <Stack.Screen
              name="(settings)/(preferences)/transaction-location"
              options={{
                presentation: "modal",
                title: "Transaction Location",
              }}
            />
          </Stack>

          <StatusBar style={theme.isDark ? "light" : "dark"} animated />

          <ToastManager />
        </BottomSheetModalProvider>
      </TooltipProvider>
    </GestureHandlerRootView>
  )
}
