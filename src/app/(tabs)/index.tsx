import { Link } from "expo-router"
import { useCallback } from "react"
import { Animated, Platform, Pressable } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import { useBottomSheet } from "~/components/bottom-sheet"
import { ExampleBottomSheet1 } from "~/components/bottom-sheets/example-bottom-sheet-1"
import { ExampleBottomSheet2 } from "~/components/bottom-sheets/example-bottom-sheet-2"
import { ButtonExample } from "~/components/button-example"
import { CalculatorSheet } from "~/components/calculator-sheet"
import { HelloWave } from "~/components/hello-wave"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"

export default function HomeScreen() {
  return (
    <Animated.ScrollView
      // headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      // headerImage={
      //   <Image
      //     source={require("~/assets/images/partial-react-logo.png")}
      //     style={styles.reactLogo}
      //   />
      // }
      style={{ flex: 1, padding: 32, gap: 16 }}
      scrollEventThrottle={16}
    >
      <View style={styles.titleContainer}>
        <Text>Welcome!</Text>
        <HelloWave />
      </View>
      <View style={styles.stepContainer}>
        <Text>Step 1: Try it</Text>
        <Text>
          Edit <Text>app/(tabs)/index.tsx</Text> to see changes. Press{" "}
          <Text>
            {Platform.select({
              ios: "cmd + d",
              android: "cmd + m",
              web: "F12",
            })}
          </Text>
          to open developer tools.
        </Text>
      </View>
      <View style={styles.stepContainer}>
        <Link href="/modal" style={styles.link}>
          <Link.Trigger>
            <Text>Step 2: Explore (Click me)</Text>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction
              title="Action"
              icon="cube"
              onPress={() => alert("Action pressed")}
            />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert("Share pressed")}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert("Delete pressed")}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <Text>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </Text>
      </View>
      <View style={styles.stepContainer}>
        <Text>Step 3: Get a fresh start</Text>
        <Text>
          {`When you're ready, run `}
          <Text>npm run reset-project</Text> to get a fresh <Text>app</Text>{" "}
          directory. This will move the current <Text>app</Text> to{" "}
          <Text>app-example</Text>.
        </Text>
      </View>
      <View style={styles.stepContainer}>
        <Text variant="h2" style={styles.pageTitle}>
          Bottom Sheet Examples
        </Text>
        <Text variant="p" style={styles.description}>
          Try out these different bottom sheet examples:
        </Text>
        <ExampleBottomSheet1 />
        <ExampleBottomSheet2 />
        <CalculatorSheetExample />
      </View>

      <ButtonExample />
    </Animated.ScrollView>
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
    color: t.mutedForeground,
  },
  triggerButton: {
    backgroundColor: t.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: t.radius,
    alignSelf: "center",
    marginVertical: 8,
  },
  triggerButtonText: {
    color: t.primaryForeground,
    fontSize: 16,
    fontWeight: "bold",
  },
}))
