import * as Haptics from "expo-haptics"
import { useRef, useState } from "react"
import PagerView, {
  type PagerViewOnPageSelectedEvent,
} from "react-native-pager-view"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Tooltip } from "~/components/ui/tooltip"
import { View } from "~/components/ui/view"

import HomeScreen from "."
import AccountsScreen from "./accounts-view"
import SettingsScreen from "./settings-view"
import StatsScreen from "./stats-view"

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
  const insets = useSafeAreaInsets()
  const { theme } = useUnistyles()

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

  const isActiveTab = (index: number) =>
    activePage === index ? { opacity: 1 } : { opacity: 0.8 }

  return (
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
        <View
          style={[
            styles.tabBar(insets.bottom),
            { backgroundColor: theme.colors.secondary },
          ]}
        >
          <Tooltip text="Home">
            <Button
              variant="link"
              size="icon"
              onPress={() => goTo(0)}
              style={styles.tabButton}
            >
              <IconSymbol name="circle" style={isActiveTab(0)} />
            </Button>
          </Tooltip>

          <Tooltip text="Statistics">
            <Button
              variant="link"
              size="icon"
              onPress={() => goTo(1)}
              style={styles.tabButton}
            >
              <IconSymbol name="chart-box" style={isActiveTab(1)} />
            </Button>
          </Tooltip>

          <Tooltip text="Add Transaction">
            <Button
              size="icon"
              onPress={() =>
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              }
              style={[
                styles.centerButton,
                { backgroundColor: theme.colors.primary },
              ]}
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
              <IconSymbol name="wallet-bifold" style={isActiveTab(2)} />
            </Button>
          </Tooltip>

          <Tooltip text="Settings">
            <Button
              variant="link"
              size="icon"
              onPress={() => goTo(3)}
              style={styles.tabButton}
            >
              <IconSymbol name="cog" style={isActiveTab(3)} />
            </Button>
          </Tooltip>
        </View>
      </View>
    </View>
  )
}

export default TabLayout

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
  tabBar: (bottomInsets: number) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    height: 54,
    width: "90%",
    borderRadius: t.colors.radius,
    marginBottom: bottomInsets + 8,
    pointerEvents: "auto",
  }),

  tabButton: {
    alignItems: "center",
    justifyContent: "center",
  },

  centerButton: {
    borderRadius: t.colors.radius,
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    zIndex: 20,
    flexShrink: 0,
  },
}))
