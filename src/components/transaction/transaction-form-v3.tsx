/**
 * Transaction form v3 — Minimal page: account & category same pattern as tags.
 * - Amount: tap opens calculator sheet
 * - Account: dashed trigger → inline list with search; select closes
 * - Category: dashed trigger → inline list with search; select closes
 * - Tags: chips + inline dropdown with search (unchanged)
 * - Notes: expandable text area
 * Account/category each keep their own styles (card/cell), not chips.
 */

import { zodResolver } from "@hookform/resolvers/zod"
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker"
import type { EventArg } from "@react-navigation/native"
import * as DocumentPicker from "expo-document-picker"
import * as ImagePicker from "expo-image-picker"
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { Controller, type Resolver, useForm } from "react-hook-form"
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
} from "react-native"
import Markdown from "react-native-markdown-display"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { ConfirmModal } from "~/components/confirm-modal"
import { DynamicIcon } from "~/components/dynamic-icon"
import { Money } from "~/components/money"
import { SmartAmountInput } from "~/components/smart-amount-input"
import { AttachmentPreviewModal } from "~/components/transaction/attachment-preview-modal"
import { MarkdownEditorModal } from "~/components/transaction/markdown-editor-modal"
import { TransactionTypeSelector } from "~/components/transaction/transaction-type-selector"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Input } from "~/components/ui/input"
import { Pressable } from "~/components/ui/pressable"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type TransactionModel from "~/database/models/Transaction"
import { createRecurringFromTransaction } from "~/database/services/recurring-transaction-service"
import {
  createTransactionModel,
  deleteTransactionModel,
  destroyTransactionModel,
  restoreTransactionModel,
  updateTransactionModel,
} from "~/database/services/transaction-service"
import {
  type TransactionFormValues,
  transactionSchema,
} from "~/schemas/transactions.schema"
import { usePendingTransactionsStore } from "~/stores/pending-transactions.store"
import { getThemeStrict } from "~/styles/theme/registry"
import type { Account } from "~/types/accounts"
import type { Category } from "~/types/categories"
import { NewEnum } from "~/types/new"
import type { Tag } from "~/types/tags"
import type {
  RecurringEndType,
  RecurringFrequency,
  TransactionAttachment,
  TransactionType,
} from "~/types/transactions"
import {
  getFileExtension,
  getFileIconForExtension,
  isImageExtension,
} from "~/utils/file-icon"
import { formatFileSize } from "~/utils/format-file-size"
import { logger } from "~/utils/logger"
import { openFileInExternalApp } from "~/utils/open-file"
import { startOfNextMinute } from "~/utils/pending-transactions"
import { buildRRuleString } from "~/utils/recurrence"
import {
  formatCreatedAt,
  formatDayName,
  formatMonthDay,
  formatOrdinalDay,
} from "~/utils/time-utils"
import { Toast } from "~/utils/toast"

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
      return `Every week, ${formatDayName(startDate)}`
    case "biweekly":
      return `Every 2 weeks, ${formatDayName(startDate)}`
    case "monthly":
      return `Every month, ${formatOrdinalDay(startDate)}`
    case "yearly":
      return `Every year, ${formatMonthDay(startDate)}`
    default:
      return "None"
  }
}

function getDefaultValues(
  transaction: TransactionModel | null,
  accounts: Account[],
  transactionType: TransactionType,
  initialTagIds: string[] = [],
): TransactionFormValues {
  const defaultAccountId =
    accounts.find((a) => a.isPrimary && !a.isArchived)?.id ?? ""

  if (!transaction) {
    return {
      amount: 0,
      type: transactionType,
      transactionDate: new Date(),
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
    transactionDate: transaction.transactionDate,
    accountId: transaction.accountId,
    categoryId: transaction.categoryId,
    title: transaction.title ?? "",
    description: transaction.description ?? "",
    isPending: transaction.isPending,
    tags: initialTagIds,
  }
}

function getFieldError(
  field: keyof TransactionFormValues,
  message: string | undefined,
): string | undefined {
  if (!message) return undefined
  if (field === "accountId")
    return "Please choose an account to save this transaction."
  if (field === "amount") return "Enter an amount greater than 0."
  return message
}

function notesMarkdownStyles(theme: { colors: { onSurface: string } }) {
  const fg = theme.colors.onSurface
  return {
    body: { color: fg, fontSize: 15 },
    paragraph: { marginVertical: 4 },
    bullet_list: { marginVertical: 4 },
    ordered_list: { marginVertical: 4 },
    list_item: { marginVertical: 2 },
    strong: { fontWeight: "700" as const },
    em: { fontStyle: "italic" as const },
  }
}

interface TransactionFormV3Props {
  transaction: TransactionModel | null
  accounts: Account[]
  categories: Category[]
  tags: Tag[]
  transactionType: TransactionType
  onTransactionTypeChange: (type: TransactionType) => void
  initialTagIds?: string[]
}

export function TransactionFormV3({
  transaction,
  accounts,
  categories,
  tags,
  transactionType,
  onTransactionTypeChange,
  initialTagIds = [],
}: TransactionFormV3Props) {
  const router = useRouter()
  const navigation = useNavigation()
  const { theme } = useUnistyles()
  const { id } = useLocalSearchParams<{ id: string }>()
  const isNew = id === NewEnum.NEW
  const requireConfirmation = usePendingTransactionsStore(
    (s) => s.requireConfirmation,
  )

  const isNavigatingRef = useRef(false)
  const pendingLeaveRef = useRef<(() => void) | null>(null)
  const [unsavedModalVisible, setUnsavedModalVisible] = useState(false)
  const [destroyModalVisible, setDestroyModalVisible] = useState(false)

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
    formState: { errors, isDirty },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema) as Resolver<TransactionFormValues>,
    defaultValues,
  })

  useLayoutEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const handleGoBack = useCallback(() => {
    router.back()
  }, [router])

  const amount = watch("amount")
  const accountId = watch("accountId")
  const categoryId = watch("categoryId")
  const date = watch("transactionDate")
  const description = watch("description")
  const tagIds = watch("tags")

  const [isSaving, setIsSaving] = useState(false)
  const [notesModalVisible, setNotesModalVisible] = useState(false)
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const [datePickerMode, setDatePickerMode] = useState<"date" | "time">("date")
  const [tempDate, setTempDate] = useState(date)
  const [tagPickerOpen, setTagPickerOpen] = useState(false)
  const [tagSearchQuery, setTagSearchQuery] = useState("")
  const [accountPickerOpen, setAccountPickerOpen] = useState(false)
  const [accountSearchQuery, setAccountSearchQuery] = useState("")

  const [recurringFrequency, setRecurringFrequency] =
    useState<RecurringFrequency>("daily")
  const [recurringEnabled, setRecurringEnabled] = useState(false)
  const [recurringStartDate, setRecurringStartDate] = useState<Date>(
    () => new Date(),
  )
  const [recurringEndDate, setRecurringEndDate] = useState<Date | null>(null)
  const [recurringEndAfterOccurrences, setRecurringEndAfterOccurrences] =
    useState<number | null>(null)
  const [endsOnPickerExpanded, setEndsOnPickerExpanded] = useState(false)
  const [addFilesExpanded, setAddFilesExpanded] = useState(false)
  const [previewAttachment, setPreviewAttachment] =
    useState<TransactionAttachment | null>(null)
  const [fileToOpen, setFileToOpen] = useState<TransactionAttachment | null>(
    null,
  )
  const [attachmentToRemove, setAttachmentToRemove] =
    useState<TransactionAttachment | null>(null)
  const [attachments, setAttachments] = useState<TransactionAttachment[]>(
    () => {
      if (!transaction?.extra?.attachments) return []
      try {
        const parsed = JSON.parse(transaction.extra.attachments) as unknown
        if (!Array.isArray(parsed)) return []
        return parsed.map(
          (a: {
            uri: string
            name: string
            size: number
            addedAt: string
            ext: string
          }) => ({
            ...a,
            addedAt: new Date(a.addedAt),
          }),
        )
      } catch {
        return []
      }
    },
  )

  // Handle navigation with unsaved changes: show ConfirmModal
  useEffect(() => {
    const unsubscribe = navigation.addListener(
      "beforeRemove",
      (e: EventArg<"beforeRemove", true, { action: unknown }>) => {
        if (isSaving || isNavigatingRef.current || !isDirty) {
          return
        }
        e.preventDefault()
        pendingLeaveRef.current = () => {
          isNavigatingRef.current = true
          handleGoBack()
        }
        setUnsavedModalVisible(true)
      },
    )
    return unsubscribe
  }, [navigation, isDirty, isSaving, handleGoBack])

  const datePickerTargetRef = useRef<DatePickerTarget>("transaction")

  const endsOnType: RecurringEndType =
    recurringEndAfterOccurrences !== null
      ? "occurrences"
      : recurringEndDate !== null
        ? "date"
        : "never"

  const ENDS_ON_OCCURRENCE_PRESETS = [2, 4, 6, 8, 10, 12, 14]

  const handleRecurringToggle = useCallback((next: boolean) => {
    setRecurringEnabled(next)
  }, [])

  const selectedAccount = accounts.find((a) => a.id === accountId)
  const selectedTags = tags.filter((t) => (tagIds ?? []).includes(t.id))

  const filteredTagsForPicker = useMemo(() => {
    if (!tagSearchQuery.trim()) return tags
    const lower = tagSearchQuery.toLowerCase()
    return tags.filter((t) => t.name.toLowerCase().includes(lower))
  }, [tags, tagSearchQuery])

  const filteredAccountsForPicker = useMemo(() => {
    if (!accountSearchQuery.trim()) return accounts
    const lower = accountSearchQuery.toLowerCase()
    return accounts.filter((a) => a.name.toLowerCase().includes(lower))
  }, [accounts, accountSearchQuery])

  const openDatePicker = useCallback(
    (target: DatePickerTarget = "transaction") => {
      datePickerTargetRef.current = target
      const current =
        target === "recurringStart"
          ? recurringStartDate
          : target === "recurringEnd"
            ? (recurringEndDate ?? new Date())
            : watch("transactionDate")
      setTempDate(current)
      if (Platform.OS === "android") {
        DateTimePickerAndroid.open({
          value: current,
          mode: "date",
          display: "calendar",
          onChange: (_evt, selectedDate) => {
            if (selectedDate && _evt.type === "set") {
              setTempDate(selectedDate)
              DateTimePickerAndroid.open({
                value: selectedDate,
                mode: "time",
                display: "spinner",
                onChange: (evt, timeDate) => {
                  if (timeDate && evt.type === "set") {
                    const t = datePickerTargetRef.current
                    if (t === "recurringStart") setRecurringStartDate(timeDate)
                    else if (t === "recurringEnd") setRecurringEndDate(timeDate)
                    else {
                      setValue("transactionDate", timeDate, {
                        shouldDirty: true,
                      })
                      setValue(
                        "isPending",
                        timeDate.getTime() > startOfNextMinute().getTime(),
                        { shouldDirty: true },
                      )
                    }
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
      else {
        setValue("transactionDate", tempDate, { shouldDirty: true })
        setValue(
          "isPending",
          tempDate.getTime() > startOfNextMinute().getTime(),
          { shouldDirty: true },
        )
      }
      setDatePickerVisible(false)
    } else {
      setDatePickerMode("time")
    }
  }, [datePickerMode, tempDate, setValue])

  const onSubmit = async (data: TransactionFormValues) => {
    if (isSaving) return
    setIsSaving(true)
    try {
      // Build extra: on edit merge with existing so we don't wipe other keys
      const builtExtra: Record<string, string> = isNew
        ? {}
        : { ...(transaction?.extra ?? {}) }
      if (attachments.length > 0) {
        builtExtra.attachments = JSON.stringify(attachments)
      } else {
        delete builtExtra.attachments
      }

      // When recurring is on, date and pending come from the rule; recurring is always auto-confirmed
      const effectiveDate = recurringEnabled
        ? recurringStartDate
        : data.transactionDate
      const effectiveIsPending = recurringEnabled
        ? true
        : (data.isPending ?? false)
      const isFuture = effectiveDate.getTime() > Date.now()
      const requiresManualConfirmation = recurringEnabled
        ? undefined
        : transaction
          ? (transaction.requiresManualConfirmation ??
            (isFuture ? requireConfirmation : undefined))
          : isFuture
            ? requireConfirmation
            : undefined
      const payload = {
        amount: data.amount,
        currency: selectedAccount?.currencyCode ?? "USD",
        type: data.type,
        transactionDate: effectiveDate,
        categoryId: data.categoryId ?? null,
        accountId: data.accountId,
        title: data.title?.trim() || "Untitled Transaction",
        description: data.description?.trim() ?? undefined,
        isPending: effectiveIsPending,
        requiresManualConfirmation,
        tags: data.tags ?? [],
        location: undefined as string | undefined,
        extra: Object.keys(builtExtra).length > 0 ? builtExtra : undefined,
        subtype: transaction?.subtype ?? undefined,
      }
      if (isNew) {
        const created = await createTransactionModel(payload)

        // If recurring is enabled, create a RecurringTransaction from the saved transaction
        if (recurringEnabled && recurringFrequency) {
          try {
            const rruleStr = buildRRuleString({
              frequency: recurringFrequency,
              startDate: recurringStartDate,
              endDate: recurringEndDate,
              count: recurringEndAfterOccurrences,
            })
            // Use a far-future end if "never"
            const rangeEnd =
              recurringEndDate?.getTime() ?? new Date(2099, 11, 31).getTime()

            await createRecurringFromTransaction(created.id, {
              range: {
                from: recurringStartDate.getTime(),
                to: rangeEnd,
              },
              rules: [rruleStr],
            })
            Toast.success({ title: "Recurring transaction created" })
          } catch (recErr) {
            logger.error("Failed to create recurring template", {
              message:
                recErr instanceof Error ? recErr.message : String(recErr),
            })
            Toast.success({
              title: "Transaction created (recurring setup failed)",
            })
          }
        } else {
          Toast.success({ title: "Transaction created" })
        }
      } else if (transaction) {
        await updateTransactionModel(transaction, payload)
        Toast.success({ title: "Transaction updated" })
      }
      isNavigatingRef.current = true
      router.back()
    } catch (error) {
      logger.error("Failed to save transaction", {
        message: error instanceof Error ? error.message : String(error),
      })
      Toast.error({ title: "Failed to save transaction" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelPress = useCallback(() => {
    if (isDirty) {
      pendingLeaveRef.current = () => {
        isNavigatingRef.current = true
        handleGoBack()
      }
      setUnsavedModalVisible(true)
    } else {
      handleGoBack()
    }
  }, [isDirty, handleGoBack])

  const handleDeleteConfirm = useCallback(async () => {
    if (!transaction) return
    try {
      await deleteTransactionModel(transaction)
      Toast.success({ title: "Moved to trash" })
      isNavigatingRef.current = true
      router.back()
    } catch (error) {
      logger.error("Failed to move transaction to trash", { error })
      Toast.error({ title: "Failed to move to trash" })
    }
  }, [transaction, router])

  const handleRestore = useCallback(async () => {
    if (!transaction?.isDeleted) return
    try {
      await restoreTransactionModel(transaction)
      Toast.success({ title: "Restored", description: "Transaction restored." })
      isNavigatingRef.current = true
      router.back()
    } catch {
      Toast.error({
        title: "Error",
        description: "Failed to restore transaction.",
      })
    }
  }, [transaction, router])

  const handleDestroy = useCallback(() => {
    if (!transaction) return
    setDestroyModalVisible(true)
  }, [transaction])

  const handleDestroyConfirm = useCallback(async () => {
    if (!transaction) return
    setDestroyModalVisible(false)
    try {
      await destroyTransactionModel(transaction)
      Toast.success({
        title: "Deleted",
        description: "Transaction permanently removed.",
      })
      isNavigatingRef.current = true
      router.back()
    } catch {
      Toast.error({
        title: "Error",
        description: "Failed to delete transaction.",
      })
    }
  }, [transaction, router])

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

  const addAttachment = useCallback((a: TransactionAttachment) => {
    setAttachments((prev) => [...prev, a])
  }, [])

  const removeAttachment = useCallback((uri: string) => {
    setAttachments((prev) => prev.filter((x) => x.uri !== uri))
  }, [])

  const handleSelectFromFiles = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      })
      if (result.canceled) return
      const file = result.assets[0]
      const ext = getFileExtension(file.name)
      addAttachment({
        uri: file.uri,
        name: file.name,
        size: file.size ?? 0,
        addedAt: new Date(),
        ext,
      })
    } catch (e) {
      logger.error("Document picker error", { e })
      Toast.error({ title: "Could not select file" })
    }
  }, [addAttachment])

  const handleTakePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== "granted") {
      Toast.error({
        title: "Permission required",
        description: "Camera access is needed to take a photo.",
      })
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    })
    if (result.canceled || !result.assets[0]) return
    const asset = result.assets[0]
    const name = asset.fileName ?? `photo-${Date.now()}.jpg`
    const ext = getFileExtension(name)
    addAttachment({
      uri: asset.uri,
      name,
      size: asset.fileSize ?? 0,
      addedAt: new Date(),
      ext,
    })
  }, [addAttachment])

  const handleSelectMultipleMedia = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Toast.error({
        title: "Permission required",
        description: "Photo library access is needed.",
      })
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      quality: 0.8,
    })
    if (result.canceled || result.assets.length === 0) return
    for (const asset of result.assets) {
      const name =
        asset.fileName ??
        `media-${Date.now()}.${asset.type === "video" ? "mp4" : "jpg"}`
      const ext = getFileExtension(name)
      addAttachment({
        uri: asset.uri,
        name,
        size: asset.fileSize ?? 0,
        addedAt: new Date(),
        ext,
      })
    }
  }, [addAttachment])

  const handleSelectSinglePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Toast.error({
        title: "Permission required",
        description: "Photo library access is needed.",
      })
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      quality: 0.8,
    })
    if (result.canceled || !result.assets[0]) return
    const asset = result.assets[0]
    const name = asset.fileName ?? `photo-${Date.now()}.jpg`
    const ext = getFileExtension(name)
    addAttachment({
      uri: asset.uri,
      name,
      size: asset.fileSize ?? 0,
      addedAt: new Date(),
      ext,
    })
  }, [addAttachment])

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

          {/* Amount: smart inline input + optional full calculator */}
          <View style={styles.balanceSection}>
            <SmartAmountInput
              value={amount ?? 0}
              onChange={(value) =>
                setValue("amount", value, { shouldDirty: true })
              }
              currencyCode={selectedAccount?.currencyCode}
              error={amountError ?? undefined}
              label="AMOUNT"
              placeholder="0"
              type={transactionType}
            />
          </View>

          {/* Account: dashed trigger → inline list with search (same pattern as tags) */}
          <View style={styles.fieldBlock}>
            <View style={styles.sectionLabelRow}>
              <Text variant="small" style={styles.sectionLabelInRow}>
                Account
              </Text>
              <Pressable
                onPress={() =>
                  accountId && setValue("accountId", "", { shouldDirty: true })
                }
                style={[
                  styles.clearButton,
                  !accountId && styles.clearButtonDisabled,
                ]}
                pointerEvents={accountId ? "auto" : "none"}
                accessibilityLabel="Clear account"
                accessibilityState={{ disabled: !accountId }}
              >
                <Text variant="small" style={styles.clearButtonText}>
                  Clear
                </Text>
              </Pressable>
            </View>
            <Pressable
              style={[
                styles.accountTrigger,
                selectedAccount && styles.accountTriggerSelected,
                accountError && selectedAccount && styles.accountTriggerError,
              ]}
              onPress={() => {
                setAccountPickerOpen((o) => !o)
                if (!accountPickerOpen) setAccountSearchQuery("")
              }}
              accessibilityLabel={
                accountPickerOpen ? "Cancel" : "Select account"
              }
            >
              {selectedAccount ? (
                <>
                  <DynamicIcon
                    icon={selectedAccount.icon || "wallet-bifold"}
                    size={24}
                    colorScheme={getThemeStrict(
                      selectedAccount.colorSchemeName,
                    )}
                    variant="badge"
                  />
                  <View style={styles.accountTriggerContent}>
                    <Text
                      variant="default"
                      style={styles.accountTriggerName}
                      numberOfLines={1}
                    >
                      {selectedAccount.name}
                    </Text>
                    <Money
                      value={selectedAccount.balance}
                      currency={selectedAccount.currencyCode}
                      style={styles.accountTriggerBalance}
                    />
                  </View>
                  <IconSymbol
                    name={accountPickerOpen ? "chevron-up" : "chevron-right"}
                    size={20}
                    style={styles.chevronIcon}
                  />
                </>
              ) : (
                <>
                  <DynamicIcon
                    icon="wallet-bifold"
                    size={24}
                    color={theme.colors.primary}
                    variant="badge"
                  />
                  <Text
                    variant="default"
                    style={styles.accountTriggerPlaceholder}
                    numberOfLines={1}
                  >
                    Select account
                  </Text>
                  <IconSymbol
                    name={accountPickerOpen ? "close" : "chevron-down"}
                    size={20}
                    style={styles.chevronIcon}
                  />
                </>
              )}
            </Pressable>
            {accountPickerOpen && (
              <View style={styles.inlineAccountPicker}>
                <Input
                  placeholder="Search accounts..."
                  value={accountSearchQuery}
                  onChangeText={setAccountSearchQuery}
                  placeholderTextColor={theme.colors.customColors.semi}
                  style={styles.pickerSearchInput}
                />
                <ScrollView
                  style={styles.pickerList}
                  contentContainerStyle={styles.pickerListContent}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                  showsVerticalScrollIndicator
                >
                  {filteredAccountsForPicker.map((account) => (
                    <Pressable
                      key={account.id}
                      style={[
                        styles.accountPickerRow,
                        account.id === accountId &&
                          styles.inlinePickerRowSelected,
                      ]}
                      onPress={() => {
                        setValue("accountId", account.id, { shouldDirty: true })
                        setAccountPickerOpen(false)
                      }}
                    >
                      <DynamicIcon
                        icon={account.icon || "wallet-bifold"}
                        size={24}
                        colorScheme={getThemeStrict(account.colorSchemeName)}
                        variant="badge"
                      />
                      <View style={styles.accountPickerRowContent} native>
                        <Text
                          variant="default"
                          style={styles.accountPickerRowName}
                          numberOfLines={1}
                        >
                          {account.name}
                        </Text>
                        <Money
                          value={account.balance}
                          currency={account.currencyCode}
                          style={styles.accountPickerRowBalance}
                        />
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
            {accountError ? (
              <Text style={styles.fieldError}>{accountError}</Text>
            ) : null}
          </View>

          {/* Category: horizontal scroll with 2-row grid (same as v2) + Clear */}
          <View style={styles.fieldBlock}>
            <View style={styles.sectionLabelRow}>
              <Text variant="small" style={styles.sectionLabelInRow}>
                Category
              </Text>
              <Pressable
                onPress={() =>
                  categoryId &&
                  setValue("categoryId", null, { shouldDirty: true })
                }
                style={[
                  styles.clearButton,
                  !categoryId && styles.clearButtonDisabled,
                ]}
                pointerEvents={categoryId ? "auto" : "none"}
                accessibilityLabel="Clear category"
                accessibilityState={{ disabled: !categoryId }}
              >
                <Text variant="small" style={styles.clearButtonText}>
                  Clear
                </Text>
              </Pressable>
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
              <Text variant="small" style={styles.sectionLabelInRow}>
                Tags
              </Text>
              <Pressable
                onPress={() =>
                  (tagIds ?? []).length > 0 &&
                  setValue("tags", [], { shouldDirty: true })
                }
                style={[
                  styles.clearButton,
                  (tagIds ?? []).length === 0 && styles.clearButtonDisabled,
                ]}
                pointerEvents={(tagIds ?? []).length > 0 ? "auto" : "none"}
                accessibilityLabel="Clear all tags"
                accessibilityState={{
                  disabled: (tagIds ?? []).length === 0,
                }}
              >
                <Text variant="small" style={styles.clearButtonText}>
                  Clear
                </Text>
              </Pressable>
            </View>
            <View style={styles.tagsWrapGrid}>
              <Pressable
                style={[
                  styles.tagChipBase,
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
                <Text
                  variant="default"
                  style={[
                    styles.tagChipAddText,
                    tagPickerOpen && { color: theme.colors.customColors.semi },
                  ]}
                >
                  {tagPickerOpen ? "Cancel" : "Add tag"}
                </Text>
                <IconSymbol
                  name={tagPickerOpen ? "close" : "plus"}
                  size={16}
                  style={[
                    tagPickerOpen && { color: theme.colors.customColors.semi },
                  ]}
                />
              </Pressable>
              {selectedTags.map((tag) => (
                <Pressable
                  key={tag.id}
                  style={[styles.tagChipBase, styles.tagChip]}
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
            </View>

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
                  contentContainerStyle={styles.pickerListContent}
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
                          isSelected && styles.inlinePickerRowSelected,
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
                  <IconSymbol name="tag-plus" size={20} />
                  <Text variant="default" style={styles.createTagRowText}>
                    Create new tag
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Transaction date and Pending: hidden when recurring is on (rule controls date and they're always auto-confirmed) */}
          {!recurringEnabled && (
            <>
              <View style={styles.fieldBlock}>
                <View style={styles.sectionLabelRow}>
                  <Text variant="small" style={styles.sectionLabelInRow}>
                    Transaction date
                  </Text>
                  <Pressable
                    onPress={() => {
                      const now = new Date()
                      setValue("transactionDate", now, { shouldDirty: true })
                      setValue(
                        "isPending",
                        now.getTime() > startOfNextMinute().getTime(),
                        { shouldDirty: true },
                      )
                    }}
                    style={styles.clearButton}
                    accessibilityLabel="Set date and time to now"
                  >
                    <Text variant="small" style={styles.clearButtonText}>
                      Now
                    </Text>
                  </Pressable>
                </View>
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
                    {formatCreatedAt(date)}
                  </Text>
                  <IconSymbol
                    name="chevron-right"
                    size={20}
                    style={[
                      styles.chevronIcon,
                      { color: theme.colors.primary },
                    ]}
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
            </>
          )}

          {/* Notes: pressable opens modal; formatted preview inside the same pressable */}
          <View style={styles.fieldBlock}>
            <Text variant="small" style={styles.sectionLabel}>
              Notes
            </Text>
            <Pressable
              style={styles.notesPressable}
              onPress={() => setNotesModalVisible(true)}
              accessibilityLabel="Notes"
              accessibilityHint="Open notes editor"
            >
              <View style={styles.notesHeaderRow}>
                <DynamicIcon
                  icon="clipboard"
                  size={20}
                  color={theme.colors.primary}
                  variant="badge"
                />
                <Text
                  variant="default"
                  style={
                    description?.trim()
                      ? styles.fieldValue
                      : styles.fieldPlaceholder
                  }
                  numberOfLines={1}
                >
                  {description?.trim() ? "Tap to edit notes" : "Add notes..."}
                </Text>
                <IconSymbol
                  name="chevron-right"
                  size={20}
                  style={styles.chevronIcon}
                />
              </View>
              {description?.trim() ? (
                <View style={styles.notesFullPreviewWrap} pointerEvents="none">
                  <Markdown style={notesMarkdownStyles(theme)}>
                    {description}
                  </Markdown>
                </View>
              ) : null}
            </Pressable>
            {descriptionError ? (
              <Text style={styles.fieldError}>{descriptionError}</Text>
            ) : null}
          </View>

          <MarkdownEditorModal
            visible={notesModalVisible}
            value={description ?? ""}
            onSave={(markdown) => {
              setValue("description", markdown, { shouldDirty: true })
              setNotesModalVisible(false)
            }}
            onRequestClose={() => setNotesModalVisible(false)}
          />

          {/* File attachments (extra) */}
          <View style={styles.fieldBlock}>
            <Text variant="small" style={styles.sectionLabel}>
              File attachments
            </Text>

            {attachments.length > 0 && (
              <View style={styles.attachmentsList}>
                {attachments.map((a) => (
                  <View key={a.uri} style={styles.attachmentRow}>
                    <Pressable
                      style={styles.attachmentRowMain}
                      onPress={() => {
                        if (isImageExtension(a.ext)) {
                          setPreviewAttachment(a)
                        } else {
                          setFileToOpen(a)
                        }
                      }}
                    >
                      <DynamicIcon
                        icon={getFileIconForExtension(a.ext)}
                        size={24}
                        color={theme.colors.primary}
                        variant="badge"
                      />
                      <View style={styles.attachmentInfo}>
                        <Text
                          variant="default"
                          style={styles.attachmentName}
                          numberOfLines={1}
                        >
                          {a.name}
                        </Text>
                        <Text variant="muted" style={styles.attachmentMeta}>
                          {formatCreatedAt(a.addedAt)} •{" "}
                          {formatFileSize(a.size)}
                        </Text>
                      </View>
                    </Pressable>
                    <Button
                      variant="ghost"
                      size="icon"
                      style={styles.attachmentRemoveBtn}
                      onPress={() => setAttachmentToRemove(a)}
                      accessibilityLabel="Remove attachment"
                      hitSlop={8}
                    >
                      <IconSymbol name="close" size={20} />
                    </Button>
                  </View>
                ))}
              </View>
            )}
            <Pressable
              style={styles.notesHeader}
              onPress={() => setAddFilesExpanded((e) => !e)}
              accessibilityLabel="Add files"
              accessibilityHint={
                addFilesExpanded ? "Collapse options" : "Expand to add files"
              }
            >
              <IconSymbol
                name="plus"
                size={20}
                color={theme.colors.customColors.semi}
              />
              <Text variant="default" style={styles.addFilesLabel}>
                Add files
              </Text>
              <IconSymbol
                name={addFilesExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                style={styles.chevronIcon}
              />
            </Pressable>
            {addFilesExpanded && (
              <View style={styles.addFilesOptionsContainer}>
                <Pressable
                  style={styles.addFilesOptionRow}
                  onPress={handleSelectFromFiles}
                >
                  <DynamicIcon
                    icon="file-document"
                    size={20}
                    color={theme.colors.primary}
                    variant="badge"
                  />
                  <Text variant="default" style={styles.addFilesOptionLabel}>
                    Select from files
                  </Text>
                  <IconSymbol
                    name="chevron-right"
                    size={20}
                    style={styles.chevronIcon}
                  />
                </Pressable>
                <Pressable
                  style={styles.addFilesOptionRow}
                  onPress={handleTakePhoto}
                >
                  <DynamicIcon
                    icon="camera"
                    size={20}
                    color={theme.colors.primary}
                    variant="badge"
                  />
                  <Text variant="default" style={styles.addFilesOptionLabel}>
                    Take a photo
                  </Text>
                  <IconSymbol
                    name="chevron-right"
                    size={20}
                    style={styles.chevronIcon}
                  />
                </Pressable>
                <Pressable
                  style={styles.addFilesOptionRow}
                  onPress={handleSelectMultipleMedia}
                >
                  <DynamicIcon
                    icon="image-multiple"
                    size={20}
                    color={theme.colors.primary}
                    variant="badge"
                  />
                  <Text variant="default" style={styles.addFilesOptionLabel}>
                    Select multiple media
                  </Text>
                  <IconSymbol
                    name="chevron-right"
                    size={20}
                    style={styles.chevronIcon}
                  />
                </Pressable>
                <Pressable
                  style={[
                    styles.addFilesOptionRow,
                    styles.addFilesOptionRowLast,
                  ]}
                  onPress={handleSelectSinglePhoto}
                >
                  <DynamicIcon
                    icon="image"
                    size={20}
                    color={theme.colors.primary}
                    variant="badge"
                  />
                  <Text variant="default" style={styles.addFilesOptionLabel}>
                    Select a photo
                  </Text>
                  <IconSymbol
                    name="chevron-right"
                    size={20}
                    style={styles.chevronIcon}
                  />
                </Pressable>
              </View>
            )}
          </View>

          {/* Recurring */}
          <View style={styles.fieldBlock}>
            <View style={styles.recurringSwitchRow}>
              <View style={styles.switchLeft}>
                <DynamicIcon
                  icon="calendar-sync"
                  size={20}
                  color={theme.colors.primary}
                  variant="badge"
                />
                <Text variant="default" style={styles.switchLabel}>
                  Recurring transaction
                </Text>
              </View>
              <Switch
                value={recurringEnabled}
                onValueChange={handleRecurringToggle}
              />
            </View>

            {recurringEnabled && (
              <View>
                <View style={styles.recurringSubSection}>
                  <Text variant="small" style={styles.recurringSubLabel}>
                    RECURRENCE
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

                <View style={styles.recurringSubSection}>
                  <Text variant="small" style={styles.recurringSubLabel}>
                    STARTS ON
                  </Text>
                  <Pressable
                    style={styles.recurringDateRow}
                    onPress={() => openDatePicker("recurringStart")}
                  >
                    <DynamicIcon
                      icon="calendar"
                      size={20}
                      color={theme.colors.primary}
                      variant="badge"
                    />
                    <Text variant="default" style={styles.inlineDateText}>
                      {formatCreatedAt(recurringStartDate)}
                    </Text>
                    <IconSymbol
                      name="chevron-right"
                      size={20}
                      style={styles.chevronIcon}
                    />
                  </Pressable>
                </View>

                <View style={styles.recurringSubSection}>
                  <Text variant="small" style={styles.recurringSubLabel}>
                    ENDS ON
                  </Text>
                  <Pressable
                    style={styles.recurringDateRow}
                    onPress={() => setEndsOnPickerExpanded((e) => !e)}
                  >
                    <DynamicIcon
                      icon="calendar"
                      size={20}
                      color={theme.colors.primary}
                      variant="badge"
                    />
                    <Text
                      variant="default"
                      style={[
                        styles.inlineDateText,
                        endsOnType === "never" && styles.fieldPlaceholder,
                      ]}
                    >
                      {endsOnType === "never"
                        ? "Never"
                        : endsOnType === "date" && recurringEndDate
                          ? formatCreatedAt(recurringEndDate)
                          : endsOnType === "occurrences" &&
                              recurringEndAfterOccurrences !== null
                            ? `${recurringEndAfterOccurrences} times`
                            : "Never"}
                    </Text>
                    <IconSymbol
                      name={
                        endsOnPickerExpanded ? "chevron-up" : "chevron-right"
                      }
                      size={20}
                      style={styles.chevronIcon}
                    />
                  </Pressable>
                  {endsOnPickerExpanded && (
                    <View style={styles.endsOnPickerContainer}>
                      <Pressable
                        style={styles.endsOnOptionRow}
                        onPress={() => {
                          setRecurringEndDate(null)
                          setRecurringEndAfterOccurrences(null)
                          setEndsOnPickerExpanded(false)
                        }}
                      >
                        <Text
                          variant="default"
                          style={styles.endsOnOptionLabel}
                        >
                          Never
                        </Text>
                        <IconSymbol
                          name="chevron-right"
                          size={20}
                          style={styles.chevronIcon}
                        />
                      </Pressable>
                      <Pressable
                        style={styles.endsOnOptionRow}
                        onPress={() => {
                          setRecurringEndAfterOccurrences(null)
                          setEndsOnPickerExpanded(false)
                          openDatePicker("recurringEnd")
                        }}
                      >
                        <Text
                          variant="default"
                          style={styles.endsOnOptionLabel}
                        >
                          On a date
                        </Text>
                        <IconSymbol
                          name="chevron-right"
                          size={20}
                          style={styles.chevronIcon}
                        />
                      </Pressable>
                      <Pressable
                        style={[
                          styles.endsOnOptionRow,
                          styles.endsOnOptionRowLast,
                        ]}
                        onPress={() => {
                          setRecurringEndDate(null)
                          setRecurringEndAfterOccurrences(
                            recurringEndAfterOccurrences ?? 4,
                          )
                        }}
                      >
                        <Text
                          variant="default"
                          style={styles.endsOnOptionLabel}
                        >
                          Occurrences
                        </Text>
                        <IconSymbol
                          name="chevron-right"
                          size={20}
                          style={styles.chevronIcon}
                        />
                      </Pressable>
                      {recurringEndAfterOccurrences !== null && (
                        <View style={styles.occurrencePresetsRow}>
                          {ENDS_ON_OCCURRENCE_PRESETS.map((n) => (
                            <Pressable
                              key={n}
                              style={[
                                styles.occurrencePresetButton,
                                recurringEndAfterOccurrences === n &&
                                  styles.recurringToggleButtonSelected,
                              ]}
                              onPress={() => {
                                setRecurringEndAfterOccurrences(n)
                              }}
                            >
                              <Text
                                variant="default"
                                style={[
                                  styles.recurringToggleLabel,
                                  recurringEndAfterOccurrences === n &&
                                    styles.recurringToggleLabelSelected,
                                ]}
                              >
                                {n} times
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Location — coming soon */}
          <View style={styles.fieldBlock}>
            <View style={styles.comingSoonRow}>
              <View style={styles.switchLeft}>
                <DynamicIcon
                  icon="map-marker"
                  size={20}
                  color={theme.colors.primary}
                  variant="badge"
                />
                <Text variant="default" style={styles.switchLabel}>
                  Location
                </Text>
              </View>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonBadgeText}>Coming soon</Text>
              </View>
            </View>
          </View>

          {!isNew && transaction && (
            <View style={styles.deleteButtonBlock}>
              {transaction.isDeleted ? (
                <>
                  <Button
                    variant="ghost"
                    onPress={handleRestore}
                    disabled={isSaving}
                    accessibilityLabel="Restore"
                    accessibilityRole="button"
                  >
                    <IconSymbol name="delete-restore" size={20} />
                    <Text variant="default">Restore</Text>
                  </Button>
                  <Button
                    variant="ghost"
                    onPress={handleDestroy}
                    disabled={isSaving}
                    accessibilityLabel="Destroy permanently"
                    accessibilityRole="button"
                  >
                    <IconSymbol
                      name="trash-can"
                      size={20}
                      style={styles.deleteButtonColor}
                    />
                    <Text variant="default" style={styles.deleteButtonColor}>
                      Permanently delete
                    </Text>
                  </Button>
                </>
              ) : !transaction.isDeleted ? (
                <Button
                  variant="ghost"
                  style={styles.deleteButton}
                  onPress={handleDeleteConfirm}
                  disabled={isSaving}
                  accessibilityLabel="Move to trash"
                  accessibilityRole="button"
                >
                  <IconSymbol
                    name="trash-can"
                    size={20}
                    style={styles.deleteButtonColor}
                  />
                  <Text variant="default" style={styles.deleteButtonColor}>
                    Move to trash
                  </Text>
                </Button>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>

      {/* <KeyboardStickyViewMinty> */}
      <View style={styles.footer}>
        <Button
          variant="secondary"
          size="lg"
          onPress={handleCancelPress}
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
          disabled={isSaving || (!isNew && !isDirty)}
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
      {/* </KeyboardStickyViewMinty> */}

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

      <AttachmentPreviewModal
        attachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />

      <ConfirmModal
        visible={!!fileToOpen}
        onRequestClose={() => setFileToOpen(null)}
        onConfirm={async () => {
          if (fileToOpen) {
            try {
              await openFileInExternalApp(fileToOpen.uri, fileToOpen.ext)
            } finally {
              setFileToOpen(null)
            }
          }
        }}
        title={`Open ${fileToOpen?.name ?? "file"}?`}
        description="Are you sure you want to open this file?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
      />

      <ConfirmModal
        visible={!!attachmentToRemove}
        onRequestClose={() => setAttachmentToRemove(null)}
        onConfirm={() => {
          if (attachmentToRemove) {
            removeAttachment(attachmentToRemove.uri)
            setAttachmentToRemove(null)
          }
        }}
        title="Delete file"
        description="Are you sure you want to remove this attachment?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
      />
      <ConfirmModal
        visible={unsavedModalVisible}
        onRequestClose={() => setUnsavedModalVisible(false)}
        onConfirm={() => {
          pendingLeaveRef.current?.()
          pendingLeaveRef.current = null
        }}
        title="Close without saving?"
        description="All changes will be lost."
        confirmLabel="Discard"
        cancelLabel="Cancel"
        variant="default"
      />

      <ConfirmModal
        visible={destroyModalVisible}
        onRequestClose={() => setDestroyModalVisible(false)}
        onConfirm={handleDestroyConfirm}
        title="Delete permanently?"
        description="This transaction will be removed forever and cannot be restored."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        icon="trash-can"
      />
    </View>
  )
}

const H_PAD = 20
const FORM_GAP = 8
const SECTION_GAP = 8
const ROW_PADDING_V = 10
const ROW_GAP = 10
const CARD_PAD = 12
const SMALL_GAP = 4
const ELEMENT_GAP = 12
const TRIGGER_PAD = 6
const MICRO_GAP = 2
const CATEGORY_CELL_SIZE = 74
const CATEGORY_GAP = 10
const BUTTON_PAD_H = 14

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
    marginTop: SMALL_GAP,
  },
  fieldError: {
    fontSize: 13,
    color: theme.colors.error,
    marginTop: SMALL_GAP,
    paddingHorizontal: H_PAD,
  },
  fieldBlock: {
    marginBottom: FORM_GAP,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.customColors.semi,
    textTransform: "capitalize",
    letterSpacing: 0.5,
    marginBottom: SECTION_GAP,
    marginHorizontal: H_PAD,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: H_PAD,
    marginBottom: SECTION_GAP,
  },
  sectionLabelInRow: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.customColors.semi,
    textTransform: "capitalize",
    letterSpacing: 0.5,
  },
  clearButton: {
    borderRadius: theme.colors.radius,
    paddingVertical: SMALL_GAP,
    paddingHorizontal: SECTION_GAP,
  },
  clearButtonDisabled: {
    opacity: 0.4,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.primary,
    textTransform: "capitalize",
    letterSpacing: 0.5,
  },
  accountTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: ELEMENT_GAP,
    paddingVertical: TRIGGER_PAD,
    paddingHorizontal: TRIGGER_PAD,
    borderRadius: theme.colors.radius,
    marginHorizontal: H_PAD,
    borderWidth: 2,
    borderColor: theme.colors.secondary,
    borderStyle: "dashed",
  },
  accountTriggerSelected: {
    borderStyle: "solid",
    borderColor: theme.colors.primary,
  },
  accountTriggerError: {
    borderColor: theme.colors.error,
  },
  accountTriggerContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: SECTION_GAP,
  },
  accountTriggerName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onSurface,
    flex: 1,
    minWidth: 0,
  },
  accountTriggerBalance: {
    fontSize: 13,
    color: theme.colors.customColors.semi,
  },
  accountTriggerPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.customColors.semi,
  },
  inlineAccountPicker: {
    marginTop: FORM_GAP,
    marginHorizontal: H_PAD,
    padding: CARD_PAD,
    borderRadius: theme.colors.radius,
    backgroundColor: theme.colors.secondary,
    maxHeight: 280,
  },
  inlinePickerRowSelected: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  accountPickerRow: {
    marginTop: FORM_GAP,
    flexDirection: "row",
    alignItems: "center",
    gap: ELEMENT_GAP,
    paddingVertical: TRIGGER_PAD,
    paddingHorizontal: TRIGGER_PAD,
    borderRadius: theme.colors.radius,
  },
  accountPickerRowContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: SECTION_GAP,
  },
  accountPickerRowName: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
    minWidth: 0,
  },
  accountPickerRowBalance: {
    fontSize: 13,
  },
  pickerSearchInput: {
    marginBottom: SECTION_GAP,
  },
  pickerList: {
    height: 180,
  },
  pickerListContent: {
    paddingRight: CARD_PAD,
  },
  categoryScrollContent: {
    paddingHorizontal: H_PAD,
    paddingVertical: SMALL_GAP,
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
    paddingVertical: ROW_PADDING_V,
    paddingHorizontal: TRIGGER_PAD,
    borderRadius: 12,
    // backgroundColor: theme.colors.secondary,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: theme.colors.secondary,
  },
  categoryCellSelected: {
    borderStyle: "solid",

    borderColor: theme.colors.primary,
  },
  categoryCellLabel: {
    fontSize: 11,
    color: theme.colors.onSurface,
    marginTop: SMALL_GAP,
    textAlign: "center",
  },
  tagsWrapGrid: {
    marginHorizontal: H_PAD,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: SECTION_GAP,
    paddingVertical: SMALL_GAP,
  },
  tagChipBase: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: SECTION_GAP,
    paddingVertical: TRIGGER_PAD,
    paddingHorizontal: TRIGGER_PAD,
    borderRadius: theme.colors.radius,
    borderWidth: 2,
  },
  tagChip: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.primary,
  },
  tagChipText: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  tagChipRemoveIcon: {
    color: theme.colors.customColors.semi,
  },
  tagChipAdd: {
    borderStyle: "dashed",
    borderColor: theme.colors.primary,
  },
  tagChipCancel: {
    borderColor: theme.colors.customColors.semi,
  },
  tagChipAddText: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.primary,
  },
  inlineTagPicker: {
    marginTop: FORM_GAP,
    padding: CARD_PAD,
    marginHorizontal: H_PAD,
    borderRadius: 12,
    backgroundColor: theme.colors.secondary,
    maxHeight: 400,
    gap: ROW_GAP,
  },
  tagSearchInput: {
    marginBottom: SECTION_GAP,
  },
  tagPickerList: {
    height: 180,
  },
  tagPickerRow: {
    gap: ROW_GAP,
    marginTop: FORM_GAP,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: TRIGGER_PAD,
    paddingHorizontal: TRIGGER_PAD,
    borderRadius: theme.colors.radius,
    backgroundColor: theme.colors.secondary,
    borderWidth: 2,
    borderColor: theme.colors.secondary,
  },
  tagPickerRowText: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.onSurface,
    flex: 1,
    minWidth: 0,
  },
  createTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: ROW_GAP,
    paddingVertical: ROW_PADDING_V,
    paddingHorizontal: SECTION_GAP,
    marginTop: FORM_GAP,
    borderRadius: theme.colors.radius,
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
    justifyContent: "space-between",
  },
  recurringDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: ROW_GAP,
    paddingVertical: ROW_PADDING_V,
    paddingHorizontal: H_PAD,
  },
  inlineDateText: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
    flex: 1,
    minWidth: 0,
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
    marginBottom: ELEMENT_GAP,
  },
  switchLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: ROW_GAP,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  comingSoonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: ROW_PADDING_V,
    paddingHorizontal: H_PAD,
  },
  comingSoonBadge: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: ROW_PADDING_V,
    paddingVertical: SMALL_GAP,
    borderRadius: theme.colors.radius ?? 12,
  },
  comingSoonBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.onSecondary,
  },
  recurringRightWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: ROW_GAP,
  },
  recurringDisabledOverlay: {
    opacity: 0.7,
  },
  recurringSwitchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: ROW_PADDING_V,
    paddingHorizontal: H_PAD,
  },
  recurringSubSection: {
    marginTop: 2 * FORM_GAP,
  },
  recurringSubLabel: {
    marginHorizontal: H_PAD,
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.customColors.semi,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SECTION_GAP,
  },
  recurringToggleRow: {
    marginHorizontal: H_PAD,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: ROW_GAP,
  },
  recurringToggleButton: {
    paddingVertical: ROW_PADDING_V,
    paddingHorizontal: BUTTON_PAD_H,
    borderRadius: theme.colors.radius ?? 12,
    backgroundColor: theme.colors.secondary,
    borderWidth: 2,
    borderColor: "transparent",
  },
  recurringToggleButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  recurringToggleLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  recurringToggleLabelSelected: {
    color: theme.colors.onPrimary,
  },
  endsOnPickerContainer: {
    marginTop: FORM_GAP,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
    overflow: "hidden",
    marginHorizontal: H_PAD,
  },
  endsOnOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: CARD_PAD,
    paddingHorizontal: H_PAD,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.customColors.semi,
  },
  endsOnOptionRowLast: {
    borderBottomWidth: 0,
  },
  endsOnOptionLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  occurrencePresetsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: ROW_GAP,
    padding: H_PAD,
    paddingTop: 0,
  },
  occurrencePresetButton: {
    paddingVertical: ROW_PADDING_V,
    paddingHorizontal: BUTTON_PAD_H,
    borderRadius: theme.colors.radius ?? 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: "transparent",
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
    alignSelf: "center",
  },
  notesPressable: {
    paddingVertical: ROW_PADDING_V,
    paddingHorizontal: H_PAD,
  },
  notesHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: ROW_GAP,
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: ROW_GAP,
    paddingVertical: ROW_PADDING_V,
    paddingHorizontal: H_PAD,
  },
  notesFullPreviewWrap: {
    marginTop: FORM_GAP,
    minWidth: 0,
    padding: CARD_PAD,
    borderRadius: theme.colors.radius,
    overflow: "hidden",
    backgroundColor: theme.colors.secondary,
  },
  addFilesLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.customColors.semi,
  },
  addFilesOptionsContainer: {
    marginTop: FORM_GAP,
    marginHorizontal: H_PAD,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
    overflow: "hidden",
  },
  addFilesOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: ROW_GAP,
    paddingVertical: CARD_PAD,
    paddingHorizontal: H_PAD,
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.customColors.semi}20`,
  },
  addFilesOptionRowLast: {
    borderBottomWidth: 0,
  },
  addFilesOptionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  attachmentsList: {
    marginTop: ELEMENT_GAP,
    gap: SECTION_GAP,
  },
  attachmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: ROW_GAP,
  },
  attachmentRowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: ROW_GAP,
    minWidth: 0,
    paddingVertical: ROW_PADDING_V,
    paddingHorizontal: H_PAD,
  },
  attachmentInfo: {
    flex: 1,
    minWidth: 0,
    // backgroundColor: theme.colors.secondary,
  },
  attachmentName: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSecondary,
  },
  attachmentMeta: {
    fontSize: 13,
    marginTop: MICRO_GAP,
    color: theme.colors.customColors.semi,
  },
  attachmentRemoveBtn: {
    marginRight: H_PAD,
  },
  notesTextArea: {
    marginHorizontal: H_PAD,
    marginTop: SMALL_GAP,
    padding: CARD_PAD,
    borderRadius: theme.colors.radius,
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
    borderTopLeftRadius: theme.colors.radius,
    borderTopRightRadius: theme.colors.radius,
    paddingBottom: 34,
  },
  datePickerBody: {
    paddingVertical: SECTION_GAP,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SECTION_GAP,
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
    paddingTop: 2 * FORM_GAP,
    paddingBottom: 2 * FORM_GAP,
    gap: ELEMENT_GAP,
    borderTopWidth: 1,
    borderTopColor: `${theme.colors.customColors.semi}20`,
  },
  footerButton: {
    flex: 1,
  },
  deleteButtonBlock: {
    marginTop: FORM_GAP,
    marginBottom: FORM_GAP,
    marginHorizontal: H_PAD,
    gap: ELEMENT_GAP,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonColor: {
    color: theme.colors.error,
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
    marginVertical: MICRO_GAP,
  },
}))
