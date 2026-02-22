import { zodResolver } from "@hookform/resolvers/zod"
import { withObservables } from "@nozbe/watermelondb/react"
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { AccountTypeInline } from "~/components/accounts/account-type-inline"
import { ChangeIconInline } from "~/components/change-icon-inline"
import { ColorVariantInline } from "~/components/color-variant-inline"
import { ConfirmModal } from "~/components/confirm-modal"
import { CurrencySelectorInline } from "~/components/currency-selector-inline"
import { SmartAmountInput } from "~/components/smart-amount-input"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Input } from "~/components/ui/input"
import { Pressable } from "~/components/ui/pressable"
import { Separator } from "~/components/ui/separator"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type AccountModel from "~/database/models/Account"
import {
  createAccount,
  destroyAccount,
  observeAccountById,
  updateAccount,
} from "~/database/services/account-service"
import { observeTransactionCountByAccountId } from "~/database/services/transaction-service"
import { modelToAccount } from "~/database/utils/model-to-account"
import { useNavigationGuard } from "~/hooks/use-navigation-guard"
import {
  type AddAccountsFormSchema,
  addAccountsSchema,
} from "~/schemas/accounts.schema"
import { getThemeStrict } from "~/styles/theme/registry"
import { type Account, AccountTypeEnum } from "~/types/accounts"
import { NewEnum } from "~/types/new"
import { logger } from "~/utils/logger"
import { Toast } from "~/utils/toast"

interface EditAccountScreenProps {
  accountId: string
  accountModel?: AccountModel
  account?: Account
  transactionCount?: number
}

const EditAccountScreenInner = ({
  accountId,
  accountModel,
  account,
  transactionCount = 0,
}: EditAccountScreenProps) => {
  const router = useRouter()
  const isAddMode = accountId === NewEnum.NEW || !accountId

  const handleGoBack = useCallback(() => {
    router.back()
  }, [router])

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
  const formIsPrimary = watch("isPrimary")

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Navigation guard: block leave when dirty, show confirm modal
  const navigation = useNavigation()
  const [unsavedModalVisible, setUnsavedModalVisible] = useState(false)
  const { confirmNavigation, allowNavigation } = useNavigationGuard({
    navigation,
    when: isDirty && !isSubmitting,
    onConfirm: handleGoBack,
    onBlock: () => setUnsavedModalVisible(true),
  })

  // Bottom sheet controls
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

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

        allowNavigation()
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
          isPrimary: data.isArchived ? false : data.isPrimary,
          excludeFromBalance: data.excludeFromBalance,
          isArchived: data.isArchived,
        })

        allowNavigation()
        handleGoBack()
      }
    } catch (error) {
      logger.error("Error saving account", { error })
      Toast.error({
        title: "Error",
        description: `Failed to ${isAddMode ? "create" : "update"} account.`,
      })
    }
    setIsSubmitting(false)
  }

  const handleSubmit = handleFormSubmit(onSubmit)

  const handleDelete = async () => {
    try {
      if (!accountModel) return

      await destroyAccount(accountModel)

      allowNavigation()
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
          {/* Icon Selection – inline toggle (Icon / Emoji/Letter / Image) */}
          <ChangeIconInline
            id={`change-icon-account-${accountId || NewEnum.NEW}`}
            currentIcon={formIcon}
            onIconSelected={handleIconSelected}
            colorScheme={currentColorScheme}
            iconSize={64}
          />

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

          {/* Balance */}
          <View style={styles.balanceSection}>
            <Controller
              control={control}
              name="balance"
              render={({ field: { value, onChange } }) => (
                <SmartAmountInput
                  value={Number(value) || 0}
                  onChange={(v) => onChange(v)}
                  currencyCode={formCurrencyCode}
                  label="Initial balance"
                  placeholder="0"
                  error={errors.balance?.message}
                />
              )}
            />
          </View>

          {/* Settings List */}
          <View style={styles.settingsList}>
            {/* Currency – inline with search and scroll */}
            <CurrencySelectorInline
              selectedCurrencyCode={formCurrencyCode}
              onCurrencySelected={handleCurrencySelected}
            />

            {/* Account type – inline panel */}
            <AccountTypeInline
              selectedType={formType}
              onTypeSelected={(type) =>
                setValue("type", type, { shouldDirty: true })
              }
            />

            {/* Color Selection – inline panel */}
            <ColorVariantInline
              selectedSchemeName={formColorSchemeName || undefined}
              onColorSelected={handleColorSelected}
              onClearSelection={handleColorCleared}
            />
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
              <View style={styles.primaryAccountBlock}>
                <Controller
                  control={control}
                  name="isPrimary"
                  render={({ field: { value, onChange } }) => (
                    <Pressable
                      style={styles.switchRow}
                      onPress={() => {
                        const next = !value
                        if (next)
                          setValue("isArchived", false, { shouldDirty: true })
                        onChange(next)
                      }}
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
                {formIsPrimary && (
                  <View style={styles.primaryAccountHintContainer}>
                    <IconSymbol
                      name="information"
                      style={styles.primaryAccountHintIcon}
                      size={14}
                    />
                    <Text variant="small" style={styles.primaryAccountHint}>
                      This account will be used as the default account for new
                      transactions and other actions.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Archive Account */}
            {!isAddMode && (
              <Controller
                control={control}
                name="isArchived"
                render={({ field: { value, onChange } }) => (
                  <Pressable
                    style={styles.switchRow}
                    onPress={() => {
                      const next = !value
                      if (next)
                        setValue("isPrimary", false, { shouldDirty: true })
                      onChange(next)
                    }}
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
                onPress={() => setDeleteModalVisible(true)}
                style={styles.actionButton}
              >
                <IconSymbol
                  name="trash-can"
                  size={20}
                  style={styles.deleteIcon}
                />
                <Text variant="default" style={styles.deleteText}>
                  Permanently delete Account
                </Text>
              </Button>
            ) : (
              <View style={styles.archiveContainer}>
                <IconSymbol
                  name="information"
                  style={styles.archiveWarningIcon}
                  size={14}
                />

                <Text variant="small" style={styles.archiveWarning}>
                  You can permanently delete the account with its transactions
                  after you archive the account for safety measures.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* <KeyboardStickyViewMinty> */}
      <View style={styles.actions}>
        <Button variant="outline" onPress={handleGoBack} style={styles.button}>
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
            {isSubmitting ? "Saving..." : isAddMode ? "Create" : "Save Changes"}
          </Text>
        </Button>
      </View>
      {/* </KeyboardStickyViewMinty> */}

      {!isAddMode && account && (
        <ConfirmModal
          visible={deleteModalVisible}
          onRequestClose={() => setDeleteModalVisible(false)}
          onConfirm={handleDelete}
          title={`Permanently delete ${account.name}?`}
          description={
            transactionCount > 0
              ? `This account has ${transactionCount} transaction${transactionCount !== 1 ? "s" : ""}. Permanently deleting the account will also delete ${transactionCount === 1 ? "it" : "them"}. This action cannot be undone.`
              : "Permanently deleting this account cannot be undone. This action is irreversible!"
          }
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="destructive"
          icon="trash-can"
        />
      )}

      <ConfirmModal
        visible={unsavedModalVisible}
        onRequestClose={() => setUnsavedModalVisible(false)}
        onConfirm={() => {
          setUnsavedModalVisible(false)
          confirmNavigation()
        }}
        title="Close without saving?"
        description="All changes will be lost."
        confirmLabel="Discard"
        cancelLabel="Cancel"
        variant="default"
      />
    </View>
  )
}

const EnhancedEditScreen = withObservables(["accountId"], ({ accountId }) => ({
  accountModel: observeAccountById(accountId),
  transactionCount: observeTransactionCountByAccountId(accountId),
}))(
  ({
    accountId,
    accountModel,
    transactionCount = 0,
  }: {
    accountId: string
    accountModel: AccountModel
    transactionCount?: number
  }) => {
    const account = accountModel ? modelToAccount(accountModel) : undefined

    return (
      <EditAccountScreenInner
        key={accountModel?.id || accountId}
        accountId={accountId}
        accountModel={accountModel}
        account={account}
        transactionCount={transactionCount}
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
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.onSurface,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  nameSection: {
    gap: 10,
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
  },
  settingsList: {
    gap: 0,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  settingsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  settingsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
    borderRadius: 16,
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
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  switchLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
    marginTop: 30,
    marginHorizontal: 20,
    gap: 10,
  },
  actionButton: {
    width: "100%",
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
  primaryAccountBlock: {
    gap: 4,
  },
  primaryAccountHintContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  primaryAccountHintIcon: {
    color: theme.colors.customColors.semi,
  },
  primaryAccountHint: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.customColors.semi,
  },
  archiveContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  archiveWarningIcon: {
    color: theme.colors.customColors.semi,
  },
  archiveWarning: {
    fontSize: 12,
    color: theme.colors.customColors.semi,
  },
}))
