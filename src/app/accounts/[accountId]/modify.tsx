import { zodResolver } from "@hookform/resolvers/zod"
import { withObservables } from "@nozbe/watermelondb/react"
import type { EventArg } from "@react-navigation/native"
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import { useCallback, useEffect, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { AccountTypeSelectorSheet } from "~/components/accounts/account-type-selector-sheet"
import { DeleteAccountSheet } from "~/components/accounts/delete-account-sheet"
import { useBottomSheet } from "~/components/bottom-sheet"
import { CalculatorSheet } from "~/components/calculator-sheet"
import { ChangeIconSheet } from "~/components/change-icon-sheet"
import { ColorVariantSheet } from "~/components/color-variant-sheet"
import { CurrencySelectorSheet } from "~/components/currency-selector-sheet"
import { DynamicIcon } from "~/components/dynamic-icon"
import { KeyboardStickyViewMinty } from "~/components/keyboard-sticky-view-minty"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Input } from "~/components/ui/input"
import { Pressable } from "~/components/ui/pressable"
import { Separator } from "~/components/ui/separator"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import {
  UnsavedChangesSheet,
  useUnsavedChangesWarning,
} from "~/components/unsaved-changes-sheet"
import type AccountModel from "~/database/models/Account"
import {
  createAccount,
  deleteAccount,
  observeAccountById,
  updateAccount,
} from "~/database/services/account-service"
import { modelToAccount } from "~/database/utils/model-to-account"
import {
  type AddAccountsFormSchema,
  addAccountsSchema,
} from "~/schemas/accounts.schema"
import { getThemeStrict } from "~/styles/theme/registry"
import { type Account, AccountTypeEnum } from "~/types/accounts"
import { NewEnum } from "~/types/new"
import { accountTypesList } from "~/utils/account-types-list"
import { logger } from "~/utils/logger"
import { formatDisplayValue } from "~/utils/number-format"
import { Toast } from "~/utils/toast"

interface EditAccountScreenProps {
  accountId: string
  accountModel?: AccountModel
  account?: Account
}

const EditAccountScreenInner = ({
  accountId,
  accountModel,
  account,
}: EditAccountScreenProps) => {
  const router = useRouter()
  const isAddMode = accountId === NewEnum.NEW || !accountId

  const handleGoBack = useCallback(() => {
    router.back()
  }, [router.back])

  // Form state management with Zod validation
  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(addAccountsSchema),
    defaultValues: {
      name: account?.name || "",
      type: account?.type || AccountTypeEnum.CHECKING,
      balance: account?.balance || 0,
      currencyCode: account?.currencyCode || "USD",
      icon: account?.icon || "wallet-bifold-outline",
      colorSchemeName: account?.colorSchemeName || undefined,
      isPrimary: account?.isPrimary || false,
      excludeFromBalance: account?.excludeFromBalance || false,
      isArchived: account?.isArchived || false,
    },
  })

  // Watch for form changes
  const formName = watch("name")
  const formIcon = watch("icon")
  const formColorSchemeName = watch("colorSchemeName")
  const formType = watch("type")
  const formCurrencyCode = watch("currencyCode")

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Navigation and unsaved changes handling
  const navigation = useNavigation()
  const unsavedChangesWarning = useUnsavedChangesWarning()
  const isNavigatingRef = useRef(false)

  // Bottom sheet controls
  const deleteSheet = useBottomSheet(
    `delete-account-${accountId || NewEnum.NEW}`,
  )
  const changeIconSheet = useBottomSheet(
    `change-icon-account-${accountId || NewEnum.NEW}`,
  )
  const colorVariantSheet = useBottomSheet(
    `color-variant-account-${accountId || NewEnum.NEW}`,
  )
  const currencySelectorSheet = useBottomSheet(
    `currency-selector-account-${accountId || NewEnum.NEW}`,
  )
  const calculatorSheet = useBottomSheet(
    `calculator-account-${accountId || NewEnum.NEW}`,
  )
  const accountTypeSheet = useBottomSheet(
    `account-type-${accountId || NewEnum.NEW}`,
  )

  // Handle navigation with unsaved changes warning
  useEffect(() => {
    const unsubscribe = navigation.addListener(
      "beforeRemove",
      (e: EventArg<"beforeRemove", true, { action: unknown }>) => {
        if (isSubmitting || isNavigatingRef.current || !isDirty) {
          return
        }

        e.preventDefault()

        unsavedChangesWarning.show(
          () => {
            isNavigatingRef.current = true
            handleGoBack()
          },
          () => {},
        )
      },
    )

    return unsubscribe
  }, [navigation, isDirty, isSubmitting, unsavedChangesWarning, handleGoBack])

  const onSubmit = async (data: AddAccountsFormSchema) => {
    setIsSubmitting(true)

    try {
      if (isAddMode) {
        await createAccount({
          name: data.name,
          type: data.type,
          balance: data.balance,
          currencyCode: data.currencyCode,
          icon: data.icon,
          colorSchemeName: data.colorSchemeName,
          isPrimary: false, // Always false for new accounts
          excludeFromBalance: data.excludeFromBalance,
          isArchived: data.isArchived,
        })

        isNavigatingRef.current = true
        handleGoBack()
      } else {
        if (!accountModel) {
          Toast.error({ title: "Error", description: "Account not found" })
          setIsSubmitting(false)
          return
        }

        await updateAccount(accountModel, {
          name: data.name,
          type: data.type,
          balance: data.balance,
          currencyCode: data.currencyCode,
          icon: data.icon,
          colorSchemeName: data.colorSchemeName,
          isPrimary: data.isPrimary,
          excludeFromBalance: data.excludeFromBalance,
          isArchived: data.isArchived,
        })

        isNavigatingRef.current = true
        handleGoBack()
      }
    } catch (error) {
      logger.error("Error saving account", { error })
      Toast.error({
        title: "Error",
        description: `Failed to ${isAddMode ? "create" : "update"} account.`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = handleFormSubmit(onSubmit)

  const handleDelete = async () => {
    try {
      if (!accountModel) return

      await deleteAccount(accountModel)

      isNavigatingRef.current = true
      router.dismissAll()
      router.push("/settings/all-accounts")
    } catch (error) {
      logger.error("Error deleting account", { error })
      Toast.error({
        title: "Error",
        description: "Failed to delete account.",
      })
    }
  }

  const handleIconSelected = (icon: string) => {
    setValue("icon", icon, { shouldDirty: true })
    changeIconSheet.dismiss()
  }

  const handleColorSelected = (schemeName: string) => {
    setValue("colorSchemeName", schemeName, { shouldDirty: true })
  }

  const handleColorCleared = () => {
    setValue("colorSchemeName", undefined, { shouldDirty: true })
  }

  const handleCurrencySelected = (code: string) => {
    setValue("currencyCode", code, { shouldDirty: true })
  }

  const handleBalanceSubmit = (value: number) => {
    setValue("balance", value, { shouldDirty: true })
    calculatorSheet.dismiss()
  }

  const currentColorScheme = getThemeStrict(formColorSchemeName)

  if (!isAddMode && !account) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="default">Loading account...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.form} key={account?.id || NewEnum.NEW}>
          {/* Icon Selection */}
          <View style={styles.iconSection}>
            <Pressable
              style={[
                styles.iconBox,
                currentColorScheme?.secondary && {
                  backgroundColor: currentColorScheme.secondary,
                },
              ]}
              onPress={() => changeIconSheet.present()}
            >
              <DynamicIcon
                icon={formIcon}
                size={96}
                colorScheme={currentColorScheme}
              />
            </Pressable>
          </View>

          {/* Account Name */}
          <View style={styles.nameSection}>
            <Text variant="small" style={styles.label}>
              Account name
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Checking, Savings, etc."
                  error={!!errors.name}
                  autoFocus={isAddMode}
                />
              )}
            />
            {errors.name && (
              <Text variant="small" style={styles.errorText}>
                {errors.name.message}
              </Text>
            )}
          </View>

          {/* Balance Selection */}
          <View style={styles.balanceSection}>
            <Controller
              control={control}
              name="balance"
              render={({ field: { value } }) => {
                const formatted = formatDisplayValue(value, {
                  currency: formCurrencyCode,
                })
                return (
                  <Pressable
                    style={styles.balanceContainer}
                    onPress={() => calculatorSheet.present()}
                  >
                    <Text style={styles.balanceValue}>{formatted}</Text>
                    <Text variant="muted" style={styles.updateBalanceLabel}>
                      Update balance
                    </Text>
                  </Pressable>
                )
              }}
            />
          </View>

          {/* Settings List */}
          <View style={styles.settingsList}>
            {/* Currency Selection */}
            <Pressable
              style={styles.settingsRow}
              onPress={() => currencySelectorSheet.present()}
            >
              <View style={styles.settingsLeft}>
                <IconSymbol name="currency-usd" size={24} />
                <Text variant="default" style={styles.settingsLabel}>
                  Currency
                </Text>
              </View>
              <View style={styles.settingsRight}>
                <Text variant="default" style={styles.settingsValue}>
                  {watch("currencyCode")}
                </Text>
                <IconSymbol
                  name="chevron-right"
                  size={20}
                  style={styles.chevronIcon}
                />
              </View>
            </Pressable>

            {/* Type Selection */}
            <Pressable
              style={styles.settingsRow}
              onPress={() => accountTypeSheet.present()}
            >
              <View style={styles.settingsLeft}>
                <IconSymbol name="shape" size={24} />
                <Text variant="default" style={styles.settingsLabel}>
                  Account type
                </Text>
              </View>
              <View style={styles.settingsRight}>
                <Text variant="default" style={styles.settingsValue}>
                  {accountTypesList.find((t) => t.type === formType)?.label}
                </Text>
                <IconSymbol
                  name="chevron-right"
                  size={20}
                  style={styles.chevronIcon}
                />
              </View>
            </Pressable>

            {/* Color Selection */}
            <Pressable
              style={styles.settingsRow}
              onPress={() => colorVariantSheet.present()}
            >
              <View style={styles.settingsLeft}>
                <IconSymbol name="palette" size={24} />
                <Text variant="default" style={styles.settingsLabel}>
                  Change color
                </Text>
              </View>
              <View style={styles.settingsRight}>
                {currentColorScheme ? (
                  <View
                    style={[
                      styles.colorPreview,
                      {
                        backgroundColor: currentColorScheme.primary,
                      },
                    ]}
                  />
                ) : (
                  <Text variant="default" style={styles.defaultColorText}>
                    Default color
                  </Text>
                )}
                <IconSymbol
                  name="chevron-right"
                  size={20}
                  style={styles.chevronIcon}
                />
              </View>
            </Pressable>
          </View>

          {/* Divider */}
          <Separator />

          {/* Switches Section */}
          <View style={styles.switchesSection}>
            {/* Exclude from Balance */}
            <Controller
              control={control}
              name="excludeFromBalance"
              render={({ field: { value, onChange } }) => (
                <Pressable
                  style={styles.switchRow}
                  onPress={() => onChange(!value)}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: value }}
                >
                  <View style={styles.switchLeft}>
                    <IconSymbol name="eye-off" size={24} />
                    <Text variant="default" style={styles.switchLabel}>
                      Exclude from balance
                    </Text>
                  </View>

                  {/* Let the row handle presses */}
                  <View pointerEvents="none">
                    <Switch value={value} />
                  </View>
                </Pressable>
              )}
            />

            {/* Primary Account - Only show in edit mode */}
            {!isAddMode && (
              <Controller
                control={control}
                name="isPrimary"
                render={({ field: { value, onChange } }) => (
                  <Pressable
                    style={styles.switchRow}
                    onPress={() => onChange(!value)}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: value }}
                  >
                    <View style={styles.switchLeft}>
                      <IconSymbol name="star" size={24} />
                      <Text variant="default" style={styles.switchLabel}>
                        Primary account
                      </Text>
                    </View>

                    {/* Disable pointer events so presses go to the row */}
                    <View pointerEvents="none">
                      <Switch value={value} />
                    </View>
                  </Pressable>
                )}
              />
            )}

            {/* Archive Account */}
            {!isAddMode && (
              <Controller
                control={control}
                name="isArchived"
                render={({ field: { value, onChange } }) => (
                  <Pressable
                    style={styles.switchRow}
                    onPress={() => onChange(!value)}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: value }}
                  >
                    <View style={styles.switchLeft}>
                      <IconSymbol name="archive-arrow-down" size={24} />
                      <Text variant="default" style={styles.switchLabel}>
                        Archive account
                      </Text>
                    </View>

                    <View pointerEvents="none">
                      <Switch value={value} />
                    </View>
                  </Pressable>
                )}
              />
            )}
          </View>

          {/* Divider */}
          {!isAddMode && <Separator />}
        </View>

        {!isAddMode && (
          <View style={styles.deleteSection}>
            {account?.isArchived ? (
              <Button
                variant="ghost"
                onPress={() => deleteSheet.present()}
                style={styles.actionButton}
              >
                <IconSymbol
                  name="trash-can"
                  size={20}
                  style={styles.deleteIcon}
                />
                <Text variant="default" style={styles.deleteText}>
                  Delete Account
                </Text>
              </Button>
            ) : (
              <Text variant="small" style={styles.archiveWarning}>
                You can permanently delete the account with its transactions
                after you archive the account for safety measures.
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      <KeyboardStickyViewMinty>
        <View style={styles.actions}>
          <Button
            variant="outline"
            onPress={handleGoBack}
            style={styles.button}
          >
            <Text variant="default" style={styles.cancelText}>
              Cancel
            </Text>
          </Button>
          <Button
            variant="default"
            onPress={handleSubmit}
            style={styles.button}
            disabled={
              !formName.trim() || (!isAddMode && !isDirty) || isSubmitting
            }
          >
            <Text variant="default" style={styles.saveText}>
              {isSubmitting
                ? "Saving..."
                : isAddMode
                  ? "Create"
                  : "Save Changes"}
            </Text>
          </Button>
        </View>
      </KeyboardStickyViewMinty>

      {!isAddMode && account && (
        <DeleteAccountSheet account={account} onConfirm={handleDelete} />
      )}

      <ChangeIconSheet
        id={`change-icon-account-${accountId || NewEnum.NEW}`}
        currentIcon={formIcon}
        onIconSelected={handleIconSelected}
        colorScheme={currentColorScheme}
      />

      <ColorVariantSheet
        id={`color-variant-account-${accountId || NewEnum.NEW}`}
        selectedSchemeName={formColorSchemeName}
        onColorSelected={handleColorSelected}
        onClearSelection={handleColorCleared}
        onDismiss={() => colorVariantSheet.dismiss()}
      />

      <CurrencySelectorSheet
        id={`currency-selector-account-${accountId || NewEnum.NEW}`}
        onCurrencySelected={handleCurrencySelected}
        initialCurrency={watch("currencyCode")}
      />

      <AccountTypeSelectorSheet
        id={`account-type-${accountId || NewEnum.NEW}`}
        selectedType={formType}
        onTypeSelected={(type) => setValue("type", type, { shouldDirty: true })}
      />

      <CalculatorSheet
        id={`calculator-account-${accountId || NewEnum.NEW}`}
        title="Update Balance"
        initialValue={Number(watch("balance"))}
        onSubmit={handleBalanceSubmit}
        currencyCode={watch("currencyCode")}
      />

      <UnsavedChangesSheet />
    </View>
  )
}

const EnhancedEditScreen = withObservables(["accountId"], ({ accountId }) => ({
  accountModel: observeAccountById(accountId),
}))(
  ({
    accountId,
    accountModel,
  }: {
    accountId: string
    accountModel: AccountModel
  }) => {
    const account = accountModel ? modelToAccount(accountModel) : undefined

    return (
      <EditAccountScreenInner
        key={accountModel?.id || accountId}
        accountId={accountId}
        accountModel={accountModel}
        account={account}
      />
    )
  },
)

export default function EditAccountScreen() {
  const params = useLocalSearchParams<{ accountId: string }>()
  const accountId = params.accountId
  const isAddMode = accountId === NewEnum.NEW || !accountId

  if (isAddMode) {
    return <EditAccountScreenInner accountId={NewEnum.NEW} />
  }

  return <EnhancedEditScreen accountId={accountId} />
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  form: {
    gap: 32,
  },
  iconSection: {
    alignItems: "center",
    paddingVertical: 12,
  },
  iconBox: {
    width: 120,
    height: 120,
    borderRadius: theme.colors.radius,
    backgroundColor: theme.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.onSurface,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  nameSection: {
    gap: 8,
    paddingHorizontal: 20,
  },
  balanceSection: {
    marginHorizontal: 20,
    // Removed flexShrink: 1 to prevent the container from collapsing
  },
  balanceContainer: {
    paddingVertical: 20, // Move padding here to protect the text
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.colors.radius,
    backgroundColor: theme.colors.secondary,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: "600",
    color: theme.colors.onSurface,
    // THE FIXES:
    lineHeight: 60, // Force enough height for the glyphs
    padding: 0, // Remove the internal padding that was squashing it
    includeFontPadding: false, // Essential for Android vertical alignment
    textAlignVertical: "center",
  },
  updateBalanceLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSecondary,
    opacity: 0.7,
    marginTop: 4, // Use margin to create the gap instead of 'gap' on the container
  },
  settingsList: {
    gap: 0,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  settingsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingsValue: {
    fontSize: 16,
    color: theme.colors.onSecondary,
    opacity: 0.7,
  },
  chevronIcon: {
    color: theme.colors.onSecondary,
    opacity: 0.4,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  defaultColorText: {
    fontSize: 16,
    color: theme.colors.onSecondary,
    opacity: 0.6,
  },
  switchesSection: {
    gap: 0,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  switchLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: 4,
    textAlign: "center",
  },
  deleteSection: {
    marginTop: 32,
    marginHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    width: "100%",
  },
  archiveIcon: {
    color: theme.colors.primary,
  },
  archiveText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  restoreIcon: {
    color: theme.colors.customColors.success,
  },
  restoreText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.customColors.success,
  },
  deleteIcon: {
    color: theme.colors.error,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.error,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  button: {
    flex: 1,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onPrimary,
  },
  archiveWarning: {
    fontSize: 12,
    color: theme.colors.onSecondary,
    opacity: 0.7,
    fontStyle: "italic",
    paddingHorizontal: 8,
  },
}))
