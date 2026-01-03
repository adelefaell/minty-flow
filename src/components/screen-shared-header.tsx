import type { NativeStackHeaderProps } from "@react-navigation/native-stack"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { StyleSheet } from "react-native-unistyles"

import { IconSymbol } from "./ui/icon-symbol"
import { Pressable } from "./ui/pressable"
import { Text } from "./ui/text"
import { Tooltip } from "./ui/tooltip"
import { View } from "./ui/view"

export const ScreenSharedHeader = ({
  props,
}: {
  props: NativeStackHeaderProps
}) => {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <Tooltip text="back" position="bottom">
        <Pressable
          onPress={() => {
            props.navigation.goBack()
          }}
          style={styles.backButton}
        >
          <IconSymbol name="arrow-left" size={24} />
        </Pressable>
      </Tooltip>

      <Text variant="large" style={styles.title}>
        {props.options.title}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    paddingBottom: 10,
    paddingHorizontal: 8,
    gap: 25,
    elevation: 5,
  },
  title: {
    flex: 1,
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
}))
