import { zodResolver } from "@hookform/resolvers/zod"
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useNavigation, useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Modal, Platform } from "react-native"
import { useUnistyles } from "react-native-unistyles"

import { ChangeIconInline } from "~/components/change-icon-inline"
import { ColorVariantInline } from "~/components/color-variant-inline"
import { CurrencyAccountSelector } from "~/components/currency-account-selector"
import { SmartAmountInput } from "~/components/smart-amount-input"
import { Button } from "~/components/ui/button"
import { IconSvg } from "~/components/ui/icon-svg"
import { Input } from "~/components/ui/input"
import { Pressable } from "~/components/ui/pressable"
import { Separator } from "~/components/ui/separator"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { ScrollIntoViewProvider } from "~/contexts/scroll-into-view-context"
import {
  archiveGoal,
  createGoal,
  destroyGoal,
  unarchiveGoal,
  updateGoal,
} from "~/database/services/goal-service"
import { useNavigationGuard } from "~/hooks/use-navigation-guard"
import type { TranslationKey } from "~/i18n/config"
import { type AddGoalFormSchema, addGoalSchema } from "~/schemas/goals.schema"
import { getThemeStrict } from "~/styles/theme/registry"
import { NewEnum } from "~/types/new"
import { logger } from "~/utils/logger"
import { Toast } from "~/utils/toast"

import { GoalFormFooter } from "./goal-form-footer"
import { GoalFormModals } from "./goal-form-modals"
import { goalModifyStyles } from "./goal-modify.styles"
import type { GoalModifyContentProps } from "./types"

export function GoalModifyContent({
  goalModifyId,
  goal,
  goalModel,
  accounts,
}: GoalModifyContentProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const { theme } = useUnistyles()

  const isAddMode = goalModifyId === NewEnum.NEW || !goalModifyId

  const handleGoBack = useCallback(() => {
    router.back()
  }, [router])

  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { errors, isDirty, isSubmitting },
    watch,
    setValue,
  } = useForm<AddGoalFormSchema>({
    resolver: zodResolver(addGoalSchema),
    defaultValues: {
      name: goal?.name ?? "",
      description: goal?.description ?? null,
      icon: goal?.icon ?? "target",
      colorSchemeName: goal?.colorSchemeName ?? undefined,
      currencyCode: goal?.currencyCode ?? "",
      accountIds: goal?.accountIds ?? [],
      targetAmount: goal?.targetAmount ?? 0,
      targetDate: goal?.targetDate ? goal.targetDate.getTime() : null,
      isCompleted: goal?.isCompleted ?? false,
    },
  })

  const formName = watch("name")
  const formIcon = watch("icon")
  const formColorSchemeName = watch("colorSchemeName")
  const formCurrencyCode = watch("currencyCode")
  const formAccountIds = watch("accountIds")
  const formTargetDate = watch("targetDate")

  const navigation = useNavigation()

  const [unsavedModalVisible, setUnsavedModalVisible] = useState(false)
  const { confirmNavigation, allowNavigation } = useNavigationGuard({
    navigation,
    when: isDirty && !isSubmitting,
    onConfirm: handleGoBack,
    onBlock: () => setUnsavedModalVisible(true),
  })

  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [archiveModalVisible, setArchiveModalVisible] = useState(false)
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  // Temp date used while the iOS date picker is open before confirmation
  const [tempDate, setTempDate] = useState<Date>(
    formTargetDate ? new Date(formTargetDate) : new Date(),
  )

  const onSubmit = async (data: AddGoalFormSchema) => {
    const trimmedName = data.name.trim()

    try {
      if (isAddMode) {
        await createGoal({
          ...data,
          name: trimmedName,
        })

        allowNavigation()
        handleGoBack()
      } else {
        if (!goalModel) {
          Toast.error({
            title: t("common.toast.error"),
            description: t(
              "screens.settings.goals.form.toast.notFound" as TranslationKey,
            ),
          })
          return
        }

        await updateGoal(goalModel, {
          ...data,
          name: trimmedName,
        })

        allowNavigation()
        handleGoBack()
      }
    } catch (error) {
      logger.error("Error saving goal", { error })
      Toast.error({
        title: t("common.toast.error"),
        description: isAddMode
          ? t(
              "screens.settings.goals.form.toast.createFailed" as TranslationKey,
            )
          : t(
              "screens.settings.goals.form.toast.updateFailed" as TranslationKey,
            ),
      })
    }
  }

  const handleSubmit = handleFormSubmit(onSubmit)

  const handleDelete = async () => {
    try {
      if (!goalModel || !goal) {
        Toast.error({
          title: t("common.toast.error"),
          description: t(
            "screens.settings.goals.form.toast.notFound" as TranslationKey,
          ),
        })
        return
      }

      await destroyGoal(goalModel)

      allowNavigation()
      // Dismiss 2 levels: the edit screen and the goal detail screen
      router.dismiss(2)
    } catch (error) {
      logger.error("Error deleting goal", { error })
      Toast.error({
        title: t("common.toast.error"),
        description: t(
          "screens.settings.goals.form.toast.deleteFailed" as TranslationKey,
        ),
      })
    }
  }

  const handleArchive = async () => {
    try {
      if (!goalModel || !goal) return
      if (goal.isArchived) {
        await unarchiveGoal(goalModel)
        Toast.success({
          title: t("screens.settings.goals.unarchiveSuccess" as TranslationKey),
        })
      } else {
        await archiveGoal(goalModel)
        Toast.success({
          title: t("screens.settings.goals.archiveSuccess" as TranslationKey),
        })
      }
      allowNavigation()
      router.back()
    } catch (error) {
      logger.error("Error archiving goal", { error })
      Toast.error({ title: t("common.toast.error") })
    }
  }

  const handleIconSelected = (icon: string | null) => {
    setValue("icon", icon, { shouldDirty: true })
  }

  const handleColorSelected = (schemeName: string) => {
    setValue("colorSchemeName", schemeName, { shouldDirty: true })
  }

  const handleColorCleared = () => {
    setValue("colorSchemeName", undefined, { shouldDirty: true })
  }

  const handleDatePickerChange = (_evt: DateTimePickerEvent, date?: Date) => {
    if (date) {
      // On Android, the picker resolves immediately; on iOS we wait for confirm
      if (Platform.OS === "android") {
        setValue("targetDate", date.getTime(), { shouldDirty: true })
        setDatePickerVisible(false)
      } else {
        setTempDate(date)
      }
    } else if (Platform.OS === "android") {
      // User dismissed the Android picker without selecting
      setDatePickerVisible(false)
    }
  }

  const handleDatePickerConfirm = () => {
    setValue("targetDate", tempDate.getTime(), { shouldDirty: true })
    setDatePickerVisible(false)
  }

  const handleDatePickerCancel = () => {
    setDatePickerVisible(false)
  }

  const handleOpenDatePicker = () => {
    // Reset the temp date to the current value before opening
    setTempDate(formTargetDate ? new Date(formTargetDate) : new Date())
    setDatePickerVisible(true)
  }

  const handleClearDate = () => {
    setValue("targetDate", null, { shouldDirty: true })
  }

  const currentColorScheme = getThemeStrict(formColorSchemeName)

  const formattedTargetDate = formTargetDate
    ? new Date(formTargetDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null

  if (!isAddMode && !goal) {
    return (
      <View style={goalModifyStyles.container}>
        <View style={goalModifyStyles.loadingContainer}>
          <Text variant="default">
            {t("screens.settings.goals.form.loadingText" as TranslationKey)}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={goalModifyStyles.container}>
      <ScrollIntoViewProvider
        scrollViewStyle={goalModifyStyles.scrollView}
        contentContainerStyle={goalModifyStyles.scrollContent}
      >
        <View style={goalModifyStyles.form} key={goal?.id ?? NewEnum.NEW}>
          {/* Icon picker */}
          <ChangeIconInline
            currentIcon={formIcon}
            onIconSelected={handleIconSelected}
            colorScheme={currentColorScheme}
          />

          {/* Name input */}
          <View style={goalModifyStyles.nameSection}>
            <Text variant="small" style={goalModifyStyles.label}>
              {t("screens.settings.goals.form.nameLabel" as TranslationKey)}
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t(
                    "screens.settings.goals.form.namePlaceholder" as TranslationKey,
                  )}
                  error={!!errors.name}
                />
              )}
            />
            {errors.name && (
              <Text variant="small" style={goalModifyStyles.errorText}>
                {t(errors.name.message as TranslationKey)}
              </Text>
            )}
          </View>

          {/* Description input (optional, multiline) */}
          <View style={goalModifyStyles.descriptionSection}>
            <Text variant="small" style={goalModifyStyles.label}>
              {t(
                "screens.settings.goals.form.descriptionLabel" as TranslationKey,
              )}
            </Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value ?? ""}
                  onChangeText={(text) => onChange(text || null)}
                  onBlur={onBlur}
                  placeholder={t(
                    "screens.settings.goals.form.descriptionPlaceholder" as TranslationKey,
                  )}
                  multiline
                  numberOfLines={3}
                />
              )}
            />
          </View>

          {/* Settings list: ColorVariant, CurrencyAccountSelector, TargetAmount, TargetDate */}
          <View style={goalModifyStyles.settingsList}>
            <ColorVariantInline
              selectedSchemeName={formColorSchemeName ?? undefined}
              onColorSelected={handleColorSelected}
              onClearSelection={handleColorCleared}
            />

            <CurrencyAccountSelector
              accounts={accounts}
              selectedCurrency={formCurrencyCode || null}
              selectedAccountIds={formAccountIds}
              onCurrencyChange={(code) => {
                setValue("currencyCode", code, { shouldDirty: true })
              }}
              onAccountIdsChange={(ids) => {
                setValue("accountIds", ids, { shouldDirty: true })
              }}
            />
          </View>

          {/* Target amount */}
          <View style={goalModifyStyles.targetAmountSection}>
            <Controller
              control={control}
              name="targetAmount"
              render={({ field: { onChange, value } }) => (
                <SmartAmountInput
                  value={value}
                  onChange={onChange}
                  currencyCode={formCurrencyCode || undefined}
                  label={t(
                    "screens.settings.goals.form.targetAmountLabel" as TranslationKey,
                  )}
                  error={
                    errors.targetAmount
                      ? t(errors.targetAmount.message as TranslationKey)
                      : undefined
                  }
                />
              )}
            />
          </View>

          {/* Target date — Pressable row that opens a date picker modal */}
          <Pressable
            style={goalModifyStyles.targetDateSettingsRow}
            onPress={handleOpenDatePicker}
            accessibilityRole="button"
          >
            <View style={goalModifyStyles.targetDateLeft}>
              <IconSvg name="calendar" size={24} />
              <Text variant="default" style={goalModifyStyles.switchLabel}>
                {t(
                  "screens.settings.goals.form.targetDateLabel" as TranslationKey,
                )}
              </Text>
            </View>
            <View style={goalModifyStyles.targetDateRight}>
              {formattedTargetDate ? (
                <>
                  <Text
                    variant="default"
                    style={goalModifyStyles.targetDateText}
                  >
                    {formattedTargetDate}
                  </Text>
                  <Pressable
                    onPress={handleClearDate}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityRole="button"
                    accessibilityLabel={t("common.actions.clear")}
                  >
                    <IconSvg
                      name="x"
                      size={20}
                      color={theme.colors.onSecondary}
                    />
                  </Pressable>
                </>
              ) : (
                <Text
                  variant="default"
                  style={goalModifyStyles.targetDatePlaceholder}
                >
                  {t(
                    "screens.settings.goals.card.noDeadline" as TranslationKey,
                  )}
                </Text>
              )}
            </View>
          </Pressable>

          {!isAddMode && <Separator />}
        </View>

        {/* Archive / delete buttons — edit mode only */}
        {!isAddMode && (
          <View style={goalModifyStyles.deleteSection}>
            <Button
              variant="ghost"
              onPress={() => setArchiveModalVisible(true)}
              style={goalModifyStyles.actionButton}
            >
              <IconSvg
                name={goal?.isArchived ? "archive-off" : "archive"}
                size={20}
                color={goalModifyStyles.archiveIcon.color}
              />
              <Text variant="default" style={goalModifyStyles.archiveText}>
                {goal?.isArchived
                  ? t(
                      "screens.settings.goals.form.unarchiveLabel" as TranslationKey,
                    )
                  : t(
                      "screens.settings.goals.form.archiveLabel" as TranslationKey,
                    )}
              </Text>
            </Button>
            <Button
              variant="ghost"
              onPress={() => setDeleteModalVisible(true)}
              style={goalModifyStyles.actionButton}
            >
              <IconSvg
                name="trash"
                size={20}
                color={goalModifyStyles.deleteIcon.color}
              />
              <Text variant="default" style={goalModifyStyles.deleteText}>
                {t("screens.settings.goals.form.deleteLabel" as TranslationKey)}
              </Text>
            </Button>
          </View>
        )}
      </ScrollIntoViewProvider>

      <GoalFormFooter
        formName={formName}
        isAddMode={isAddMode}
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onCancel={handleGoBack}
        onSave={handleSubmit}
      />

      <GoalFormModals
        deleteModalVisible={deleteModalVisible}
        archiveModalVisible={archiveModalVisible}
        unsavedModalVisible={unsavedModalVisible}
        isAddMode={isAddMode}
        goal={goal}
        onCloseDeleteModal={() => setDeleteModalVisible(false)}
        onCloseArchiveModal={() => setArchiveModalVisible(false)}
        onCloseUnsavedModal={() => setUnsavedModalVisible(false)}
        onConfirmDelete={handleDelete}
        onConfirmArchive={handleArchive}
        onDiscardAndNavigate={() => {
          setUnsavedModalVisible(false)
          confirmNavigation()
        }}
      />

      {/* Target date picker modal — iOS uses a slide-up sheet; Android uses native picker */}
      {Platform.OS === "ios" && datePickerVisible && (
        <Modal
          visible
          transparent
          animationType="slide"
          onRequestClose={handleDatePickerCancel}
          accessibilityViewIsModal
        >
          <Pressable
            style={goalModifyStyles.datePickerOverlay}
            onPress={handleDatePickerCancel}
          />
          <View
            style={[
              goalModifyStyles.datePickerModal,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View
              style={[
                goalModifyStyles.datePickerHeader,
                {
                  borderBottomColor: `${theme.colors.onSurface}20`,
                },
              ]}
            >
              <Pressable
                onPress={handleDatePickerCancel}
                style={goalModifyStyles.datePickerCancel}
              >
                <Text
                  style={[
                    goalModifyStyles.datePickerCancelText,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {t("common.actions.cancel")}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleDatePickerConfirm}
                style={goalModifyStyles.datePickerDone}
              >
                <Text
                  style={[
                    goalModifyStyles.datePickerDoneText,
                    { color: theme.colors.primary },
                  ]}
                >
                  {t("common.actions.done")}
                </Text>
              </Pressable>
            </View>
            <View style={goalModifyStyles.datePickerBody}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDatePickerChange}
                textColor={theme.colors.onSurface}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Android uses an inline modal picker */}
      {Platform.OS === "android" && datePickerVisible && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleDatePickerChange}
        />
      )}
    </View>
  )
}
