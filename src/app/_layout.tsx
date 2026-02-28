import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useTranslation } from "react-i18next"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { UnistylesRuntime, useUnistyles } from "react-native-unistyles"

import { AppLockGate } from "~/components/app-lock-gate"
import { ToastManager } from "~/components/ui/toast"
import { TooltipProvider } from "~/components/ui/tooltip"
import "react-native-reanimated"

import { setStyle } from "expo-navigation-bar"
import { useEffect } from "react"
import { Platform } from "react-native"

import { useRecurringTransactionSync } from "~/hooks/use-recurring-transaction-sync"
import { useRetentionCleanup } from "~/hooks/use-retention-cleanup"
import { DirectionEnum, useLanguageStore } from "~/stores/language.store"
import { useMoneyFormattingStore } from "~/stores/money-formatting.store"
import { NewEnum } from "~/types/new"

export default function RootLayout() {
  const { theme } = useUnistyles()
  const { t } = useTranslation()

  UnistylesRuntime.setRootViewBackgroundColor(theme.colors.surface)

  if (Platform.OS === "android") {
    setStyle(theme.isDark ? "dark" : "light")
  }

  const isRTL = useLanguageStore((s) => s.isRTL)

  // Ports to reality: retention cleanup and recurring sync (effects live in domain hooks)
  // Rehydrate shake listener on app start if mask-on-shake was enabled (store-owned subscription)
  useEffect(() => {
    const { maskOnShake, _startShakeListener } =
      useMoneyFormattingStore.getState()
    if (maskOnShake) _startShakeListener()
  }, [])

  useRetentionCleanup()
  useRecurringTransactionSync()

  return (
    <KeyboardProvider>
      <GestureHandlerRootView
        style={{
          flex: 1,
          // paddingTop: UnistylesRuntime.insets.top,
          paddingBottom: UnistylesRuntime.insets.bottom,
          direction: isRTL ? DirectionEnum.RTL : DirectionEnum.LTR,
        }}
      >
        <TooltipProvider>
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
              options={{ title: t("navigation.screenTitles.editProfile") }}
            />
            <Stack.Screen
              name="settings/loans"
              options={{ title: t("loans.title") }}
            />
            <Stack.Screen
              name="settings/all-accounts"
              options={{ title: t("accounts.title") }}
            />
            <Stack.Screen
              name="settings/categories/index"
              options={{ title: t("categories.title") }}
            />
            <Stack.Screen
              name="settings/categories/archived"
              options={{
                title: t("navigation.screenTitles.archivedCategories"),
              }}
            />

            <Stack.Screen
              name="settings/categories/[categoryId]/index"
              options={{
                title: t("navigation.screenTitles.categoryDetails"),
              }}
            />

            <Stack.Screen
              name="settings/categories/presets"
              options={{
                title: t("navigation.screenTitles.addFromPresets"),
              }}
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
                      ? t("navigation.screenTitles.createCategory")
                      : t("navigation.screenTitles.editCategory"),
                }
              }}
            />
            <Stack.Screen
              name="settings/tags/index"
              options={{ title: t("tags.title") }}
            />
            <Stack.Screen
              name="settings/trash"
              options={{ title: t("trash.title") }}
            />
            <Stack.Screen
              name="settings/preferences/index"
              options={{ title: t("preferences.title") }}
            />
            <Stack.Screen
              name="settings/data-management"
              options={{ title: t("dataManagement.title") }}
            />
            <Stack.Screen
              name="settings/budgets"
              options={{ title: t("budgets.title") }}
            />
            <Stack.Screen
              name="settings/pending-transactions"
              options={{ title: t("pending.title") }}
            />
            <Stack.Screen
              name="settings/bill-splitter"
              options={{ title: t("billSplitter.title") }}
            />
            <Stack.Screen
              name="settings/goals"
              options={{ title: t("goals.title") }}
            />

            <Stack.Screen
              name="settings/language"
              options={{ title: t("preferences.language.title") }}
            />

            {/* settings screens preferences */}
            <Stack.Screen
              name="settings/preferences/theme"
              options={{ title: t("preferences.appearance.theme.title") }}
            />
            <Stack.Screen
              name="settings/preferences/toast-style"
              options={{
                title: t("navigation.screenTitles.toastStyle"),
              }}
            />
            <Stack.Screen
              name="settings/preferences/exchange-rates"
              options={{ title: t("exchangeRates.title") }}
            />
            <Stack.Screen
              name="settings/preferences/trash-bin"
              options={{ title: t("trash.title") }}
            />
            <Stack.Screen
              name="settings/preferences/reminder"
              options={{ title: t("reminders.title") }}
            />
            <Stack.Screen
              name="settings/preferences/pending-transactions"
              options={{ title: t("pending.title") }}
            />
            <Stack.Screen
              name="settings/preferences/privacy"
              options={{ title: t("privacy.title") }}
            />
            <Stack.Screen
              name="settings/preferences/money-formatting"
              options={{
                title: t("preferences.appearance.moneyFormatting.title"),
              }}
            />
            <Stack.Screen
              name="settings/preferences/transaction-location"
              options={{
                title: t("preferences.transactionLocation.title"),
              }}
            />
            <Stack.Screen
              name="settings/preferences/transfers"
              options={{ title: t("transfers.title") }}
            />
            <Stack.Screen
              name="accounts/[accountId]/index"
              options={{
                title: t("navigation.screenTitles.accountDetails"),
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
                      ? t("navigation.screenTitles.createAccount")
                      : t("navigation.screenTitles.editAccount"),
                }
              }}
            />
            <Stack.Screen
              name="settings/tags/[tagId]"
              options={({ route }) => {
                const params = route.params as { tagId?: string } | undefined
                return {
                  title:
                    params?.tagId === NewEnum.NEW
                      ? t("navigation.screenTitles.createTag")
                      : t("navigation.screenTitles.editTag"),
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
                      ? t("navigation.screenTitles.createTransaction")
                      : t("navigation.screenTitles.editTransaction"),
                  presentation: "fullScreenModal",
                }
              }}
            />
          </Stack>
          <StatusBar style={theme.isDark ? "light" : "dark"} animated />

          <AppLockGate />
          <ToastManager />
        </TooltipProvider>
      </GestureHandlerRootView>
    </KeyboardProvider>
  )
}
