import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { AppState } from "react-native"
import PagerView, { usePagerView } from "react-native-pager-view"
import Animated, {
  createAnimatedComponent,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { Button } from "~/components/ui/button"
import { IconSymbol, type IconSymbolName } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"

const AnimatedPressable = createAnimatedComponent(Pressable)

import { Tooltip } from "~/components/ui/tooltip"
import { View } from "~/components/ui/view"
import { synchronizeAllRecurringTransactions } from "~/database/services/recurring-transaction-service"
import { autoPurgeTrash } from "~/database/services/transaction-service"
import { useTrashBinStore } from "~/stores/trash-bin.store"
import { NewEnum } from "~/types/new"
import { logger } from "~/utils/logger"

import AccountsScreen from "../accounts"
import SettingsScreen from "../settings"
import HomeScreen from "."
import StatsScreen from "./stats-view"

type TabConfig = {
  key: string
  component: React.ComponentType
}

type FABOption = {
  icon: IconSymbolName
  color: string
  iconColor: string
  label: string
  onPress: () => void
}

const tabs: TabConfig[] = [
  { key: "home", component: HomeScreen },
  { key: "stats", component: StatsScreen },
  { key: "accounts", component: AccountsScreen },
  { key: "settings", component: SettingsScreen },
]

const INSTANT_TIMING = {
  duration: 80,
  easing: Easing.out(Easing.quad),
}

// Static positions for each FAB option (no translate; same layout as before)
const FAB_OPTION_POSITIONS = [
  { left: 2, top: -78 }, // Top
  { left: 82, top: -38 }, // Top Right
  { left: -78, top: -38 }, // Top Left
]

const AnimatedFABOption = ({
  option,
  index,
  isExpanded,
}: {
  option: FABOption
  index: number
  isExpanded: boolean
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isExpanded ? 1 : 0, INSTANT_TIMING),
  }))

  return (
    <AnimatedPressable
      onPress={option.onPress}
      pointerEvents={isExpanded ? "auto" : "none"}
      style={[
        styles.fabOptionWrapper,
        FAB_OPTION_POSITIONS[index],
        styles.fabOption,
        { backgroundColor: option.color },
        animatedStyle,
      ]}
    >
      <IconSymbol name={option.icon} size={24} color={option.iconColor} />
    </AnimatedPressable>
  )
}

const TabLayout = () => {
  const { theme } = useUnistyles()
  const { ref: pagerRef, activePage, setPage } = usePagerView()
  const [fabExpanded, setFabExpanded] = useState(false)

  // Animation values
  const rotation = useSharedValue(0)
  const overlayOpacity = useSharedValue(0)
  const retentionPeriod = useTrashBinStore((s) => s.retentionPeriod)
  const isActiveTab = (index: number) =>
    activePage === index ? { opacity: 1 } : { opacity: 0.8 }

  useEffect(() => {
    autoPurgeTrash(retentionPeriod).catch((e) =>
      logger.error("Trash purge failed", { error: String(e) }),
    )
  }, [retentionPeriod])

  // ── Recurring transactions sync (matches Flutter singleton behaviour) ──
  // Runs once on mount and again every time the app returns to foreground.
  useEffect(() => {
    let cancelled = false

    const syncTransactions = () => {
      if (cancelled) return
      synchronizeAllRecurringTransactions().catch((e) =>
        logger.error("Recurring sync failed", { error: String(e) }),
      )
    }

    syncTransactions()

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        syncTransactions()
      }
    })

    return () => {
      cancelled = true
      sub.remove()
    }
  }, [])

  const toggleFab = () => {
    const newState = !fabExpanded
    setFabExpanded(newState)

    rotation.value = withSpring(newState ? 45 : 0, {
      stiffness: 600,
      damping: 20,
      mass: 0.5,
    })

    overlayOpacity.value = withTiming(newState ? 0.8 : 0, {
      duration: 100,
      easing: Easing.inOut(Easing.quad),
    })
  }

  const router = useRouter()

  const fabOptions: FABOption[] = [
    {
      icon: "arrow-down",
      color: theme.colors.customColors.income,
      iconColor: theme.colors.onError,
      label: "Income",
      onPress: () => {
        router.push(`/transaction/${NewEnum.NEW}?type=income`)
        toggleFab()
      },
    },
    {
      icon: "arrow-up",
      color: theme.colors.customColors.expense,
      iconColor: theme.colors.onError,
      label: "Expense",
      onPress: () => {
        router.push(`/transaction/${NewEnum.NEW}?type=expense`)
        toggleFab()
      },
    },
    {
      icon: "swap-horizontal",
      color: theme.colors.secondary,
      iconColor: theme.colors.onSecondary,
      label: "Transfer",
      onPress: () => {
        router.push(`/transaction/${NewEnum.NEW}?type=transfer`)
        toggleFab()
      },
    },
  ]

  // Animated styles
  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }))

  const tabBarBottom = 8
  const tabBarHeight = 54
  const fabContainerBottom = tabBarBottom + tabBarHeight / 2

  return (
    <View style={styles.container}>
      <PagerView ref={pagerRef} style={styles.pager} initialPage={0}>
        {tabs.map((tab) => (
          <View key={tab.key} style={styles.page}>
            <tab.component />
          </View>
        ))}
      </PagerView>

      {/* Tab Bar Background & Icons - Lower Z-Index */}
      <View style={[styles.tabBarContainer, { zIndex: 10 }]}>
        <View
          style={[styles.tabBar, { backgroundColor: theme.colors.secondary }]}
        >
          <Tooltip text="Home">
            <Button
              variant="link"
              size="icon"
              onPress={() => setPage(0)}
              style={styles.tabButton}
            >
              <IconSymbol name="circle" style={isActiveTab(0)} />
            </Button>
          </Tooltip>

          <Tooltip text="Statistics">
            <Button
              variant="link"
              size="icon"
              onPress={() => setPage(1)}
              style={styles.tabButton}
            >
              <IconSymbol name="chart-box" style={isActiveTab(1)} />
            </Button>
          </Tooltip>

          {/* Placeholder for center button */}
          <View style={{ width: 44 }} />

          <Tooltip text="Accounts">
            <Button
              variant="link"
              size="icon"
              onPress={() => setPage(2)}
              style={styles.tabButton}
            >
              <IconSymbol name="wallet-bifold" style={isActiveTab(2)} />
            </Button>
          </Tooltip>

          <Tooltip text="Settings">
            <Button
              variant="link"
              size="icon"
              onPress={() => setPage(3)}
              style={styles.tabButton}
            >
              <IconSymbol name="cog" style={isActiveTab(3)} />
            </Button>
          </Tooltip>
        </View>
      </View>

      {/* Overlay - backgroundColor from theme so it updates when theme changes */}
      <Animated.View
        style={[
          styles.overlay,
          { backgroundColor: theme.colors.surface },
          overlayStyle,
        ]}
        pointerEvents={fabExpanded ? "auto" : "none"}
      >
        <Pressable
          native
          disableRipple
          style={styles.overlayPressable}
          onPress={toggleFab}
        />
      </Animated.View>

      {/* FAB Options & Center Button - Higher Z-Index */}
      <View
        style={[styles.tabBarContainer, { zIndex: 30 }]}
        pointerEvents="box-none"
      >
        {/* FAB Options - disable entire area when collapsed so invisible options don't receive touches */}
        <View
          style={[styles.fabOptionsContainer, { bottom: fabContainerBottom }]}
          pointerEvents={fabExpanded ? "box-none" : "none"}
          native
        >
          {fabOptions.map((option, index) => (
            <AnimatedFABOption
              key={option.label}
              option={option}
              index={index}
              isExpanded={fabExpanded}
            />
          ))}
        </View>

        {/* Center Button Wrapper - Overlay style positioning to match exactly */}
        <View
          style={[styles.tabBar, { backgroundColor: "transparent" }]}
          pointerEvents="box-none"
        >
          {/* Side placeholders to ensure center button is centered exactly as before */}
          <View style={{ flex: 1 }} />
          <View style={{ flex: 1 }} />

          <Tooltip text="Add Transaction">
            <Animated.View style={rotateStyle}>
              <Button
                size="icon"
                onPress={toggleFab}
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
            </Animated.View>
          </Tooltip>

          <View style={{ flex: 1 }} />
          <View style={{ flex: 1 }} />
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

  // Overlay (backgroundColor set inline from theme so it reacts to theme change)
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  overlayPressable: {
    flex: 1,
  },

  // Tab bar container
  tabBarContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    backgroundColor: "transparent",
    pointerEvents: "box-none",
  },

  // FAB options
  fabOptionsContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 30,
    pointerEvents: "box-none",
    width: 60,
    height: 60,
  },
  fabOptionWrapper: {
    position: "absolute",
    pointerEvents: "box-none",
  },
  fabOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    pointerEvents: "auto",
  },

  // Tab bar
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    height: 54,
    width: "90%",
    borderRadius: t.colors.radius,
    marginBottom: 8,
    pointerEvents: "auto",
    overflow: "visible",
  },

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
