import { Image } from "expo-image"
import { Link } from "expo-router"
import { useCallback } from "react"
import { Pressable } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { useBottomSheet } from "~/components/bottom-sheet"
import { ButtonExample } from "~/components/button-example"
import { CalculatorSheet } from "~/components/calculator-sheet"
import { ExampleBottomSheet1 } from "~/components/example-bottom-sheet-1"
import ParallaxScrollView from "~/components/parallax-scroll-view"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("~/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
      // style={{ flex: 1, padding: 32, gap: 16 }}
      // scrollEventThrottle={16}
    >
      <View style={styles.stepContainer}>
        <Text variant="h2" style={styles.pageTitle}>
          Toast Notification Examples
        </Text>
        <Link href="/toast-demo" style={styles.link}>
          <Link.Trigger>
            <Text>Open Interactive Toast Demo →</Text>
          </Link.Trigger>
        </Link>
      </View>

      <View style={styles.stepContainer}>
        <Text variant="h2" style={styles.pageTitle}>
          Bottom Sheet Examples
        </Text>
        <Text variant="p" style={styles.description}>
          Try out these different bottom sheet examples:
        </Text>
        <ExampleBottomSheet1 />
        <CalculatorSheetExample />
      </View>

      <ButtonExample />
    </ParallaxScrollView>
  )
}

function CalculatorSheetExample() {
  const sheet = useBottomSheet("calculator-sheet")

  const handleSubmit = useCallback(
    (value: number) => {
      alert(`Calculator submitted with value: ${value}`)
      sheet.dismiss()
    },
    [sheet],
  )

  return (
    <>
      <Pressable style={styles.triggerButton} onPress={() => sheet.present()}>
        <Text style={styles.triggerButtonText}>Open Calculator</Text>
      </Pressable>

      <CalculatorSheet
        id="calculator-sheet"
        title="Expense"
        onSubmit={handleSubmit}
        onChange={(sheetIndex) => {
          if (sheetIndex === -1) {
            // Sheet closed
          }
        }}
        onDismiss={() => {
          // Handle sheet dismiss
        }}
      />
    </>
  )
}

const styles = StyleSheet.create((t) => ({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  link: {
    textDecorationLine: "underline",
  },
  pageTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    marginBottom: 16,
    textAlign: "center",
    color: t.colors.onSecondary,
  },
  triggerButton: {
    backgroundColor: t.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: t.radius,
    alignSelf: "center",
    marginVertical: 8,
  },
  triggerButtonText: {
    color: t.colors.onPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
}))
