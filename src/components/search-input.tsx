import { View, type ViewStyle } from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Input, type InputProps } from "~/components/ui/input"

interface SearchInputProps extends InputProps {
  onClear?: () => void
  containerStyle?: ViewStyle
}

export const SearchInput = ({
  value,
  onChangeText,
  onClear,
  placeholder = "Search...",
  containerStyle,
  style,
  ...props
}: SearchInputProps) => {
  const { theme } = useUnistyles()
  return (
    <View style={[styles.container, containerStyle]}>
      <IconSymbol
        name="magnify"
        size={20}
        style={styles.searchIcon}
        color={theme.colors.onSecondary}
      />
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={[styles.input, style]}
        autoCapitalize="none"
        placeholderTextColor={theme.colors.onSecondary}
        {...props}
      />
      {value && value.length > 0 && (
        <Button
          variant="ghost"
          size="icon"
          onPress={onClear}
          style={styles.clearButton}
        >
          <IconSymbol
            name="close"
            size={20}
            style={styles.clearIcon}
            color={theme.colors.onSecondary}
          />
        </Button>
      )}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.colors.radius,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: {
    color: theme.colors.onSecondary,
    opacity: 0.5,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderWidth: 0,
    fontSize: 14,
    shadowColor: "transparent",
    elevation: 0,
    paddingHorizontal: 0,
    color: theme.colors.onSecondary,
  },
  clearButton: {
    padding: 0,
    width: 28,
    height: 28,
  },
  clearIcon: {
    color: theme.colors.onSecondary,
  },
}))
