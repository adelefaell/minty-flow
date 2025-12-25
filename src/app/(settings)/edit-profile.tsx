import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, Pressable, ScrollView } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { StyleSheet } from "react-native-unistyles"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { useProfileStore } from "~/stores/profile.store"
import { getInitials } from "~/utils/string-utils"

export default function EditProfileScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { name, imageUri, setName, setImageUri } = useProfileStore()

  const [localName, setLocalName] = useState(name)
  const [localImageUri, setLocalImageUri] = useState<string | null>(imageUri)

  useEffect(() => {
    setLocalName(name)
    setLocalImageUri(imageUri)
  }, [name, imageUri])

  const displayName = localName || "?"
  const initials = getInitials(displayName)

  const handlePickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need access to your photos to set a profile picture.",
      )
      return
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setLocalImageUri(result.assets[0].uri)
    }
  }

  const handleRemoveImage = () => {
    setLocalImageUri(null)
  }

  const handleSave = () => {
    setName(localName)
    setImageUri(localImageUri)
    router.back()
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Pressable onPress={handlePickImage} style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {localImageUri ? (
                <Image
                  source={{ uri: localImageUri }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
            <View style={styles.cameraIconContainer}>
              <Ionicons name="camera" size={20} style={styles.cameraIcon} />
            </View>
          </Pressable>
          {localImageUri && (
            <Pressable onPress={handleRemoveImage} style={styles.removeButton}>
              <Text style={styles.removeButtonText}>Remove Photo</Text>
            </Pressable>
          )}
        </View>

        {/* Name Input Section */}
        <View style={styles.inputSection}>
          <Text variant="small" style={styles.label}>
            Name
          </Text>
          <Input
            value={localName}
            onChangeText={setLocalName}
            placeholder="Enter your name"
            autoFocus={false}
          />
        </View>
      </ScrollView>

      {/* Save Button - Fixed at bottom */}
      <View
        style={[
          styles.buttonContainer,
          { paddingBottom: Math.max(insets.bottom + 8, 24) },
        ]}
      >
        <Button
          onPress={handleSave}
          variant="default"
          style={styles.saveButton}
        >
          <Ionicons name="checkmark" size={20} style={styles.saveIcon} />
          <Text>Save</Text>
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: theme.radius,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 48,
    fontWeight: "bold",
    color: theme.background,
    lineHeight: 56,
    textAlign: "center",
    includeFontPadding: false,
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: -10,
    right: -10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.primary,
    borderWidth: 3,
    borderColor: theme.background,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraIcon: {
    color: theme.background,
  },
  removeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  removeButtonText: {
    fontSize: 14,
    color: theme.destructive,
    fontWeight: "semibold",
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.mutedForeground,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.foreground,
    minHeight: 48,
  },
  placeholderColor: {
    color: theme.mutedForeground,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  saveButton: {
    width: "100%",
  },
  saveIcon: {
    color: theme.primaryForeground,
  },
}))
