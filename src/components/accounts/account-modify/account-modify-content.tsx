import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigation, useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AccountTypeInline } from "~/components/accounts/account-type-inline"
import { ChangeIconInline } from "~/components/change-icon-inline"
import { ColorVariantInline } from "~/components/color-variant-inline"
import { ConfirmModal } from "~/components/confirm-modal"
import { CurrencySelectorModal } from "~/components/selector-modals"
import { SmartAmountInput } from "~/components/smart-amount-input"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Input } from "~/components/ui/input"
import { Pressable } from "~/components/ui/pressable"
import { Separator } from "~/components/ui/separator"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { ScrollIntoViewProvider } from "~/contexts/scroll-into-view-context"
import {
  createAccount,
  destroyAccount,
  updateAccount,
} from "~/database/services/account-service"
import { useNavigationGuard } from "~/hooks/use-navigation-guard"
import {
  type AddAccountsFormSchema,
  addAccountsSchema,
} from "~/schemas/accounts.schema"
import { getThemeStrict } from "~/styles/theme/registry"
import { AccountTypeEnum } from "~/types/accounts"
import { NewEnum } from "~/types/new"
import { logger } from "~/utils/logger"
import { Toast } from "~/utils/toast"

import { accountModifyStyles } from "./account-modify.styles"
import type { AccountModifyContentProps } from "./types"

export function AccountModifyContent({
  accountId,
  accountModel,
  account,
  transactionCount = 0,
}: AccountModifyContentProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const isAddMode = accountId === NewEnum.NEW || !accountId

  const handleGoBack = useCallback(() => {
    router.back()
  }, [router])

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

  const formName = watch("name")
  const formIcon = watch("icon")
  const formColorSchemeName = watch("colorSchemeName")
  const formType = watch("type")
  const formCurrencyCode = watch("currencyCode")
  const formIsPrimary = watch("isPrimary")

  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigation = useNavigation()
  const [unsavedModalVisible, setUnsavedModalVisible] = useState(false)
  const { confirmNavigation, allowNavigation } = useNavigationGuard({
    navigation,
    when: isDirty && !isSubmitting,
    onConfirm: handleGoBack,
    onBlock: () => setUnsavedModalVisible(true),
  })

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
          isPrimary: false,
          excludeFromBalance: data.excludeFromBalance,
          isArchived: data.isArchived,
        })

        allowNavigation()
        handleGoBack()
      } else {
        if (!accountModel) {
          Toast.error({
            title: "Error",
            description: t("accounts.toast.notFound"),
          })
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
      <View style={accountModifyStyles.container}>
        <View style={accountModifyStyles.loadingContainer}>
          <Text variant="default">Loading account...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={accountModifyStyles.container}>
      <ScrollIntoViewProvider
        scrollViewStyle={accountModifyStyles.scrollView}
        contentContainerStyle={accountModifyStyles.scrollContent}
      >
        <View style={accountModifyStyles.form} key={account?.id || NewEnum.NEW}>
          <ChangeIconInline
            currentIcon={formIcon}
            onIconSelected={handleIconSelected}
            colorScheme={currentColorScheme}
            iconSize={64}
          />

          <View style={accountModifyStyles.nameSection}>
            <Text variant="small" style={accountModifyStyles.label}>
              {t("accounts.form.namePlaceholder")}
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
                />
              )}
            />
            {errors.name && (
              <Text variant="small" style={accountModifyStyles.errorText}>
                {errors.name.message}
              </Text>
            )}
          </View>

          <View style={accountModifyStyles.balanceSection}>
            <Controller
              control={control}
              name="balance"
              render={({ field: { value, onChange } }) => (
                <SmartAmountInput
                  value={Number(value) || 0}
                  onChange={(v) => onChange(v)}
                  currencyCode={formCurrencyCode}
                  label={t("accounts.form.initialBalance")}
                  placeholder="0"
                  error={errors.balance?.message}
                />
              )}
            />
          </View>

          <View style={accountModifyStyles.settingsList}>
            <CurrencySelectorModal
              selectedCurrencyCode={formCurrencyCode}
              onCurrencySelected={handleCurrencySelected}
            />

            <AccountTypeInline
              selectedType={formType}
              onTypeSelected={(type) =>
                setValue("type", type, { shouldDirty: true })
              }
            />

            <ColorVariantInline
              selectedSchemeName={formColorSchemeName || undefined}
              onColorSelected={handleColorSelected}
              onClearSelection={handleColorCleared}
            />
          </View>

          <Separator />

          <View style={accountModifyStyles.switchesSection}>
            <Controller
              control={control}
              name="excludeFromBalance"
              render={({ field: { value, onChange } }) => (
                <Pressable
                  style={accountModifyStyles.switchRow}
                  onPress={() => onChange(!value)}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: value }}
                >
                  <View style={accountModifyStyles.switchLeft}>
                    <IconSymbol name="eye-off" size={24} />
                    <Text
                      variant="default"
                      style={accountModifyStyles.switchLabel}
                    >
                      Exclude from balance
                    </Text>
                  </View>

                  <View pointerEvents="none">
                    <Switch value={value} />
                  </View>
                </Pressable>
              )}
            />

            {!isAddMode && (
              <View style={accountModifyStyles.primaryAccountBlock}>
                <Controller
                  control={control}
                  name="isPrimary"
                  render={({ field: { value, onChange } }) => (
                    <Pressable
                      style={accountModifyStyles.switchRow}
                      onPress={() => {
                        const next = !value
                        if (next)
                          setValue("isArchived", false, { shouldDirty: true })
                        onChange(next)
                      }}
                      accessibilityRole="switch"
                      accessibilityState={{ checked: value }}
                    >
                      <View style={accountModifyStyles.switchLeft}>
                        <IconSymbol name="star" size={24} />
                        <Text
                          variant="default"
                          style={accountModifyStyles.switchLabel}
                        >
                          Primary account
                        </Text>
                      </View>

                      <View pointerEvents="none">
                        <Switch value={value} />
                      </View>
                    </Pressable>
                  )}
                />
                {formIsPrimary && (
                  <View style={accountModifyStyles.primaryAccountHintContainer}>
                    <IconSymbol
                      name="information"
                      style={accountModifyStyles.primaryAccountHintIcon}
                      size={14}
                    />
                    <Text
                      variant="small"
                      style={accountModifyStyles.primaryAccountHint}
                    >
                      This account will be used as the default account for new
                      transactions and other actions.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {!isAddMode && (
              <Controller
                control={control}
                name="isArchived"
                render={({ field: { value, onChange } }) => (
                  <Pressable
                    style={accountModifyStyles.switchRow}
                    onPress={() => {
                      const next = !value
                      if (next)
                        setValue("isPrimary", false, { shouldDirty: true })
                      onChange(next)
                    }}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: value }}
                  >
                    <View style={accountModifyStyles.switchLeft}>
                      <IconSymbol name="archive-arrow-down" size={24} />
                      <Text
                        variant="default"
                        style={accountModifyStyles.switchLabel}
                      >
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

          {!isAddMode && <Separator />}
        </View>

        {!isAddMode && (
          <View style={accountModifyStyles.deleteSection}>
            {account?.isArchived ? (
              <Button
                variant="ghost"
                onPress={() => setDeleteModalVisible(true)}
                style={accountModifyStyles.actionButton}
              >
                <IconSymbol
                  name="trash-can"
                  size={20}
                  style={accountModifyStyles.deleteIcon}
                />
                <Text variant="default" style={accountModifyStyles.deleteText}>
                  Permanently delete Account
                </Text>
              </Button>
            ) : (
              <View style={accountModifyStyles.archiveContainer}>
                <IconSymbol
                  name="information"
                  style={accountModifyStyles.archiveWarningIcon}
                  size={14}
                />

                <Text
                  variant="small"
                  style={accountModifyStyles.archiveWarning}
                >
                  You can permanently delete the account with its transactions
                  after you archive the account for safety measures.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollIntoViewProvider>

      <View style={accountModifyStyles.actions}>
        <Button
          variant="outline"
          onPress={handleGoBack}
          style={accountModifyStyles.button}
        >
          <Text variant="default" style={accountModifyStyles.cancelText}>
            Cancel
          </Text>
        </Button>
        <Button
          variant="default"
          onPress={handleSubmit}
          style={accountModifyStyles.button}
          disabled={
            !formName.trim() || (!isAddMode && !isDirty) || isSubmitting
          }
        >
          <Text variant="default" style={accountModifyStyles.saveText}>
            {isSubmitting ? "Saving..." : isAddMode ? "Create" : "Save Changes"}
          </Text>
        </Button>
      </View>

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
        title={t("common.modals.closeWithoutSaving")}
        description="All changes will be lost."
        confirmLabel="Discard"
        cancelLabel={t("common.actions.cancel")}
        variant="default"
      />
    </View>
  )
}
