/**
 * Transaction form v2 — Hybrid inline + card gallery UX:
 * - Amount: tap opens calculator sheet (unchanged)
 * - Account: horizontal card gallery
 * - Category: icon grid (2 rows)
 * - Tags: chips + inline dropdown with search
 * - Notes: expandable text area
 * All colors from theme.
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
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  TextInput as RNTextInput,
  ScrollView,
} from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { useBottomSheet } from "~/components/bottom-sheet"
import { CalculatorSheet } from "~/components/calculator-sheet"
import { DynamicIcon } from "~/components/dynamic-icon"
import { KeyboardStickyViewMinty } from "~/components/keyboard-sticky-view-minty"
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

const CALCULATOR_SHEET_ID = "transaction-v2-ui-amount"

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

interface TransactionFormV2Props {
  transaction: TransactionModel | null
  accounts: Account[]
  categories: Category[]
  tags: Tag[]
  transactionType: TransactionType
  onTransactionTypeChange: (type: TransactionType) => void
  initialTagIds?: string[]
}

export const TransactionFormV2 = ({
  transaction,
  accounts,
  categories,
  tags,
  transactionType,
  onTransactionTypeChange,
  initialTagIds = [],
}: TransactionFormV2Props) => {
  const router = useRouter()
  const { theme } = useUnistyles()
  const { id } = useLocalSearchParams<{ id: string }>()
  const isNew = id === NewEnum.NEW

  const calculatorSheet = useBottomSheet(CALCULATOR_SHEET_ID)

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
  const [notesExpanded, setNotesExpanded] = useState(false)
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const [datePickerMode, setDatePickerMode] = useState<"date" | "time">("date")
  const [tempDate, setTempDate] = useState(date)
  const [tagPickerOpen, setTagPickerOpen] = useState(false)
  const [tagSearchQuery, setTagSearchQuery] = useState("")

  const [recurringFrequency, setRecurringFrequency] =
    useState<RecurringFrequency>(null)
  const [recurringEnabled, setRecurringEnabled] = useState(false)
  const [recurringStartDate, setRecurringStartDate] = useState<Date>(
    () => new Date(),
  )
  const [recurringEndDate, setRecurringEndDate] = useState<Date | null>(null)
  const datePickerTargetRef = useRef<DatePickerTarget>("transaction")

  const selectedAccount = accounts.find((a) => a.id === accountId)
  const selectedTags = tags.filter((t) => (tagIds ?? []).includes(t.id))
  const signedAmount =
    transactionType === "expense" ? -(amount || 0) : amount || 0

  const filteredTagsForPicker = useMemo(() => {
    if (!tagSearchQuery.trim()) return tags
    const lower = tagSearchQuery.toLowerCase()
    return tags.filter((t) => t.name.toLowerCase().includes(lower))
  }, [tags, tagSearchQuery])

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

  const addTag = useCallback(
    (tagId: string) => {
      const current = tagIds ?? []
      if (current.includes(tagId)) return
      setValue("tags", [...current, tagId], { shouldDirty: true })
    },
    [tagIds, setValue],
  )

  const removeTag = useCallback(
    (tagId: string) => {
      setValue(
        "tags",
        (tagIds ?? []).filter((id) => id !== tagId),
        { shouldDirty: true },
      )
    },
    [tagIds, setValue],
  )

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

          {/* Amount: tap opens calculator sheet (unchanged) */}
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

          {/* Account: horizontal card gallery */}
          <View style={styles.fieldBlock}>
            <Text variant="small" style={styles.sectionLabel}>
              Account
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.accountGalleryContent}
            >
              {accounts.map((account) => {
                const isSelected = account.id === accountId
                return (
                  <Pressable
                    key={account.id}
                    style={[
                      styles.accountCard,
                      isSelected && styles.accountCardSelected,
                      accountError && isSelected && styles.accountCardError,
                    ]}
                    onPress={() =>
                      setValue("accountId", account.id, { shouldDirty: true })
                    }
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${account.name} account`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <DynamicIcon
                      icon={account.icon || "wallet-bifold"}
                      size={24}
                      colorScheme={getThemeStrict(account.colorSchemeName)}
                      variant="badge"
                    />
                    <Text
                      variant="default"
                      style={styles.accountCardName}
                      numberOfLines={1}
                    >
                      {account.name}
                    </Text>
                    <Money
                      value={account.balance}
                      currency={account.currencyCode}
                      style={styles.accountCardBalance}
                    />
                  </Pressable>
                )
              })}
            </ScrollView>
            {accountError ? (
              <Text style={styles.fieldError}>{accountError}</Text>
            ) : null}
          </View>

          {/* Category: horizontal scroll with 2-row grid */}
          <View style={styles.fieldBlock}>
            <View style={styles.sectionLabelRow}>
              <Text variant="small" style={styles.sectionLabel}>
                Category
              </Text>
              {categoryId ? (
                <Pressable
                  onPress={() =>
                    setValue("categoryId", null, { shouldDirty: true })
                  }
                  style={styles.clearButton}
                  accessibilityLabel="Clear category"
                >
                  <Text variant="small" style={styles.clearButtonText}>
                    Clear
                  </Text>
                </Pressable>
              ) : null}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScrollContent}
            >
              <View
                style={[
                  styles.categoryGrid,
                  {
                    width: Math.max(
                      Dimensions.get("window").width - H_PAD * 2,
                      Math.ceil(categories.length / 2) *
                        (CATEGORY_CELL_SIZE + CATEGORY_GAP) -
                        CATEGORY_GAP,
                    ),
                  },
                ]}
              >
                {categories.map((category) => {
                  const isSelected = category.id === categoryId
                  return (
                    <Pressable
                      key={category.id}
                      style={[
                        styles.categoryCell,
                        isSelected && styles.categoryCellSelected,
                      ]}
                      onPress={() =>
                        setValue("categoryId", category.id, {
                          shouldDirty: true,
                        })
                      }
                      accessible
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${category.name} category`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <DynamicIcon
                        icon={category.icon || "shape"}
                        size={32}
                        colorScheme={getThemeStrict(category.colorSchemeName)}
                        variant="badge"
                      />
                      <Text
                        variant="small"
                        style={styles.categoryCellLabel}
                        numberOfLines={1}
                      >
                        {category.name}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </ScrollView>
          </View>

          {/* Tags: chips + inline dropdown */}
          <View style={styles.fieldBlock}>
            <View style={styles.sectionLabelRow}>
              <Text variant="small" style={styles.sectionLabel}>
                Tags
              </Text>
              {(tagIds ?? []).length > 0 ? (
                <Pressable
                  onPress={() => setValue("tags", [], { shouldDirty: true })}
                  style={styles.clearButton}
                  accessibilityLabel="Clear all tags"
                >
                  <Text variant="small" style={styles.clearButtonText}>
                    Clear
                  </Text>
                </Pressable>
              ) : null}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagsChipsRow}
            >
              <Pressable
                style={[
                  styles.tagChipAdd,
                  tagPickerOpen && styles.tagChipCancel,
                ]}
                onPress={() => {
                  setTagPickerOpen((o) => !o)
                  if (!tagPickerOpen) setTagSearchQuery("")
                }}
                accessible
                accessibilityRole="button"
                accessibilityLabel={tagPickerOpen ? "Cancel" : "Add tag"}
              >
                <IconSymbol
                  name={tagPickerOpen ? "close" : "plus"}
                  size={16}
                  style={[
                    styles.tagChipAddIcon,
                    tagPickerOpen && { color: theme.colors.customColors.semi },
                  ]}
                />
                <Text
                  variant="default"
                  style={[
                    styles.tagChipAddText,
                    tagPickerOpen && { color: theme.colors.customColors.semi },
                  ]}
                >
                  {tagPickerOpen ? "Cancel" : "Add tag"}
                </Text>
              </Pressable>
              {selectedTags.map((tag) => (
                <Pressable
                  key={tag.id}
                  style={styles.tagChip}
                  onPress={() => removeTag(tag.id)}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${tag.name} tag`}
                >
                  <DynamicIcon
                    icon={tag.icon || "tag"}
                    size={16}
                    colorScheme={getThemeStrict(tag.colorSchemeName)}
                    variant="badge"
                  />
                  <Text
                    variant="default"
                    style={styles.tagChipText}
                    numberOfLines={1}
                  >
                    {tag.name}
                  </Text>
                  <IconSymbol
                    name="close"
                    size={14}
                    style={styles.tagChipRemoveIcon}
                  />
                </Pressable>
              ))}
            </ScrollView>

            {tagPickerOpen && (
              <View style={styles.inlineTagPicker}>
                <Input
                  placeholder="Search tags..."
                  value={tagSearchQuery}
                  onChangeText={setTagSearchQuery}
                  placeholderTextColor={theme.colors.customColors.semi}
                  style={styles.tagSearchInput}
                />
                <ScrollView
                  style={styles.tagPickerList}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={true}
                >
                  {filteredTagsForPicker.map((tag) => {
                    const isSelected = (tagIds ?? []).includes(tag.id)
                    return (
                      <Pressable
                        key={tag.id}
                        style={[
                          styles.tagPickerRow,
                          isSelected && styles.tagPickerRowSelected,
                        ]}
                        onPress={() => {
                          if (isSelected) removeTag(tag.id)
                          else addTag(tag.id)
                        }}
                      >
                        <DynamicIcon
                          icon={tag.icon || "tag"}
                          size={20}
                          colorScheme={getThemeStrict(tag.colorSchemeName)}
                          variant="badge"
                        />
                        <Text
                          variant="default"
                          style={styles.tagPickerRowText}
                          numberOfLines={1}
                        >
                          {tag.name}
                        </Text>
                        {isSelected ? (
                          <IconSymbol
                            name="check"
                            size={20}
                            style={styles.tagPickerRowCheck}
                          />
                        ) : null}
                      </Pressable>
                    )
                  })}
                </ScrollView>
                <Pressable
                  style={styles.createTagRow}
                  onPress={() => {
                    setTagPickerOpen(false)
                    router.push({
                      pathname: "/settings/tags/[tagId]",
                      params: { tagId: NewEnum.NEW },
                    })
                  }}
                >
                  <IconSymbol
                    name="shape-plus"
                    size={20}
                    style={styles.createTagRowIcon}
                  />
                  <Text variant="default" style={styles.createTagRowText}>
                    Create new tag
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Date & time inline */}
          <View style={styles.fieldBlock}>
            <Text variant="small" style={styles.sectionLabel}>
              Transaction date & time
            </Text>
            <Pressable
              style={styles.inlineDateRow}
              onPress={() => openDatePicker("transaction")}
            >
              <DynamicIcon
                icon="calendar"
                size={20}
                color={theme.colors.primary}
                variant="badge"
              />
              <Text variant="default" style={styles.inlineDateText}>
                {format(date, "MMM d, yyyy")}
              </Text>
              <Text variant="muted" style={styles.inlineTimeText}>
                {format(date, "h:mm a")}
              </Text>
            </Pressable>
          </View>

          {/* Pending switch */}
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
                  <DynamicIcon
                    icon="clock"
                    size={20}
                    color={theme.colors.primary}
                    variant="badge"
                  />
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

          {/* Recurring */}
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
                            isSelected && styles.recurringToggleButtonSelected,
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
                              isSelected && styles.recurringToggleLabelSelected,
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
                  <Text variant="small" style={styles.sectionLabel}>
                    Starts on
                  </Text>
                  <Pressable
                    style={styles.settingsRow}
                    onPress={() => openDatePicker("recurringStart")}
                  >
                    <DynamicIcon
                      icon="calendar"
                      size={20}
                      color={theme.colors.primary}
                      variant="badge"
                    />
                    <Text variant="default" style={styles.fieldValue}>
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
                  <Text variant="small" style={styles.sectionLabel}>
                    Ends on
                  </Text>
                  <Pressable
                    style={styles.settingsRow}
                    onPress={() => openDatePicker("recurringEnd")}
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

          {/* Notes: expandable text area */}
          <View style={styles.fieldBlock}>
            <Text variant="small" style={styles.sectionLabel}>
              Notes
            </Text>
            <Pressable
              style={styles.notesHeader}
              onPress={() => setNotesExpanded((e) => !e)}
              accessibilityLabel="Notes"
              accessibilityHint={
                notesExpanded ? "Collapse notes" : "Expand to add notes"
              }
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
                {description || "Add notes..."}
              </Text>
              <IconSymbol
                name={notesExpanded ? "arrow-up" : "chevron-down"}
                size={20}
                style={styles.chevronIcon}
              />
            </Pressable>
            {notesExpanded && (
              <Controller
                control={control}
                name="description"
                render={({ field: { value, onChange } }) => (
                  <RNTextInput
                    value={value ?? ""}
                    onChangeText={onChange}
                    placeholder="Add notes about this transaction..."
                    placeholderTextColor={theme.colors.customColors.semi}
                    multiline
                    numberOfLines={4}
                    style={[
                      styles.notesTextArea,
                      {
                        color: theme.colors.onSurface,
                        borderColor: `${theme.colors.customColors.semi}40`,
                      },
                    ]}
                  />
                )}
              />
            )}
            {descriptionError ? (
              <Text style={styles.fieldError}>{descriptionError}</Text>
            ) : null}
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

      {/* Calculator remains a sheet per requirement */}
      <CalculatorSheet
        id={CALCULATOR_SHEET_ID}
        initialValue={amount}
        onSubmit={(value) => {
          setValue("amount", value, { shouldDirty: true })
          calculatorSheet.dismiss()
        }}
        currencyCode={selectedAccount?.currencyCode}
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
          <View
            style={[
              styles.datePickerModal,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View
              style={[
                styles.datePickerHeader,
                { borderBottomColor: `${theme.colors.customColors.semi}20` },
              ]}
            >
              <Pressable
                onPress={() => setDatePickerVisible(false)}
                style={styles.datePickerCancel}
              >
                <Text
                  style={[
                    styles.datePickerCancelText,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable onPress={confirmIosDate} style={styles.datePickerDone}>
                <Text
                  style={[
                    styles.datePickerDoneText,
                    { color: theme.colors.primary },
                  ]}
                >
                  {datePickerMode === "date" ? "Next" : "Done"}
                </Text>
              </Pressable>
            </View>
            <View style={styles.datePickerBody}>
              <DateTimePicker
                value={tempDate}
                mode={datePickerMode}
                display="spinner"
                onChange={handleIosDateChange}
                textColor={theme.colors.onSurface}
              />
            </View>
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
const CARD_WIDTH = 140
const CARD_PADDING = 16
const CATEGORY_CELL_SIZE = 74
const CATEGORY_GAP = 10

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
    borderRadius: theme.colors.radius ?? 16,
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
  fieldBlock: {
    marginBottom: FORM_GAP,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.customColors.semi,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: H_PAD,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: H_PAD,
    marginBottom: 8,
  },
  clearButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  accountGalleryContent: {
    paddingHorizontal: H_PAD,
    gap: 12,
    paddingVertical: 4,
  },
  accountCard: {
    width: CARD_WIDTH,
    padding: CARD_PADDING,
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
    borderWidth: 2,
    borderColor: theme.colors.secondary,
    alignItems: "center",
    gap: 8,
  },
  accountCardSelected: {
    borderColor: theme.colors.primary,
  },
  accountCardError: {
    borderColor: theme.colors.error,
  },
  accountCardName: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.onSurface,
    textAlign: "center",
  },
  accountCardBalance: {
    fontSize: 12,
    color: theme.colors.customColors.semi,
  },
  categoryScrollContent: {
    paddingHorizontal: H_PAD,
    paddingVertical: 4,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CATEGORY_GAP,
  },
  categoryCell: {
    width: CATEGORY_CELL_SIZE,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: theme.colors.secondary,
    borderWidth: 2,
    borderColor: theme.colors.secondary,
  },
  categoryCellSelected: {
    borderColor: theme.colors.primary,
  },
  categoryCellLabel: {
    fontSize: 11,
    color: theme.colors.onSurface,
    marginTop: 4,
    textAlign: "center",
  },
  tagsChipsRow: {
    paddingHorizontal: H_PAD,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    paddingVertical: 4,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: theme.colors.secondary,
    maxWidth: 160,
  },
  tagChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.onSurface,
    flex: 1,
    minWidth: 0,
  },
  tagChipRemoveIcon: {
    color: theme.colors.customColors.semi,
  },
  tagChipAdd: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.primary,
  },
  tagChipCancel: {
    borderColor: theme.colors.customColors.semi,
  },
  tagChipAddIcon: {
    color: theme.colors.primary,
  },
  tagChipAddText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.primary,
  },
  inlineTagPicker: {
    marginHorizontal: H_PAD,
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.secondary,
    maxHeight: 400,
  },
  tagSearchInput: {
    marginBottom: 8,
  },
  tagPickerList: {
    height: 180,
  },
  tagPickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tagPickerRowSelected: {
    backgroundColor: theme.colors.surface,
  },
  tagPickerRowText: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.onSurface,
    flex: 1,
    minWidth: 0,
  },
  tagPickerRowCheck: {
    color: theme.colors.primary,
  },
  createTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginTop: 8,
    borderRadius: 8,
    borderTopWidth: 1,
    borderTopColor: `${theme.colors.customColors.semi}30`,
  },
  createTagRowIcon: {
    color: theme.colors.primary,
  },
  createTagRowText: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.primary,
  },
  inlineDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: ROW_GAP,
    paddingVertical: ROW_PADDING_V,
    paddingHorizontal: H_PAD,
    minHeight: 48,
  },
  inlineDateText: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
    flex: 1,
  },
  inlineTimeText: {
    fontSize: 14,
    color: theme.colors.customColors.semi,
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
    borderRadius: theme.colors.radius ?? 12,
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
  chevronIcon: {
    color: theme.colors.customColors.semi,
    opacity: 0.7,
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: ROW_PADDING_V,
    paddingHorizontal: H_PAD,
    gap: ROW_GAP,
    minHeight: 48,
  },
  notesTextArea: {
    marginHorizontal: H_PAD,
    marginTop: 4,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 96,
    textAlignVertical: "top",
    fontSize: 16,
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  datePickerModal: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34,
  },
  datePickerBody: {
    paddingVertical: 8,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
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
  },
  datePickerDoneText: {
    fontSize: 17,
    fontWeight: "600",
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
