/**
 * Transaction form v1 — UX improvements:
 * - Inline validation (field-level errors)
 * - Save state (loader, disabled buttons)
 * - Reset via useMemo defaultValues + useLayoutEffect (no useEffect chains)
 * - tempDate set in openDatePicker; type/tags via defaultValues and callbacks
 * - Improved UX copy (contextual errors, button labels)
 */

import { zodResolver } from "@hookform/resolvers/zod"
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker"
import { format } from "date-fns"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Controller, type Resolver, useForm } from "react-hook-form"
import { ActivityIndicator, Modal, Platform, ScrollView } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { useBottomSheet } from "~/components/bottom-sheet"
import { CalculatorSheet } from "~/components/calculator-sheet"
import { DynamicIcon } from "~/components/dynamic-icon"
import { KeyboardStickyViewMinty } from "~/components/keyboard-sticky-view-minty"
import { AccountSheet } from "~/components/transaction/account-sheet"
import { CategorySheet } from "~/components/transaction/category-sheet"
import { NotesModal } from "~/components/transaction/notes-modal"
import { TagSheet } from "~/components/transaction/tag-sheet"
import { TransactionTypeSelector } from "~/components/transaction/transaction-type-selector"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Input } from "~/components/ui/input"
import { Money } from "~/components/ui/money"
import { Pressable } from "~/components/ui/pressable"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type TransactionModel from "~/database/models/Transaction"
import {
  createTransactionModel,
  updateTransactionModel,
} from "~/database/services/transaction-service"
import { transactionSchema } from "~/schemas/transactions.schema"
import { getThemeStrict } from "~/styles/theme/registry"
import type { Account } from "~/types/accounts"
import type { Category } from "~/types/categories"
import { NewEnum } from "~/types/new"
import type { Tag } from "~/types/tags"
import type { RecurringFrequency, TransactionType } from "~/types/transactions"
import { logger } from "~/utils/logger"
import { Toast } from "~/utils/toast"

const SHEET_ID_PREFIX = "transaction-v2-"
const CALCULATOR_SHEET_ID = `${SHEET_ID_PREFIX}amount`
const TAG_SHEET_ID = `${SHEET_ID_PREFIX}tags`
const ACCOUNT_SHEET_ID = `${SHEET_ID_PREFIX}account`
const CATEGORY_SHEET_ID = `${SHEET_ID_PREFIX}category`

const RECURRING_OPTIONS: { id: RecurringFrequency; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "biweekly", label: "Biweekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
]

type DatePickerTarget = "transaction" | "recurringStart" | "recurringEnd"

function getRecurrenceDisplayLabel(
  frequency: RecurringFrequency,
  startDate: Date,
): string {
  if (frequency === null) return "None"
  switch (frequency) {
    case "daily":
      return "Every day"
    case "weekly":
      return `Every week, ${format(startDate, "EEEE")}`
    case "biweekly":
      return `Every 2 weeks, ${format(startDate, "EEEE")}`
    case "monthly":
      return `Every month, ${format(startDate, "do")}`
    case "yearly":
      return `Every year, ${format(startDate, "MMMM d")}`
    default:
      return "None"
  }
}

type TransactionFormInput = {
  amount: number
  type: TransactionType
  date: Date
  accountId: string
  categoryId?: string | null
  title?: string
  description?: string
  isPending?: boolean
  tags?: string[]
}

function getDefaultValues(
  transaction: TransactionModel | null,
  accounts: Account[],
  transactionType: TransactionType,
  initialTagIds: string[] = [],
): TransactionFormInput {
  const defaultAccountId =
    accounts.find((a) => a.isPrimary)?.id ?? accounts[0]?.id ?? ""
  if (!transaction) {
    return {
      amount: 0,
      type: transactionType,
      date: new Date(),
      accountId: defaultAccountId,
      categoryId: null,
      title: "",
      description: "",
      isPending: false,
      tags: [],
    }
  }
  return {
    amount: transaction.amount,
    type: (transaction.type as TransactionType) ?? transactionType,
    date: transaction.transactionDate,
    accountId: transaction.accountId,
    categoryId: transaction.categoryId,
    title: transaction.title ?? "",
    description: transaction.description ?? "",
    isPending: transaction.isPending,
    tags: initialTagIds,
  }
}

/** Contextual error messages (recommendation 8) */
function getFieldError(
  field: keyof TransactionFormInput,
  message: string | undefined,
): string | undefined {
  if (!message) return undefined
  if (field === "accountId")
    return "Please choose an account to save this transaction."
  if (field === "amount") return "Enter an amount greater than 0."
  return message
}

interface TransactionFormProps {
  transaction: TransactionModel | null
  accounts: Account[]
  categories: Category[]
  tags: Tag[]
  transactionType: TransactionType
  onTransactionTypeChange: (type: TransactionType) => void
  initialTagIds?: string[]
}

export function TransactionForm({
  transaction,
  accounts,
  categories,
  tags,
  transactionType,
  onTransactionTypeChange,
  initialTagIds = [],
}: TransactionFormProps) {
  const router = useRouter()
  const { theme } = useUnistyles()
  const { id } = useLocalSearchParams<{ id: string }>()
  const isNew = id === NewEnum.NEW

  const calculatorSheet = useBottomSheet(CALCULATOR_SHEET_ID)
  const tagSheet = useBottomSheet(TAG_SHEET_ID)
  const accountSheet = useBottomSheet(ACCOUNT_SHEET_ID)
  const categorySheet = useBottomSheet(CATEGORY_SHEET_ID)

  const defaultValues = useMemo(
    () =>
      getDefaultValues(transaction, accounts, transactionType, initialTagIds),
    [transaction?.id, transaction, accounts, transactionType, initialTagIds],
  )

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionFormInput>({
    resolver: zodResolver(transactionSchema) as Resolver<TransactionFormInput>,
    defaultValues,
  })

  useLayoutEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const amount = watch("amount")
  const accountId = watch("accountId")
  const categoryId = watch("categoryId")
  const date = watch("date")
  const description = watch("description")
  const tagIds = watch("tags")

  const [isSaving, setIsSaving] = useState(false)
  const [notesModalVisible, setNotesModalVisible] = useState(false)
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const [datePickerMode, setDatePickerMode] = useState<"date" | "time">("date")
  const [tempDate, setTempDate] = useState(date)

  const [recurringFrequency, setRecurringFrequency] =
    useState<RecurringFrequency>(null)
  const [recurringEnabled, setRecurringEnabled] = useState(false)
  const [recurringStartDate, setRecurringStartDate] = useState<Date>(
    () => new Date(),
  )
  const [recurringEndDate, setRecurringEndDate] = useState<Date | null>(null)
  const datePickerTargetRef = useRef<DatePickerTarget>("transaction")

  const selectedAccount = accounts.find((a) => a.id === accountId)
  const selectedCategory = categories.find((c) => c.id === categoryId)
  const selectedTags = tags.filter((t) => (tagIds ?? []).includes(t.id))
  const signedAmount =
    transactionType === "expense" ? -(amount || 0) : amount || 0

  const openDatePicker = useCallback(
    (target: DatePickerTarget = "transaction") => {
      datePickerTargetRef.current = target
      const current =
        target === "recurringStart"
          ? recurringStartDate
          : target === "recurringEnd"
            ? (recurringEndDate ?? new Date())
            : watch("date")
      setTempDate(current)
      if (Platform.OS === "android") {
        DateTimePickerAndroid.open({
          value: current,
          mode: "date",
          onChange: (_evt, selectedDate) => {
            if (selectedDate && _evt.type === "set") {
              setTempDate(selectedDate)
              DateTimePickerAndroid.open({
                value: selectedDate,
                mode: "time",
                onChange: (evt, timeDate) => {
                  if (timeDate && evt.type === "set") {
                    const t = datePickerTargetRef.current
                    if (t === "recurringStart") setRecurringStartDate(timeDate)
                    else if (t === "recurringEnd") setRecurringEndDate(timeDate)
                    else setValue("date", timeDate)
                  }
                },
              })
            }
          },
        })
      } else {
        setDatePickerMode("date")
        setDatePickerVisible(true)
      }
    },
    [watch, setValue, recurringStartDate, recurringEndDate],
  )

  const handleIosDateChange = useCallback(
    (_evt: DateTimePickerEvent, selectedDate?: Date) => {
      if (selectedDate) setTempDate(selectedDate)
    },
    [],
  )

  const confirmIosDate = useCallback(() => {
    if (datePickerMode === "time") {
      const t = datePickerTargetRef.current
      if (t === "recurringStart") setRecurringStartDate(tempDate)
      else if (t === "recurringEnd") setRecurringEndDate(tempDate)
      else setValue("date", tempDate)
      setDatePickerVisible(false)
    } else {
      setDatePickerMode("time")
    }
  }, [datePickerMode, tempDate, setValue])

  const onSubmit = async (data: TransactionFormInput) => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const payload = {
        amount: data.amount,
        currency: selectedAccount?.currencyCode ?? "USD",
        type: data.type,
        date: data.date,
        categoryId: data.categoryId ?? null,
        accountId: data.accountId,
        title: data.title,
        description: data.description,
        isPending: data.isPending ?? false,
        tags: data.tags ?? [],
        location: "",
        extra: {},
        subtype: "",
      }
      if (isNew) {
        await createTransactionModel(payload)
        Toast.success({ title: "Transaction created" })
      } else if (transaction) {
        await updateTransactionModel(transaction, payload)
        Toast.success({ title: "Transaction updated" })
      }
      router.back()
    } catch (error) {
      logger.error("Failed to save transaction", { error })
      Toast.error({ title: "Failed to save transaction" })
    } finally {
      setIsSaving(false)
    }
  }

  const amountError = getFieldError("amount", errors.amount?.message)
  const accountError = getFieldError("accountId", errors.accountId?.message)
  const titleError = errors.title?.message
  const descriptionError = errors.description?.message

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TransactionTypeSelector
          value={transactionType}
          onChange={(type) => {
            onTransactionTypeChange(type)
            setValue("type", type, { shouldDirty: true })
          }}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View style={styles.nameSection}>
            <Controller
              control={control}
              name="title"
              render={({ field: { value, onChange } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder="Untitled transaction"
                  placeholderTextColor={theme.colors.customColors.semi}
                />
              )}
            />
            {titleError ? (
              <Text style={styles.fieldError}>{titleError}</Text>
            ) : null}
          </View>

          <View style={styles.balanceSection}>
            <Pressable
              style={styles.balanceContainer}
              onPress={() => calculatorSheet.present()}
              accessibilityLabel="Set amount"
              accessibilityHint="Opens calculator to enter amount"
            >
              <Money
                value={signedAmount}
                currency={selectedAccount?.currencyCode}
                tone="auto"
                style={styles.balanceValue}
              />
              <Text variant="muted" style={styles.updateBalanceLabel}>
                Tap to set amount
              </Text>
            </Pressable>
            {amountError ? (
              <Text style={styles.fieldError}>{amountError}</Text>
            ) : null}
          </View>

          <View style={styles.settingsList}>
            <View style={styles.fieldBlock}>
              <Text variant="small" style={styles.label}>
                Account
              </Text>
              <Pressable
                style={[
                  styles.settingsRow,
                  accountError ? styles.settingsRowError : null,
                ]}
                onPress={() => accountSheet.present()}
                accessibilityLabel="Select account"
                accessibilityHint="Opens account selection sheet"
              >
                {selectedAccount ? (
                  <DynamicIcon
                    icon={selectedAccount.icon || "wallet-bifold"}
                    size={20}
                    colorScheme={getThemeStrict(
                      selectedAccount.colorSchemeName,
                    )}
                    variant="badge"
                  />
                ) : (
                  <DynamicIcon
                    icon="credit-card"
                    size={20}
                    color={theme.colors.primary}
                    variant="badge"
                  />
                )}
                {selectedAccount ? (
                  <View style={styles.accountRowContent}>
                    <Text
                      variant="default"
                      style={styles.fieldValue}
                      numberOfLines={1}
                    >
                      {selectedAccount.name}
                    </Text>
                    <Money
                      value={selectedAccount.balance}
                      currency={selectedAccount.currencyCode}
                      style={styles.accountRowBalance}
                    />
                  </View>
                ) : (
                  <Text
                    variant="default"
                    style={styles.fieldPlaceholder}
                    numberOfLines={1}
                  >
                    Select an account
                  </Text>
                )}
                <IconSymbol
                  name="chevron-right"
                  size={20}
                  style={styles.chevronIcon}
                />
              </Pressable>
              {accountError ? (
                <Text style={styles.fieldError}>{accountError}</Text>
              ) : null}
            </View>

            <View style={styles.fieldBlock}>
              <Text variant="small" style={styles.label}>
                Category
              </Text>
              <Pressable
                style={styles.settingsRow}
                onPress={() => categorySheet.present()}
                accessibilityLabel="Select category"
                accessibilityHint="Opens category selection sheet"
              >
                {selectedCategory ? (
                  <DynamicIcon
                    icon={selectedCategory.icon || "shape"}
                    size={20}
                    colorScheme={getThemeStrict(
                      selectedCategory.colorSchemeName,
                    )}
                    variant="badge"
                  />
                ) : (
                  <DynamicIcon
                    icon="shape"
                    size={20}
                    color={theme.colors.primary}
                    variant="badge"
                  />
                )}
                <Text
                  variant="default"
                  style={
                    selectedCategory
                      ? styles.fieldValue
                      : styles.fieldPlaceholder
                  }
                  numberOfLines={1}
                >
                  {selectedCategory
                    ? selectedCategory.name
                    : "Select a category"}
                </Text>
                {!selectedCategory && (
                  <IconSymbol
                    name="chevron-right"
                    size={20}
                    style={styles.chevronIcon}
                  />
                )}
              </Pressable>
            </View>

            <View style={styles.fieldBlock}>
              <Text variant="small" style={styles.label}>
                Tags
              </Text>
              <Pressable
                style={styles.tagsTouchable}
                onPress={() => tagSheet.present()}
                accessibilityLabel="Edit tags"
                accessibilityHint="Opens tag selection sheet"
              >
                {selectedTags.length > 0 ? (
                  <View style={styles.tagsPillsWrap}>
                    <View style={styles.tagPillsRow}>
                      {selectedTags.map((t) => (
                        <View key={t.id} style={styles.tagPill}>
                          <DynamicIcon
                            icon={t.icon || "tag"}
                            size={18}
                            colorScheme={getThemeStrict(t.colorSchemeName)}
                            variant="badge"
                          />
                          <Text
                            variant="default"
                            style={styles.tagPillText}
                            numberOfLines={1}
                          >
                            {t.name}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.tagEditHintRow}>
                      <IconSymbol
                        name="information"
                        size={14}
                        style={styles.tagEditHintIcon}
                      />
                      <Text variant="muted" style={styles.tagEditHint}>
                        Tap to edit the tags
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.settingsRow}>
                    <DynamicIcon
                      icon="tag"
                      size={20}
                      color={theme.colors.primary}
                      variant="badge"
                    />
                    <Text
                      variant="default"
                      style={styles.fieldPlaceholder}
                      numberOfLines={1}
                    >
                      Add tags
                    </Text>
                    <IconSymbol
                      name="chevron-right"
                      size={20}
                      style={styles.chevronIcon}
                    />
                  </View>
                )}
              </Pressable>
            </View>

            <View style={styles.fieldBlock}>
              <Text variant="small" style={styles.label}>
                Notes
              </Text>
              <Pressable
                style={styles.settingsRow}
                onPress={() => setNotesModalVisible(true)}
                accessibilityLabel="Add notes"
                accessibilityHint="Opens notes modal"
              >
                <DynamicIcon
                  icon="clipboard"
                  size={20}
                  color={theme.colors.primary}
                  variant="badge"
                />
                <Text
                  variant="default"
                  style={
                    description ? styles.fieldValue : styles.fieldPlaceholder
                  }
                  numberOfLines={1}
                >
                  {description || "Add notes"}
                </Text>
                <IconSymbol
                  name="chevron-right"
                  size={20}
                  style={styles.chevronIcon}
                />
              </Pressable>
              {descriptionError ? (
                <Text style={styles.fieldError}>{descriptionError}</Text>
              ) : null}
            </View>

            <View style={styles.fieldBlock}>
              <Text variant="small" style={styles.label}>
                Transaction date & time
              </Text>
              <Pressable
                style={styles.settingsRow}
                onPress={() => openDatePicker("transaction")}
              >
                <DynamicIcon
                  icon="calendar"
                  size={20}
                  color={theme.colors.primary}
                  variant="badge"
                />
                <Text
                  variant="default"
                  style={styles.fieldValue}
                  numberOfLines={1}
                >
                  {format(date, "MMMM d yyyy hh:mm a")}
                </Text>
                <IconSymbol
                  name="chevron-right"
                  size={20}
                  style={styles.chevronIcon}
                />
              </Pressable>
            </View>

            <Controller
              control={control}
              name="isPending"
              render={({ field: { value, onChange } }) => (
                <Pressable
                  style={styles.switchRow}
                  onPress={() => onChange(!(value ?? false))}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: value ?? false }}
                >
                  <View style={styles.switchLeft}>
                    <DynamicIcon icon="clock" size={20} />
                    <Text variant="default" style={styles.switchLabel}>
                      Pending
                    </Text>
                  </View>
                  <View pointerEvents="none">
                    <Switch value={value ?? false} onValueChange={onChange} />
                  </View>
                </Pressable>
              )}
            />

            <View style={styles.fieldBlock}>
              <Pressable
                style={styles.recurringSwitchRow}
                onPress={() => {
                  const next = !recurringEnabled
                  setRecurringEnabled(next)
                  if (next) {
                    setRecurringStartDate(new Date())
                    setRecurringFrequency("daily")
                  } else {
                    setRecurringFrequency(null)
                    setRecurringStartDate(new Date())
                    setRecurringEndDate(null)
                  }
                }}
                accessibilityRole="switch"
                accessibilityState={{ checked: recurringEnabled }}
              >
                <View style={styles.switchLeft}>
                  <DynamicIcon
                    icon="swap-horizontal"
                    size={20}
                    color={theme.colors.primary}
                    variant="badge"
                  />
                  <Text variant="default" style={styles.switchLabel}>
                    Recurring transaction
                  </Text>
                </View>
                <View pointerEvents="none">
                  <Switch
                    value={recurringEnabled}
                    onValueChange={(next) => {
                      setRecurringEnabled(next)
                      if (next) {
                        setRecurringStartDate(new Date())
                        setRecurringFrequency("daily")
                      } else {
                        setRecurringFrequency(null)
                        setRecurringStartDate(new Date())
                        setRecurringEndDate(null)
                      }
                    }}
                  />
                </View>
              </Pressable>

              {recurringEnabled && (
                <>
                  <View style={styles.recurringSubSection}>
                    <Text variant="small" style={styles.recurringSubLabel}>
                      Recurrence
                    </Text>
                    <View style={styles.recurringToggleRow}>
                      {RECURRING_OPTIONS.map((option) => {
                        const isSelected = recurringFrequency === option.id
                        const displayLabel = getRecurrenceDisplayLabel(
                          option.id,
                          recurringStartDate,
                        )
                        return (
                          <Pressable
                            key={option.label}
                            style={[
                              styles.recurringToggleButton,
                              isSelected &&
                                styles.recurringToggleButtonSelected,
                            ]}
                            onPress={() => setRecurringFrequency(option.id)}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isSelected }}
                            accessibilityLabel={`${displayLabel}${isSelected ? ", selected" : ""}`}
                          >
                            <Text
                              variant="default"
                              style={[
                                styles.recurringToggleLabel,
                                isSelected &&
                                  styles.recurringToggleLabelSelected,
                              ]}
                              numberOfLines={1}
                            >
                              {displayLabel}
                            </Text>
                          </Pressable>
                        )
                      })}
                    </View>
                  </View>

                  <View style={styles.fieldBlock}>
                    <Text variant="small" style={styles.label}>
                      Starts on
                    </Text>
                    <Pressable
                      style={styles.settingsRow}
                      onPress={() => openDatePicker("recurringStart")}
                      accessibilityLabel="Recurring start date"
                      accessibilityHint="Opens date and time picker"
                    >
                      <DynamicIcon
                        icon="calendar"
                        size={20}
                        color={theme.colors.primary}
                        variant="badge"
                      />
                      <Text
                        variant="default"
                        style={styles.fieldValue}
                        numberOfLines={1}
                      >
                        {format(recurringStartDate, "MMMM d yyyy hh:mm a")}
                      </Text>
                      <IconSymbol
                        name="chevron-down"
                        size={20}
                        style={styles.chevronIcon}
                      />
                    </Pressable>
                  </View>

                  <View style={styles.fieldBlock}>
                    <Text variant="small" style={styles.label}>
                      Ends on
                    </Text>
                    <Pressable
                      style={styles.settingsRow}
                      onPress={() => openDatePicker("recurringEnd")}
                      accessibilityLabel="Recurring end date"
                      accessibilityHint="Opens date and time picker"
                    >
                      <DynamicIcon
                        icon="calendar"
                        size={20}
                        color={theme.colors.primary}
                        variant="badge"
                      />
                      <Text
                        variant="default"
                        style={
                          recurringEndDate
                            ? styles.fieldValue
                            : styles.fieldPlaceholder
                        }
                        numberOfLines={1}
                      >
                        {recurringEndDate
                          ? format(recurringEndDate, "MMMM d yyyy hh:mm a")
                          : "Never"}
                      </Text>
                      <IconSymbol
                        name="chevron-down"
                        size={20}
                        style={styles.chevronIcon}
                      />
                    </Pressable>
                    {recurringEndDate ? (
                      <Pressable
                        style={styles.endsOnNeverButton}
                        onPress={() => setRecurringEndDate(null)}
                      >
                        <Text
                          variant="small"
                          style={styles.endsOnNeverButtonText}
                        >
                          Set to Never
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <KeyboardStickyViewMinty>
        <View style={styles.footer}>
          <Button
            variant="secondary"
            size="lg"
            onPress={() => router.back()}
            style={styles.footerButton}
            disabled={isSaving}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Button>
          <Button
            variant="default"
            size="lg"
            onPress={handleSubmit(onSubmit)}
            style={styles.footerButton}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.onPrimary}
                style={styles.saveSpinner}
              />
            ) : (
              <Text style={styles.saveText}>{isNew ? "Create" : "Save"}</Text>
            )}
          </Button>
        </View>
      </KeyboardStickyViewMinty>

      <CalculatorSheet
        id={CALCULATOR_SHEET_ID}
        initialValue={amount}
        onSubmit={(value) => {
          setValue("amount", value, { shouldDirty: true })
          calculatorSheet.dismiss()
        }}
        currencyCode={selectedAccount?.currencyCode}
      />

      <AccountSheet
        id={ACCOUNT_SHEET_ID}
        accounts={accounts}
        selectedAccountId={accountId || null}
        onSelect={(id) => setValue("accountId", id)}
      />

      <CategorySheet
        id={CATEGORY_SHEET_ID}
        categories={categories}
        selectedCategoryId={categoryId ?? null}
        onSelect={(id) => setValue("categoryId", id)}
      />

      <TagSheet
        id={TAG_SHEET_ID}
        tags={tags}
        selectedTagIds={tagIds ?? []}
        onConfirm={(ids) => setValue("tags", ids)}
        onNewTag={() => {
          router.push({
            pathname: "/settings/tags/[tagId]",
            params: { tagId: NewEnum.NEW },
          })
        }}
      />

      <NotesModal
        visible={notesModalVisible}
        value={description ?? ""}
        onSave={(value) => setValue("description", value)}
        onRequestClose={() => setNotesModalVisible(false)}
      />

      {Platform.OS === "ios" && datePickerVisible && (
        <Modal
          visible
          transparent
          animationType="slide"
          onRequestClose={() => setDatePickerVisible(false)}
          accessibilityViewIsModal
        >
          <Pressable
            style={styles.datePickerOverlay}
            onPress={() => setDatePickerVisible(false)}
          />
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerHeader}>
              <Pressable
                onPress={() => setDatePickerVisible(false)}
                style={styles.datePickerCancel}
              >
                <Text style={styles.datePickerCancelText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={confirmIosDate} style={styles.datePickerDone}>
                <Text style={styles.datePickerDoneText}>
                  {datePickerMode === "date" ? "Next" : "Done"}
                </Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={tempDate}
              mode={datePickerMode}
              display="spinner"
              onChange={handleIosDateChange}
              textColor={theme.colors.onSurface}
            />
          </View>
        </Modal>
      )}
    </View>
  )
}

const H_PAD = 20
const FORM_GAP = 15
const ROW_PADDING_V = 10
const ROW_GAP = 10

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: H_PAD,
    paddingBottom: FORM_GAP,
  },
  content: {
    paddingBottom: 100,
  },
  form: {
    gap: FORM_GAP,
  },
  nameSection: {
    paddingHorizontal: H_PAD,
  },
  balanceSection: {
    paddingHorizontal: H_PAD,
  },
  balanceContainer: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.colors.radius,
    backgroundColor: theme.colors.secondary,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: "600",
    lineHeight: 48,
    padding: 0,
    textAlign: "center",
    textAlignVertical: "center",
    ...(Platform.OS === "android" && { includeFontPadding: false }),
  },
  updateBalanceLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.customColors.semi,
    marginTop: 4,
  },
  fieldError: {
    fontSize: 13,
    color: theme.colors.error,
    marginTop: 4,
    paddingHorizontal: H_PAD,
  },
  settingsList: {
    gap: 0,
  },
  fieldBlock: {
    marginBottom: FORM_GAP,
  },
  settingsRowError: {
    borderWidth: 1,
    borderColor: theme.colors.error,
    borderRadius: theme.colors.radius,
    marginHorizontal: H_PAD,
  },
  tagsTouchable: {
    paddingVertical: 4,
  },
  tagsPillsWrap: {
    gap: 10,
  },
  tagPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.colors.radius,
    backgroundColor: theme.colors.secondary,
    maxWidth: "100%",
  },
  tagPillText: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.onSurface,
    maxWidth: 140,
  },
  tagEditHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tagEditHintIcon: {
    color: theme.colors.customColors.semi,
    opacity: 0.9,
  },
  tagEditHint: {
    fontSize: 13,
    color: theme.colors.customColors.semi,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.customColors.semi,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    paddingHorizontal: H_PAD,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: ROW_PADDING_V,
    paddingHorizontal: H_PAD,
    gap: ROW_GAP,
    minHeight: 48,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
    flex: 1,
    minWidth: 0,
  },
  fieldPlaceholder: {
    fontSize: 16,
    color: theme.colors.customColors.semi,
    flex: 1,
    minWidth: 0,
  },
  accountRowContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  accountRowBalance: {
    fontSize: 14,
    color: theme.colors.customColors.semi,
  },
  chevronIcon: {
    color: theme.colors.customColors.semi,
    opacity: 0.7,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: ROW_PADDING_V,
    paddingHorizontal: H_PAD,
    minHeight: 48,
    marginBottom: 12,
  },
  switchLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  recurringSwitchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: ROW_PADDING_V,
    paddingHorizontal: H_PAD,
    minHeight: 48,
    marginBottom: 4,
  },
  recurringSubSection: {
    marginTop: 8,
    marginBottom: FORM_GAP,
  },
  recurringSubLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.customColors.semi,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    paddingHorizontal: H_PAD,
  },
  recurringToggleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: H_PAD,
  },
  recurringToggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.colors.radius,
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: "transparent",
  },
  recurringToggleButtonSelected: {
    borderColor: theme.colors.primary,
  },
  recurringToggleLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  recurringToggleLabelSelected: {
    color: theme.colors.primary,
  },
  endsOnNeverButton: {
    paddingVertical: 8,
    paddingHorizontal: H_PAD,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  endsOnNeverButtonText: {
    fontSize: 14,
    color: theme.colors.customColors.semi,
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  datePickerModal: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.customColors.semi}20`,
  },
  datePickerCancel: {
    minWidth: 70,
  },
  datePickerDone: {
    minWidth: 70,
    alignItems: "flex-end",
  },
  datePickerCancelText: {
    fontSize: 17,
    color: theme.colors.onSurface,
  },
  datePickerDoneText: {
    fontSize: 17,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: H_PAD,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: `${theme.colors.customColors.semi}20`,
  },
  footerButton: {
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
  saveSpinner: {
    marginVertical: 2,
  },
}))
