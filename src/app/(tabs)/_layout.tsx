import * as Haptics from "expo-haptics"
import { useRef, useState } from "react"
import PagerView, {
  type PagerViewOnPageSelectedEvent,
} from "react-native-pager-view"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Tooltip, TooltipProvider } from "~/components/ui/tooltip"
import { View } from "~/components/ui/view"

import HomeScreen from "."
import AccountsScreen from "./accounts"
import SettingsScreen from "./settings"
import StatsScreen from "./stats"

type TabConfig = {
  key: string
  component: React.ComponentType
}

const tabs: TabConfig[] = [
  { key: "home", component: HomeScreen },
  { key: "stats", component: StatsScreen },
  { key: "accounts", component: AccountsScreen },
  { key: "settings", component: SettingsScreen },
]

const TabLayout = () => {
  const pagerRef = useRef<PagerView>(null)
  const [activePage, setActivePage] = useState(0)
  const { theme } = useUnistyles()
  const insets = useSafeAreaInsets()

  const styles = StyleSheet.create((t) => ({
    container: {
      flex: 1,
    },
    pager: {
      flex: 1,
    },
    page: {
      flex: 1,
    },

    // ⛔ NEVER paints, NEVER blocks touches
    tabBarContainer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      backgroundColor: "transparent",
      pointerEvents: "box-none",
    },

    // ✅ Only real hitbox
    tabBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-evenly",
      height: 54,
      width: "90%",
      borderRadius: t.radius,
      backgroundColor: t.colors.secondary,
      marginBottom: insets.bottom + 8,

      pointerEvents: "auto",
    },

    tabButton: {
      alignItems: "center",
      justifyContent: "center",
    },

    centerButton: {
      borderRadius: t.radius,
      backgroundColor: t.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      width: 44,
      height: 44,
      zIndex: 20,
      flexShrink: 0,
    },
  }))

  const onPageSelected = (e: PagerViewOnPageSelectedEvent) => {
    setActivePage(e.nativeEvent.position)
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  const goTo = (index: number) => {
    pagerRef.current?.setPage(index)
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  return (
    <TooltipProvider>
      <View style={styles.container}>
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={0}
          onPageSelected={onPageSelected}
        >
          {tabs.map((tab) => (
            <View key={tab.key} style={styles.page}>
              <tab.component />
            </View>
          ))}
        </PagerView>

        {/* Floating tab bar */}
        <View style={styles.tabBarContainer}>
          <View style={styles.tabBar}>
            <Tooltip text="Home">
              <Button
                variant="link"
                size="icon"
                onPress={() => goTo(0)}
                style={styles.tabButton}
              >
                <IconSymbol
                  name="circle.line"
                  color={
                    activePage === 0
                      ? theme.colors.primary
                      : theme.colors.onSecondary
                  }
                />
              </Button>
            </Tooltip>

            <Tooltip text="Statistics">
              <Button
                variant="link"
                size="icon"
                onPress={() => goTo(1)}
                style={styles.tabButton}
              >
                <IconSymbol
                  name="chart.bar.fill"
                  color={
                    activePage === 1
                      ? theme.colors.primary
                      : theme.colors.onSecondary
                  }
                />
              </Button>
            </Tooltip>

            <Tooltip text="Add Transaction">
              <Button
                variant="default"
                size="icon"
                onPress={() =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                }
                style={styles.centerButton}
              >
                <IconSymbol
                  name="plus"
                  size={28}
                  color={theme.colors.onPrimary}
                />
              </Button>
            </Tooltip>

            <Tooltip text="Accounts">
              <Button
                variant="link"
                size="icon"
                onPress={() => goTo(2)}
                style={styles.tabButton}
              >
                <IconSymbol
                  name="wallet.bifold.fill"
                  color={
                    activePage === 2
                      ? theme.colors.primary
                      : theme.colors.onSecondary
                  }
                />
              </Button>
            </Tooltip>

            <Tooltip text="Settings">
              <Button
                variant="link"
                size="icon"
                onPress={() => goTo(3)}
                style={styles.tabButton}
              >
                <IconSymbol
                  name="gearshape.fill"
                  color={
                    activePage === 3
                      ? theme.colors.primary
                      : theme.colors.onSecondary
                  }
                />
              </Button>
            </Tooltip>
          </View>
        </View>
      </View>
    </TooltipProvider>
  )
}

export default TabLayout
