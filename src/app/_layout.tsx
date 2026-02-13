import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { UnistylesRuntime, useUnistyles } from "react-native-unistyles"

import { ToastManager } from "~/components/ui/toast"
import { TooltipProvider } from "~/components/ui/tooltip"
import "react-native-reanimated"

import { setStyle } from "expo-navigation-bar"
import { Platform } from "react-native"

import { NewEnum } from "~/types/new"

export default function RootLayout() {
  const { theme } = useUnistyles()

  UnistylesRuntime.setRootViewBackgroundColor(theme.colors.surface)

  if (Platform.OS === "android") {
    setStyle(theme.isDark ? "dark" : "light")
  }

  return (
    <KeyboardProvider>
      <GestureHandlerRootView
        style={{
          flex: 1,
          // paddingTop: UnistylesRuntime.insets.top,
          paddingBottom: UnistylesRuntime.insets.bottom,
        }}
      >
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
                  fontWeight: "600",
                },
                headerShadowVisible: false,
                // header: (props) => <ScreenSharedHeader props={props} />,
                // animation: "fade",
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

              {/* settings screens */}
              <Stack.Screen
                name="settings/edit-profile"
                options={{ title: "Edit Profile" }}
              />
              <Stack.Screen name="settings/loans" options={{ title: "Loan" }} />
              <Stack.Screen
                name="settings/all-accounts"
                options={{ title: "All Accounts" }}
              />
              <Stack.Screen
                name="settings/categories/index"
                options={{ title: "Categories" }}
              />
              <Stack.Screen
                name="settings/categories/archived"
                options={{ title: "Archived Categories" }}
              />

              <Stack.Screen
                name="settings/categories/[categoryId]/index"
                options={{
                  title: "Category Details",
                }}
              />

              <Stack.Screen
                name="settings/categories/presets"
                options={{ title: "Add from Presets" }}
              />
              <Stack.Screen
                name="settings/categories/[categoryId]/modify"
                options={({ route }) => {
                  const params = route.params as
                    | { categoryId?: string }
                    | undefined
                  return {
                    title:
                      params?.categoryId === NewEnum.NEW
                        ? "Create Category"
                        : "Edit Category",
                  }
                }}
              />
              <Stack.Screen
                name="settings/tags/index"
                options={{ title: "Tags" }}
              />
              <Stack.Screen
                name="settings/trash"
                options={{ title: "Trash" }}
              />
              <Stack.Screen
                name="settings/preferences/index"
                options={{ title: "Preferences" }}
              />
              <Stack.Screen
                name="settings/data-management"
                options={{ title: "Data Management" }}
              />
              <Stack.Screen
                name="settings/budgets"
                options={{ title: "Budgets" }}
              />
              <Stack.Screen
                name="settings/pending-transactions"
                options={{
                  title: "Pending Transactions",
                }}
              />
              <Stack.Screen
                name="settings/bill-splitter"
                options={{ title: "Bill Splitter" }}
              />
              <Stack.Screen
                name="settings/goals"
                options={{ title: "Goals" }}
              />

              {/* settings screens preferences */}
              <Stack.Screen
                name="settings/preferences/theme"
                options={{ title: "Theme" }}
              />
              <Stack.Screen
                name="settings/preferences/toast-style"
                options={{
                  title: "Toast Style",
                }}
              />
              <Stack.Screen
                name="settings/preferences/exchange-rates"
                options={{ title: "Exchange Rates" }}
              />
              <Stack.Screen
                name="settings/preferences/trash-bin"
                options={{ title: "Trash bin" }}
              />
              <Stack.Screen
                name="settings/preferences/reminder"
                options={{ title: "Reminder" }}
              />
              <Stack.Screen
                name="settings/preferences/pending-transactions"
                options={{
                  title: "Pending transactions",
                }}
              />
              <Stack.Screen
                name="settings/preferences/privacy"
                options={{ title: "Privacy" }}
              />
              <Stack.Screen
                name="settings/preferences/money-formatting"
                options={{ title: "Money Formatting" }}
              />
              <Stack.Screen
                name="settings/preferences/transaction-location"
                options={{
                  title: "Transaction Location",
                }}
              />
              <Stack.Screen
                name="accounts/[accountId]/index"
                options={{
                  title: "Account Details",
                }}
              />
              <Stack.Screen
                name="accounts/[accountId]/modify"
                options={({ route }) => {
                  const params = route.params as
                    | { accountId?: string }
                    | undefined
                  return {
                    title:
                      params?.accountId === NewEnum.NEW
                        ? "Create Account"
                        : "Edit Account",
                  }
                }}
              />
              <Stack.Screen
                name="settings/tags/[tagId]"
                options={({ route }) => {
                  const params = route.params as { tagId?: string } | undefined
                  return {
                    title:
                      params?.tagId === NewEnum.NEW ? "Create Tag" : "Edit Tag",
                  }
                }}
              />

              <Stack.Screen
                name="transaction/[id]"
                options={({ route }) => {
                  const params = route.params as { id?: string } | undefined
                  return {
                    title:
                      params?.id === NewEnum.NEW
                        ? "Create Transaction"
                        : "Edit Transaction",
                    presentation: "fullScreenModal",
                  }
                }}
              />
            </Stack>
            <StatusBar style={theme.isDark ? "light" : "dark"} animated />

            {/* <SystemBars style={{
              navigationBar: "dark",
              statusBar: "dark",

            }} /> */}

            <ToastManager />
          </BottomSheetModalProvider>
        </TooltipProvider>
      </GestureHandlerRootView>
    </KeyboardProvider>
  )
}
