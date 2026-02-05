import { useState } from "react"
import PagerView, { usePagerView } from "react-native-pager-view"
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { Button } from "~/components/ui/button"
import { IconSymbol, type IconSymbolName } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Tooltip } from "~/components/ui/tooltip"
import { View } from "~/components/ui/view"
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
  label: string
  onPress: () => void
}

const tabs: TabConfig[] = [
  { key: "home", component: HomeScreen },
  { key: "stats", component: StatsScreen },
  { key: "accounts", component: AccountsScreen },
  { key: "settings", component: SettingsScreen },
]

const INSTANT_SPRING = {
  damping: 15,
  stiffness: 500,
  mass: 0.5,
}

const INSTANT_TIMING = {
  duration: 80,
  easing: Easing.out(Easing.quad),
}

const POSITIONS = {
  TOP: {
    y: -80,
  },
  TOP_RIGHT: {
    x: 80,
    y: -40,
  },
  TOP_LEFT: {
    x: -80,
    y: -40,
  },
}

const AnimatedFABOption = ({
  option,
  index,
  isExpanded,
}: {
  option: FABOption
  index: number
  isExpanded: boolean
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const animation = isExpanded ? withSpring : withTiming
    const config = isExpanded ? INSTANT_SPRING : INSTANT_TIMING

    let translateX = 0
    let translateY = 0

    // Adjusted distances for snappier feel
    if (index === 0) {
      // Top
      translateY = animation(isExpanded ? POSITIONS.TOP.y : 0, config)
    } else if (index === 1) {
      // Top Right
      translateX = animation(isExpanded ? POSITIONS.TOP_RIGHT.x : 0, config)
      translateY = animation(isExpanded ? POSITIONS.TOP_RIGHT.y : 0, config)
    } else if (index === 2) {
      // Top Left
      translateX = animation(isExpanded ? POSITIONS.TOP_LEFT.x : 0, config)
      translateY = animation(isExpanded ? POSITIONS.TOP_LEFT.y : 0, config)
    }

    return {
      transform: [{ translateX }, { translateY }],
      opacity: withTiming(isExpanded ? 1 : 0, INSTANT_TIMING),
    }
  })

  return (
    <Animated.View style={[styles.fabOptionWrapper, animatedStyle]}>
      <Pressable
        onPress={option.onPress}
        style={[styles.fabOption, { backgroundColor: option.color }]}
      >
        <IconSymbol name={option.icon} size={24} color="#FFFFFF" />
      </Pressable>
    </Animated.View>
  )
}

const TabLayout = () => {
  const insets = useSafeAreaInsets()
  const { theme } = useUnistyles()
  // const { initialPage } = useLocalSearchParams()
  const { ref: pagerRef, activePage, setPage } = usePagerView()
  const [fabExpanded, setFabExpanded] = useState(false)

  // Animation values
  const rotation = useSharedValue(0)
  const overlayOpacity = useSharedValue(0)

  const isActiveTab = (index: number) =>
    activePage === index ? { opacity: 1 } : { opacity: 0.8 }

  /**
   * this and useLocalSearchParams cAa be used to navigate to a specific tab from a
   * deep nested stack
   */
  // useEffect(() => {
  //   if (initialPage != null && Number(initialPage) !== activePage) {
  //     setPage(Number(initialPage))
  //   }
  // }, [initialPage, activePage, setPage])

  const toggleFab = () => {
    const newState = !fabExpanded
    setFabExpanded(newState)

    rotation.value = withSpring(newState ? 45 : 0, {
      stiffness: 600,
      damping: 20,
      mass: 0.5,
    })

    overlayOpacity.value = withTiming(newState ? 1 : 0, {
      duration: 100,
      easing: Easing.inOut(Easing.quad),
    })
  }

  const fabOptions: FABOption[] = [
    {
      icon: "arrow-down",
      color: "#A8D5BA",
      label: "Income",
      onPress: () => {
        logger.info("Add income")
        toggleFab()
      },
    },
    {
      icon: "arrow-up",
      color: "#F8A5A5",
      label: "Expense",
      onPress: () => {
        logger.info("Add expense")
        toggleFab()
      },
    },
    {
      icon: "swap-horizontal",
      color: "#B8B5E8",
      label: "Transfer",
      onPress: () => {
        logger.info("Add transfer")
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
    pointerEvents: overlayOpacity.value > 0 ? "auto" : "none",
  }))

  const tabBarBottom = insets.bottom + 8
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
          style={[
            styles.tabBar(insets.bottom),
            { backgroundColor: theme.colors.secondary },
          ]}
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

      {/* Overlay */}
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable
          native
          disableRipple
          style={styles.overlayPressable}
          onPress={toggleFab}
        />
      </Animated.View>

      {/* FAB Options & Center Button - Higher Z-Index */}
      <View style={[styles.tabBarContainer, { zIndex: 30 }]}>
        {/* FAB Options */}
        <View
          native
          style={[styles.fabOptionsContainer, { bottom: fabContainerBottom }]}
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
          style={[
            styles.tabBar(insets.bottom),
            { backgroundColor: "transparent" },
          ]}
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

  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
  tabBar: (bottomInsets: number) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    height: 54,
    width: "90%",
    borderRadius: t.colors.radius,
    marginBottom: bottomInsets + 8,
    pointerEvents: "auto",
    overflow: "visible",
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
