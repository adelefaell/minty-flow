import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import type * as Contacts from "expo-contacts"
import { memo, useCallback, useMemo, useState } from "react"
import { ActivityIndicator, Pressable, View } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import {
  BottomSheetModalComponent,
  useBottomSheet,
} from "~/components/bottom-sheet"
import { SearchInput } from "~/components/search-input"
import { Text } from "~/components/ui/text"

interface ContactSelectorSheetProps {
  id: string
  onContactSelected?: (contact: Contacts.Contact) => void
  contacts?: Contacts.Contact[]
  loading?: boolean
  hasPermission?: boolean
}

const SearchHeader = memo(
  ({
    searchQuery,
    onSearchChange,
    onClear,
  }: {
    searchQuery: string
    onSearchChange: (text: string) => void
    onClear: () => void
  }) => {
    return (
      <View style={styles.searchContainer}>
        <SearchInput
          value={searchQuery}
          onChangeText={onSearchChange}
          onClear={onClear}
          placeholder="Search contacts..."
        />
      </View>
    )
  },
)

const ContactItem = memo(
  ({
    contact,
    onPress,
  }: {
    contact: Contacts.Contact
    onPress: (contact: Contacts.Contact) => void
  }) => {
    const handlePress = useCallback(() => {
      onPress(contact)
    }, [contact, onPress])

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
        style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
        onPress={handlePress}
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
      </Pressable>
    )
  },
)

const keyExtractor = (item: Contacts.Contact, index: number) =>
  `${item.phoneNumbers?.[0].number || ""}-contact-${index}`

const EmptyComponent = memo(
  ({
    loading,
    hasPermission,
  }: {
    loading: boolean
    hasPermission: boolean
  }) => (
    <View style={styles.emptyState}>
      {loading ? (
        <ActivityIndicator size="small" />
      ) : !hasPermission ? (
        <Text variant="muted">Contacts permission not granted</Text>
      ) : (
        <Text variant="muted">No contacts found</Text>
      )}
    </View>
  ),
)

export const ContactSelectorSheet = ({
  id,
  onContactSelected,
  contacts = [],
  loading = false,
  hasPermission = false,
}: ContactSelectorSheetProps) => {
  const sheet = useBottomSheet(id)
  const [searchQuery, setSearchQuery] = useState("")

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

  const handleSelect = useCallback(
    (contact: Contacts.Contact) => {
      onContactSelected?.(contact)
      sheet.dismiss()
      setTimeout(() => setSearchQuery(""), 300)
    },
    [onContactSelected, sheet],
  )

  const renderItem = useCallback(
    ({ item }: { item: Contacts.Contact }) => (
      <ContactItem contact={item} onPress={handleSelect} />
    ),
    [handleSelect],
  )

  const handleClear = useCallback(() => setSearchQuery(""), [])

  return (
    <BottomSheetModalComponent
      id={id}
      snapPoints={["70%", "95%"]}
      backdropOpacity={0.5}
      backdropPressBehavior="close"
      keyboardBehavior="extend"
      keyboardBlurBehavior="none"
      enablePanDownToClose={true}
      skipBottomSheetView={true}
      enableDynamicSizing={false}
    >
      <View style={styles.header}>
        <Text variant="h4" style={styles.title}>
          Select a contact
        </Text>
      </View>
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClear={handleClear}
      />
      <BottomSheetFlatList
        data={filteredContacts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="always"
        ListEmptyComponent={
          <EmptyComponent loading={loading} hasPermission={hasPermission} />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={15}
        windowSize={10}
      />
    </BottomSheetModalComponent>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: "700",
  },
  searchContainer: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 40,
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
