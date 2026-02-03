import { zodResolver } from "@hookform/resolvers/zod"
import { withObservables } from "@nozbe/watermelondb/react"
import * as Contacts from "expo-contacts"
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import { useCallback, useEffect, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { ActivityIndicator, ScrollView } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { useBottomSheet } from "~/components/bottom-sheet"
import { ChangeIconSheet } from "~/components/change-icon-sheet"
import { ColorVariantSheet } from "~/components/color-variant-sheet"
import { DynamicIcon } from "~/components/dynamic-icon"
import { KeyboardStickyViewMinty } from "~/components/keyboard-sticky-view-minty"
import { ContactSelectorSheet } from "~/components/tags/contact-selector-sheet"
import { DeleteTagSheet } from "~/components/tags/delete-tag-sheet"
import { Button } from "~/components/ui/button"
import { IconSymbol, type IconSymbolName } from "~/components/ui/icon-symbol"
import { Input } from "~/components/ui/input"
import { Pressable } from "~/components/ui/pressable"
import { Separator } from "~/components/ui/separator"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import {
  UnsavedChangesSheet,
  useUnsavedChangesWarning,
} from "~/components/unsaved-changes-sheet"
import type TagModel from "~/database/models/Tag"
import {
  createTag,
  deleteTag,
  observeTagById,
  updateTag,
} from "~/database/services/tag-service"
import { modelToTag } from "~/database/utils/model-to-tag"
import { type AddTagsFormSchema, addTagsSchema } from "~/schemas/tags.schema"
import { getThemeStrict } from "~/styles/theme/registry"
import { NewEnum } from "~/types/new"
import { type Tag, TagKindEnum, type TagKindType } from "~/types/tags"
import { logger } from "~/utils/logger"
import { Toast } from "~/utils/toast"

interface EditTagScreenProps {
  tagId: string
  tagModel?: TagModel
  tag?: Tag
}

const EditTagScreenInner = ({ tagId, tagModel, tag }: EditTagScreenProps) => {
  const router = useRouter()
  const isAddMode = tagId === NewEnum.NEW || !tagId

  const iconBasedType = (type?: TagKindType) => {
    if (type === TagKindEnum.CONTACT) return "account"
    if (type === TagKindEnum.LOCATION) return "map"
    return "tag"
  }

  // Form state
  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(addTagsSchema),
    defaultValues: {
      name: tag?.name || "",
      type: tag?.type || TagKindEnum.GENERIC,
      icon: tag?.icon || "tag",
      colorSchemeName: tag?.colorSchemeName || undefined,
    },
  })

  const formName = watch("name")
  const formIcon = watch("icon")
  const formColorSchemeName = watch("colorSchemeName")
  const formType = watch("type")

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Contacts picker state
  const [contacts, setContacts] = useState<Contacts.Contact[]>([])
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [hasContactsPermission, setHasContactsPermission] = useState(false)

  // Navigation and unsaved changes
  const navigation = useNavigation()
  const unsavedChangesWarning = useUnsavedChangesWarning()
  const isNavigatingRef = useRef(false)

  // Sheets
  const changeIconSheet = useBottomSheet(
    `change-icon-tag-${tagId || NewEnum.NEW}`,
  )
  const colorVariantSheet = useBottomSheet(
    `color-variant-tag-${tagId || NewEnum.NEW}`,
  )
  const contactSelectorSheet = useBottomSheet(
    `contact-selector-tag-${tagId || NewEnum.NEW}`,
  )
  const deleteTagSheet = useBottomSheet(`delete-tag-${tagId || NewEnum.NEW}`)

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (isSubmitting || isNavigatingRef.current || !isDirty) return
      e.preventDefault()
      unsavedChangesWarning.show(
        () => {
          isNavigatingRef.current = true
          router.back()
        },
        () => {},
      )
    })
    return unsubscribe
  }, [navigation, isDirty, isSubmitting, router, unsavedChangesWarning])

  const onSubmit = async (data: AddTagsFormSchema) => {
    setIsSubmitting(true)
    try {
      if (isAddMode) {
        await createTag({
          name: data.name,
          type: data.type,
          icon: data.icon,
          colorSchemeName: data.colorSchemeName,
        })
      } else {
        if (!tagModel) {
          Toast.error({ title: "Error", description: "Tag not found" })
          return
        }
        await updateTag(tagModel, {
          name: data.name,
          type: data.type,
          icon: data.icon,
          colorSchemeName: data.colorSchemeName,
        })
      }
      isNavigatingRef.current = true
      router.back()
    } catch (error) {
      logger.error("Error saving tag", { error })
      Toast.error({
        title: "Error",
        description: `Failed to ${isAddMode ? "create" : "update"} tag.`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePress = () => {
    deleteTagSheet.present()
  }

  const handleDelete = async () => {
    try {
      if (!tagModel) return
      await deleteTag(tagModel)
      Toast.success({
        title: "Tag deleted",
        description: "The tag has been deleted",
      })
      isNavigatingRef.current = true
      router.back()
    } catch (error) {
      logger.error("Error deleting tag", { error })
      Toast.error({ title: "Error", description: "Failed to delete tag." })
    }
  }

  const handleContactPickerPress = useCallback(async () => {
    setLoadingContacts(true)
    try {
      const { status } = await Contacts.requestPermissionsAsync()

      if (status === "granted") {
        setHasContactsPermission(status === "granted")
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
          sort: Contacts.SortTypes.FirstName,
        })
        setContacts(data)
        contactSelectorSheet.present()
      } else {
        Toast.warn({
          title: "Permission denied",
          description:
            "We need contacts permission to select a contact from your phone.",
        })
        logger.warn("Contacts permission denied")
      }
    } catch (error) {
      logger.error("Error loading contacts", {
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoadingContacts(false)
    }
  }, [contactSelectorSheet])

  const types: { kind: TagKindType; label: string; icon: IconSymbolName }[] = [
    { kind: TagKindEnum.GENERIC, label: "Generic", icon: "tag" },
    { kind: TagKindEnum.LOCATION, label: "Location", icon: "map" },
    { kind: TagKindEnum.CONTACT, label: "Person", icon: "account" },
  ]

  const currentColorScheme = getThemeStrict(formColorSchemeName)

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Type selector (Tabs) */}
        <View style={styles.tabs}>
          {types.map((t) => (
            <Pressable
              key={t.kind}
              style={[styles.tab, formType === t.kind && styles.activeTab]}
              onPress={() => {
                setValue("type", t.kind, { shouldDirty: true })
                setValue("icon", iconBasedType(t.kind), { shouldDirty: true })
              }}
            >
              <IconSymbol
                name={t.icon}
                size={18}
                style={[
                  styles.tabIcon,
                  formType === t.kind && styles.activeTabLabel,
                ]}
              />
              <Text
                variant="default"
                style={[
                  styles.tabLabel,
                  formType === t.kind && styles.activeTabLabel,
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {formType === "location" ? (
          <View style={styles.comingSoon}>
            <Text variant="h4">Coming soon</Text>
            <Text variant="muted">Location tags are being developed.</Text>
          </View>
        ) : (
          <View style={styles.form}>
            {/* Large Icon Preview */}
            <View style={styles.iconPreviewSection}>
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
                  size={64}
                  colorScheme={currentColorScheme}
                />
              </Pressable>
            </View>

            {/* Name Input */}
            <View style={styles.field}>
              <Text variant="small" style={styles.label}>
                {formType === "contact" ? "Contact name" : "Tag name"}
              </Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={
                      formType === "contact" ? "John Doe" : "Work, Shopping..."
                    }
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

            {/* Person Specific Info */}
            {formType === "contact" && (
              <View style={styles.field}>
                <Pressable
                  style={styles.contactPicker}
                  onPress={handleContactPickerPress}
                  disabled={loadingContacts}
                >
                  <View style={styles.contactPickerLeft} variant="muted">
                    {loadingContacts ? (
                      <ActivityIndicator size="small" />
                    ) : (
                      <IconSymbol name="account-details" size={24} />
                    )}
                    <Text variant="muted">
                      {loadingContacts
                        ? "Loading contacts..."
                        : "Select contact from phone"}
                    </Text>
                  </View>
                  <IconSymbol
                    name="chevron-right"
                    size={20}
                    style={styles.chevronIcon}
                  />
                </Pressable>
              </View>
            )}

            {/* Color Selection */}
            <View style={styles.field}>
              <Pressable
                style={styles.colorSelector}
                onPress={() => colorVariantSheet.present()}
              >
                <View style={styles.colorSelectorLeft} variant="muted">
                  <IconSymbol name="palette" size={24} />
                  <Text variant="default" style={styles.colorLabel}>
                    Change color
                  </Text>
                </View>
                <View style={styles.colorSelectorRight} variant="muted">
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
          </View>
        )}

        {!isAddMode && (
          <>
            <Separator />
            <View style={styles.deleteSection}>
              <Button
                variant="ghost"
                onPress={handleDeletePress}
                style={styles.deleteButton}
              >
                <IconSymbol
                  name="trash-can"
                  size={20}
                  style={styles.deleteIcon}
                />
                <Text variant="default" style={styles.deleteText}>
                  Delete Tag
                </Text>
              </Button>
            </View>
          </>
        )}
      </ScrollView>

      <KeyboardStickyViewMinty>
        <View style={styles.actions}>
          <Button
            variant="outline"
            onPress={() => router.back()}
            style={styles.button}
          >
            <Text variant="default">Cancel</Text>
          </Button>
          <Button
            variant="default"
            onPress={handleFormSubmit(onSubmit)}
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

      <ChangeIconSheet
        id={`change-icon-tag-${tagId || NewEnum.NEW}`}
        currentIcon={formIcon}
        onIconSelected={(icon) => {
          setValue("icon", icon, { shouldDirty: true })
          changeIconSheet.dismiss()
        }}
        colorScheme={currentColorScheme}
      />

      <ColorVariantSheet
        id={`color-variant-tag-${tagId || NewEnum.NEW}`}
        selectedSchemeName={formColorSchemeName}
        onColorSelected={(scheme) => {
          setValue("colorSchemeName", scheme, { shouldDirty: true })
        }}
        onClearSelection={() =>
          setValue("colorSchemeName", undefined, { shouldDirty: true })
        }
        onDismiss={() => colorVariantSheet.dismiss()}
      />

      <ContactSelectorSheet
        id={`contact-selector-tag-${tagId || NewEnum.NEW}`}
        contacts={contacts}
        loading={loadingContacts}
        hasPermission={hasContactsPermission}
        onContactSelected={(contact) => {
          if (contact.name) {
            setValue("name", contact.name, { shouldDirty: true })
          }
        }}
      />

      {tag && <DeleteTagSheet tag={tag} onConfirm={handleDelete} />}

      <UnsavedChangesSheet />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingBottom: 100,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
    padding: 4,
    gap: 4,
    margin: 20,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: theme.colors.radius,
    gap: 6,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabIcon: {
    color: theme.colors.onSurface,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  activeTabLabel: {
    color: theme.colors.onPrimary,
  },
  comingSoon: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
    marginHorizontal: 20,
  },
  form: {
    gap: 24,
    marginHorizontal: 20,
    marginBottom: 40,
  },
  iconPreviewSection: {
    alignItems: "center",
    paddingVertical: 8,
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: theme.colors.radius,
    backgroundColor: theme.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  field: { gap: 8 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.onSurface,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  errorText: { color: theme.colors.error, fontSize: 12 },
  contactPicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
  },
  contactPickerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingsLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingsRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  colorSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
    // borderWidth: 1,
    // borderColor: theme.colors.onSurface,
  },
  colorSelectorLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorSelectorRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSecondary,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderColor: theme.colors.onSecondary,
  },
  defaultColorText: {
    fontSize: 14,
    color: theme.colors.onSecondary,
    opacity: 0.6,
  },
  chevronIcon: {
    color: theme.colors.onSecondary,
    opacity: 0.4,
  },
  deleteSection: {
    textAlign: "center",
    margin: 40,
    paddingHorizontal: 20,
  },
  deleteButton: { width: "100%" },
  deleteIcon: { color: theme.colors.error },
  deleteText: { color: theme.colors.error, fontWeight: "600" },
  actions: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    backgroundColor: theme.colors.surface,
  },
  button: { flex: 1 },
  saveText: { color: theme.colors.onPrimary, fontWeight: "600" },
}))

const EnhancedEditTagScreen = withObservables(
  ["tagId"],
  ({ tagId }: { tagId: string }) => ({
    tagModel: observeTagById(tagId),
  }),
)(({ tagId, tagModel }: { tagId: string; tagModel: TagModel }) => {
  const tag = tagModel ? modelToTag(tagModel) : undefined
  return (
    <EditTagScreenInner
      key={tagModel?.id || tagId}
      tagId={tagId}
      tagModel={tagModel}
      tag={tag}
    />
  )
})

export default function EditTagScreen() {
  const { tagId } = useLocalSearchParams<{
    tagId: string
  }>()
  if (tagId === NewEnum.NEW || !tagId)
    return <EditTagScreenInner tagId={NewEnum.NEW} />
  return <EnhancedEditTagScreen tagId={tagId} />
}
