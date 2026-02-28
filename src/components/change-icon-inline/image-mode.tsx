import { useTranslation } from "react-i18next"
import { ScrollView, View } from "react-native"

import { DynamicIcon } from "~/components/dynamic-icon"
import { Button } from "~/components/ui/button"
import { IconSymbol } from "~/components/ui/icon-symbol"
import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import type { MintyColorScheme } from "~/styles/theme/types"

import { changeIconInlineStyles as styles } from "./change-icon-inline.styles"

interface ImageModeProps {
  imageUri: string | null
  onPaste: () => void
  onPick: () => void
  onDone: () => void
  onCancel: () => void
  colorScheme: MintyColorScheme
}

export function ImageMode({
  imageUri,
  onPaste,
  onPick,
  onDone,
  onCancel,
  colorScheme,
}: ImageModeProps) {
  const { t } = useTranslation()
  return (
    <ScrollView
      contentContainerStyle={styles.modeScrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.modeContent}>
        <Text variant="h3" style={styles.modeTitle}>
          Image
        </Text>
        <Pressable style={styles.pasteOption} onPress={onPaste}>
          <IconSymbol name="clipboard" size={20} style={styles.optionIcon} />
          <Text style={styles.optionText}>
            {t("components.iconPicker.pasteImage")}
          </Text>
        </Pressable>
        <View style={styles.divider} />
        <View style={styles.previewContainer}>
          <Pressable
            style={styles.previewBox}
            onPress={onPick}
            disabled={!!imageUri}
          >
            {imageUri ? (
              <DynamicIcon
                icon={imageUri}
                size={96}
                colorScheme={colorScheme}
              />
            ) : (
              <IconSymbol
                name="image"
                size={48}
                style={styles.previewPlaceholderIcon}
              />
            )}
          </Pressable>
        </View>
        <Pressable style={styles.pickOption} onPress={onPick}>
          <IconSymbol
            name="image-multiple"
            size={20}
            style={styles.optionIcon}
          />
          <Text style={styles.optionText}>
            {t("components.iconPicker.pickImage")}
          </Text>
        </Pressable>
        <View style={styles.modeActions}>
          <Button variant="outline" onPress={onCancel}>
            <Text>Cancel</Text>
          </Button>
          <Button variant="default" onPress={onDone} disabled={!imageUri}>
            <Text>Done</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  )
}
