import { Pressable, StyleSheet } from "react-native"

import {
  BottomSheetModalComponent,
  useBottomSheet,
} from "~/components/bottom-sheet"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

/** // TODO: To be deleted later
 * Example Bottom Sheet 1: User Profile Sheet
 * Demonstrates a profile information bottom sheet
 */
export function ExampleBottomSheet1() {
  const sheet = useBottomSheet("profile-sheet")

  return (
    <>
      <Pressable style={styles.triggerButton} onPress={() => sheet.present()}>
        <Text style={styles.triggerButtonText}>Open Profile Sheet</Text>
      </Pressable>

      <BottomSheetModalComponent
        id="profile-sheet"
        // snapPoints={["40%", "70%"]}
        backdropOpacity={0.6}
        onChange={(sheetIndex) => {
          if (sheetIndex === -1) {
            // Sheet closed
          }
        }}
        onDismiss={() => {
          // Handle sheet dismiss
        }}
      >
        <View style={styles.container}>
          <Text variant="h2" style={styles.title}>
            User Profile
          </Text>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <Text variant="h3" style={styles.name}>
              John Doe
            </Text>
            <Text variant="p" style={styles.email}>
              john.doe@example.com
            </Text>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member since</Text>
              <Text style={styles.infoValue}>January 2024</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total transactions</Text>
              <Text style={styles.infoValue}>127</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>Active</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={styles.primaryButton}
              onPress={() => sheet.dismiss()}
            >
              <Text style={styles.primaryButtonText}>Edit Profile</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => sheet.dismiss()}
            >
              <Text style={styles.secondaryButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </BottomSheetModalComponent>
    </>
  )
}

const styles = StyleSheet.create({
  triggerButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "center",
    marginVertical: 8,
  },
  triggerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4A90E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  name: {
    marginBottom: 4,
  },
  email: {
    color: "#666",
    fontSize: 14,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
})
