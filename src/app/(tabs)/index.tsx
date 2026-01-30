import { Image } from "expo-image"
import { Link } from "expo-router"
import { useCallback } from "react"
import { StyleSheet } from "react-native-unistyles"

import { useBottomSheet } from "~/components/bottom-sheet"
import { CalculatorSheet } from "~/components/calculator-sheet"
import { ChangeIconSheet } from "~/components/change-icon-sheet"
import { ColorVariantSheet } from "~/components/color-variant-sheet"
import { CurrencySelectorSheet } from "~/components/currency-selector-sheet"
import ParallaxScrollView from "~/components/parallax-scroll-view"
import { Pressable } from "~/components/ui/pressable"
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

      {/* <View style={styles.stepContainer}>
        <Text variant="h2" style={styles.pageTitle}>
          Icons List
        </Text>
        <Link href="/icons-list" style={styles.link}>
          <Link.Trigger>
            <Text>Dont click here →</Text>
          </Link.Trigger>
        </Link>
      </View> */}

      <View style={styles.stepContainer}>
        <Text variant="h2" style={styles.pageTitle}>
          Bottom Sheet Examples
        </Text>
        <Text variant="p" style={styles.description}>
          Try out these different bottom sheet examples:
        </Text>
        <CalculatorSheetExample />
        <ChangeIconSheetExample />
        <ColorVariantSheetExample />
        <CurrencySelectorSheetExample />
      </View>
    </ParallaxScrollView>
  )
}

const CalculatorSheetExample = () => {
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

const ChangeIconSheetExample = () => {
  const sheet = useBottomSheet("change-icon-sheet")

  return (
    <>
      <Pressable style={styles.triggerButton} onPress={() => sheet.present()}>
        <Text style={styles.triggerButtonText}>Open Change Icon Sheet</Text>
      </Pressable>

      <ChangeIconSheet
        id="change-icon-sheet"
        onIconSelected={(selectedIcon) => {
          // Handle icon selection
          alert(`Icon selected: ${selectedIcon}`)
          sheet.dismiss()
        }}
      />
    </>
  )
}

const ColorVariantSheetExample = () => {
  const sheet = useBottomSheet("color-variant-sheet")

  return (
    <>
      <Pressable style={styles.triggerButton} onPress={() => sheet.present()}>
        <Text style={styles.triggerButtonText}>Select Color Variant</Text>
      </Pressable>

      <ColorVariantSheet
        id="color-variant-sheet"
        onColorSelected={(schemeName) => {
          // Color variant has been selected - use it for your purpose
          alert(`Selected color scheme: ${schemeName}`)
        }}
        onClearSelection={() => {
          // Selection has been cleared
          alert("Selection cleared")
        }}
        onDismiss={() => {
          // Handle sheet dismiss
        }}
      />
    </>
  )
}

const CurrencySelectorSheetExample = () => {
  const sheet = useBottomSheet("currency-selector-sheet")

  return (
    <>
      <Pressable style={styles.triggerButton} onPress={() => sheet.present()}>
        <Text style={styles.triggerButtonText}>Open Currency Selector</Text>
      </Pressable>

      <CurrencySelectorSheet
        id="currency-selector-sheet"
        onCurrencySelected={(code) => {
          alert(`Selected currency: ${code}`)
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
    marginBottom: 200,
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
    borderRadius: t.colors.radius,
    alignSelf: "center",
    marginVertical: 8,
  },
  triggerButtonText: {
    color: t.colors.onPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
}))
