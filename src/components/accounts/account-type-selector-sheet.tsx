import { memo, useCallback } from "react"
import { Pressable, View } from "react-native"
import { StyleSheet } from "react-native-unistyles"

import {
  BottomSheetModalComponent,
  useBottomSheet,
} from "~/components/bottom-sheet"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"
import type { AccountType } from "~/types/accounts"

interface AccountTypeSelectorSheetProps {
  id: string
  onTypeSelected: (type: AccountType) => void
  selectedType: AccountType
}

const accountTypes: {
  type: AccountType
  label: string
}[] = [
  { type: "checking", label: "Checking" },
  { type: "savings", label: "Savings" },
  { type: "credit", label: "Credit" },
  { type: "investment", label: "Investment" },
  { type: "other", label: "Other" },
]

export const AccountTypeSelectorSheet = memo(
  ({ id, onTypeSelected, selectedType }: AccountTypeSelectorSheetProps) => {
    const sheet = useBottomSheet(id)

    const handleSelect = useCallback(
      (type: AccountType) => {
        onTypeSelected(type)
        sheet.dismiss()
      },
      [onTypeSelected, sheet],
    )

    return (
      <BottomSheetModalComponent id={id} enableDynamicSizing={true}>
        <View style={styles.container}>
          <Text variant="h4" style={styles.title}>
            Select Account Type
          </Text>
          <View style={styles.optionsContainer}>
            {accountTypes.map((t) => (
              <Pressable
                key={t.type}
                style={({ pressed }) => [
                  styles.option,
                  pressed && styles.optionPressed,
                  selectedType === t.type && styles.optionActive,
                ]}
                onPress={() => handleSelect(t.type)}
              >
                <View style={styles.optionLeft}>
                  <Text
                    variant="default"
                    style={[
                      styles.optionText,
                      selectedType === t.type && styles.optionTextActive,
                    ]}
                  >
                    {t.label}
                  </Text>
                </View>
                {selectedType === t.type && (
                  <IconSymbol
                    name="check"
                    size={20}
                    color={styles.activeColor.color}
                  />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </BottomSheetModalComponent>
    )
  },
)

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "700",
  },
  optionsContainer: {
    gap: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: theme.colors.radius,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: "transparent",
  },
  optionPressed: {
    opacity: 0.7,
    backgroundColor: `${theme.colors.onSurface}10`,
  },
  optionActive: {
    backgroundColor: `${theme.colors.primary}10`,
    borderColor: theme.colors.primary,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  optionText: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  optionTextActive: {
    fontWeight: "600",
    color: theme.colors.primary,
  },
  activeColor: {
    color: theme.colors.primary,
  },
}))
