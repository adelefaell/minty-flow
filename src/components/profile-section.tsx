import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { Pressable } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import { useProfileStore } from "~/stores/profile.store"
import { getInitials } from "~/utils/string-utils"

export function ProfileSection() {
  const router = useRouter()
  const { name, imageUri } = useProfileStore()
  const { theme } = useUnistyles()

  const displayName = name || "?"
  const initials = getInitials(displayName)

  const handlePress = () => {
    router.push("/(settings)/edit-profile")
  }

  return (
    <View style={styles.profileSection}>
      <Pressable
        style={styles.profileInfo}
        onPress={handlePress}
        android_ripple={{
          color: theme.rippleColor,
          foreground: true, // <-- KEY TO MAKE IT SHOW
        }}
      >
        <View style={styles.avatar}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.avatarImage}
              contentFit="cover"
            />
          ) : (
            <Text style={styles.avatarText}>{initials}</Text>
          )}
        </View>
        <Text variant="h3" style={styles.profileName}>
          {displayName}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  profileSection: {
    marginInline: 20,
    marginBottom: 20,
  },
  profileInfo: {
    paddingBottom: 20,
    paddingVertical: 20,
    flexDirection: "column",
    alignItems: "center",
    borderRadius: theme.radius,
    overflow: "hidden",
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: theme.radius,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.background,
    lineHeight: 32,
    textAlign: "center",
    includeFontPadding: false,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.foreground,
  },
}))
