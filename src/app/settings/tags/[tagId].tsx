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
import { TabsMinty } from "~/components/tabs-minty"
import { ContactSelectorSheet } from "~/components/tags/contact-selector-sheet"
import { DeleteTagSheet } from "~/components/tags/delete-tag-sheet"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
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

  const handleDelete = async () => {
    try {
      if (!tagModel) return
      await deleteTag(tagModel)

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

  const currentColorScheme = getThemeStrict(formColorSchemeName)

  if (!isAddMode && !tag) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="default">Loading tag...</Text>
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
        {/* Type selector (Tabs) */}
        <TabsMinty<TagKindType>
          items={[
            { value: TagKindEnum.GENERIC, label: "Generic", icon: "tag" },
            { value: TagKindEnum.LOCATION, label: "Location", icon: "map" },
            {
              value: TagKindEnum.CONTACT,
              label: "Person",
              icon: "account",
            },
          ]}
          activeValue={formType}
          onValueChange={(value) => {
            setValue("type", value, { shouldDirty: true })
            setValue("icon", iconBasedType(value), { shouldDirty: true })
          }}
          variant="segmented"
        />

        {formType === "location" ? (
          <View style={styles.comingSoon}>
            <Text variant="h4">Coming soon</Text>
            <Text variant="muted">Location tags are being developed.</Text>
          </View>
        ) : (
          <View style={styles.form} key={tag?.id || NewEnum.NEW}>
            {/* Icon Selection */}
            <View style={styles.iconSection}>
              <Pressable
                style={styles.iconBox}
                onPress={() => changeIconSheet.present()}
              >
                <DynamicIcon
                  icon={formIcon}
                  size={64}
                  colorScheme={currentColorScheme}
                />
              </Pressable>
            </View>

            {/* Name Section */}
            <View style={styles.nameSection}>
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

            {/* Settings List */}
            <View style={styles.settingsList}>
              {/* Person Specific Info */}
              {formType === "contact" && (
                <Pressable
                  style={styles.settingsRow}
                  onPress={handleContactPickerPress}
                  disabled={loadingContacts}
                >
                  <View style={styles.settingsLeft}>
                    {loadingContacts ? (
                      <ActivityIndicator size="small" />
                    ) : (
                      <IconSymbol name="account-details" size={24} />
                    )}
                    <Text variant="default" style={styles.settingsLabel}>
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
              )}

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
            {!isAddMode && <Separator />}
          </View>
        )}

        {!isAddMode && formType !== "location" && (
          <View style={styles.deleteSection}>
            <Button
              variant="ghost"
              onPress={() => deleteTagSheet.present()}
              style={styles.actionButton}
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
        )}
      </ScrollView>

      <KeyboardStickyViewMinty>
        <View style={styles.actions}>
          <Button
            variant="outline"
            onPress={() => router.back()}
            style={styles.button}
          >
            <Text variant="default" style={styles.cancelText}>
              Cancel
            </Text>
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

      {!isAddMode && tag && (
        <DeleteTagSheet tag={tag} onConfirm={handleDelete} />
      )}

      <UnsavedChangesSheet />
    </View>
  )
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
  comingSoon: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 10,
    marginHorizontal: 20,
  },
  form: {
    gap: 30,
  },
  iconSection: {
    alignItems: "center",
    paddingVertical: 10,
  },
  iconBox: {
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
    gap: 10,
    paddingHorizontal: 20,
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
    gap: 10,
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
