/**
 * Inline contact selector: trigger row + expandable panel with search and scroll.
 * Requests contacts permission and loads list when expanded; same trigger style as AccountTypeInline.
 */

import * as Contacts from "expo-contacts"
import { Suspense, use, useCallback, useMemo, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  View,
} from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { SearchInput } from "~/components/search-input"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { Toast } from "~/utils/toast"

const LAYOUT_ANIM = LayoutAnimation.Presets.easeInEaseOut

const LIST_MAX_HEIGHT = 280

function createContactsPromise(
  onPermissionDenied?: () => void,
): Promise<{ contacts: Contacts.Contact[]; hasPermission: boolean }> {
  return (async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync()
      const granted = status === "granted"
      if (!granted) {
        onPermissionDenied?.()
        Toast.warn({
          title: "Permission Required",
          description:
            "Please grant permission to access your contacts in order to select a contact from your phone.",
        })
        return { contacts: [], hasPermission: false }
      }
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
          Contacts.Fields.FirstName,
        ],
        sort: Contacts.SortTypes.FirstName,
      })
      return { contacts: data, hasPermission: true }
    } catch {
      return { contacts: [], hasPermission: false }
    }
  })()
}

export interface ContactSelectorInlineProps {
  /** Called when user selects a contact (select and close). */
  onContactSelected: (contact: Contacts.Contact) => void
  /** Optional: when permission is denied after request. */
  onPermissionDenied?: () => void
  /** When false, the trigger row is not tappable. */
  editable?: boolean
}

interface ContactsPanelContentProps {
  contactsPromise: Promise<{
    contacts: Contacts.Contact[]
    hasPermission: boolean
  }>
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedContact: Contacts.Contact | null
  setSelectedContact: (c: Contacts.Contact | null) => void
  onDone: () => void
}

function ContactsPanelContent({
  contactsPromise,
  searchQuery,
  setSearchQuery,
  selectedContact,
  setSelectedContact,
  onDone,
}: ContactsPanelContentProps) {
  const { contacts, hasPermission } = use(contactsPromise)

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts
    const query = searchQuery.toLowerCase().trim()
    return contacts.filter(
      (c) =>
        c.name?.toLowerCase().includes(query) ||
        c.phoneNumbers?.some((p) => p.number?.toLowerCase().includes(query)) ||
        c.emails?.some((e) => e.email?.toLowerCase().includes(query)),
    )
  }, [contacts, searchQuery])

  const handleSelectContact = useCallback(
    (contact: Contacts.Contact) => {
      setSelectedContact(contact)
    },
    [setSelectedContact],
  )

  return (
    <View style={styles.panel}>
      <View style={styles.searchContainer}>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery("")}
          placeholder="Search contacts..."
        />
      </View>
      <View style={styles.listWrapper}>
        <FlatList
          data={filteredContacts}
          keyExtractor={(item, index) =>
            `${item.firstName ?? ""}-${item.phoneNumbers?.[0]?.number ?? ""}-${index}`
          }
          renderItem={({ item }) => (
            <ContactItem
              contact={item}
              selected={selectedContact === item}
              onPress={handleSelectContact}
            />
          )}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="always"
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text variant="muted">
                {!hasPermission
                  ? "Contacts permission not granted"
                  : "No contacts found"}
              </Text>
            </View>
          }
        />
      </View>
      <Button
        variant="default"
        onPress={onDone}
        disabled={!selectedContact}
        style={styles.doneButton}
      >
        <Text>Done</Text>
      </Button>
    </View>
  )
}

export function ContactSelectorInline({
  onContactSelected,
  onPermissionDenied,
  editable = true,
}: ContactSelectorInlineProps) {
  const [expanded, setExpanded] = useState(false)
  const [contactsPromise, setContactsPromise] = useState<Promise<{
    contacts: Contacts.Contact[]
    hasPermission: boolean
  }> | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContact, setSelectedContact] =
    useState<Contacts.Contact | null>(null)

  const handleToggle = useCallback(() => {
    if (!editable) return
    LayoutAnimation.configureNext(LAYOUT_ANIM)
    setSearchQuery("")
    setSelectedContact(null)
    if (expanded) {
      setContactsPromise(null)
      setExpanded(false)
    } else {
      setContactsPromise(createContactsPromise(onPermissionDenied))
      setExpanded(true)
    }
  }, [editable, expanded, onPermissionDenied])

  const handleDone = useCallback(() => {
    if (!selectedContact) return
    onContactSelected(selectedContact)
    LayoutAnimation.configureNext(LAYOUT_ANIM)
    setSearchQuery("")
    setSelectedContact(null)
    setContactsPromise(null)
    setExpanded(false)
  }, [selectedContact, onContactSelected])

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={styles.triggerRow}
        onPress={handleToggle}
        disabled={!editable}
      >
        <View style={styles.triggerLeft}>
          <IconSymbol name="account-details" size={24} />
          <Text variant="default" style={styles.triggerLabel}>
            Select contact from phone
          </Text>
        </View>
        {editable && (
          <IconSymbol
            name={expanded ? "chevron-up" : "chevron-right"}
            size={20}
            style={styles.chevronIcon}
          />
        )}
      </Pressable>

      {editable && expanded && contactsPromise && (
        <Suspense
          fallback={
            <View style={styles.panel}>
              <View style={styles.searchContainer} />
              <View style={styles.listWrapper}>
                <View style={styles.emptyState}>
                  <ActivityIndicator size="small" />
                </View>
              </View>
            </View>
          }
        >
          <ContactsPanelContent
            contactsPromise={contactsPromise}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedContact={selectedContact}
            setSelectedContact={setSelectedContact}
            onDone={handleDone}
          />
        </Suspense>
      )}
    </View>
  )
}

function ContactItem({
  contact,
  selected,
  onPress,
}: {
  contact: Contacts.Contact
  selected: boolean
  onPress: (contact: Contacts.Contact) => void
}) {
  const initials = contact.name
    ? contact.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?"

  return (
    <Pressable
      style={({ pressed }: { pressed: boolean }) => [
        styles.item,
        pressed && styles.itemPressed,
        selected && styles.itemSelected,
      ]}
      onPress={() => onPress(contact)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.itemContent}>
        <Text variant="large" style={styles.contactName}>
          {contact.name}
        </Text>
        {contact.phoneNumbers && contact.phoneNumbers.length > 0 && (
          <Text variant="muted" style={styles.phoneNumber}>
            {contact.phoneNumbers[0].number}
          </Text>
        )}
      </View>
      {selected && (
        <IconSymbol name="check" size={20} style={styles.itemCheck} />
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    width: "100%",
  },
  triggerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  triggerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  triggerLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
  chevronIcon: {
    color: theme.colors.onSecondary,
    opacity: 0.4,
  },
  panel: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginTop: 0,
    gap: 12,
  },
  searchContainer: {
    marginBottom: 4,
  },
  listWrapper: {
    maxHeight: LIST_MAX_HEIGHT,
    borderRadius: theme.colors.radius ?? 12,
    overflow: "hidden",
    backgroundColor: `${theme.colors.onSurface}08`,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingBottom: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  itemPressed: {
    opacity: 0.7,
    backgroundColor: `${theme.colors.onSurface}10`,
  },
  itemSelected: {
    backgroundColor: `${theme.colors.primary}12`,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  itemCheck: {
    color: theme.colors.primary,
  },
  doneButton: {
    marginTop: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: theme.colors.onSecondary,
    fontWeight: "600",
    fontSize: 16,
  },
  itemContent: {
    flex: 1,
  },
  contactName: {
    fontWeight: "500",
    fontSize: 16,
  },
  phoneNumber: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
}))
