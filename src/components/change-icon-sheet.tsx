import { StyleSheet } from "react-native-unistyles"

import { ActionItem } from "~/components/action-item"
import {
  BottomSheetModalComponent,
  useBottomSheet,
} from "~/components/bottom-sheet"
import { EmojiLetterSelectionSheet } from "~/components/emoji-letter-selection-sheet"
// Placeholder sheets for future implementation
import { IconSelectionSheet } from "~/components/icon-selection-sheet"
import { ImageSelectionSheet } from "~/components/image-selection-sheet"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type { MintyColorScheme } from "~/styles/theme/types"

interface ChangeIconSheetProps {
  id: string
  currentIcon?: string
  onIconSelected?: (_icon: string) => void
  colorScheme?: MintyColorScheme
}

export const ChangeIconSheet = ({
  id,
  currentIcon,
  onIconSelected,
  colorScheme,
}: ChangeIconSheetProps) => {
  const sheet = useBottomSheet(id)
  const iconSelectionSheet = useBottomSheet("icon-selection-sheet")
  const emojiLetterSelectionSheet = useBottomSheet(
    "emoji-letter-selection-sheet",
  )
  const imageSelectionSheet = useBottomSheet("image-selection-sheet")

  const handleIconPress = () => {
    sheet.dismiss()
    iconSelectionSheet.present()
  }

  const handleEmojiLetterPress = () => {
    sheet.dismiss()
    emojiLetterSelectionSheet.present()
  }

  const handleImagePress = () => {
    sheet.dismiss()
    imageSelectionSheet.present()
  }

  return (
    <>
      <BottomSheetModalComponent id={id}>
        <View style={styles.container}>
          <View>
            <Text variant="h3" style={styles.title}>
              Change Icon
            </Text>
          </View>
          <View style={styles.content}>
            <ActionItem icon="shape" title="Icon" onPress={handleIconPress} />
            <ActionItem
              icon="tag"
              title="Emoji/Letter"
              onPress={handleEmojiLetterPress}
            />
            <ActionItem icon="image" title="Image" onPress={handleImagePress} />
          </View>
        </View>
      </BottomSheetModalComponent>

      {/* Nested Selection Sheets */}
      <IconSelectionSheet
        id="icon-selection-sheet"
        colorScheme={colorScheme}
        initialIcon={currentIcon}
        onIconSelected={(selectedIcon: string) => {
          onIconSelected?.(selectedIcon)
          iconSelectionSheet.dismiss()
        }}
      />
      <EmojiLetterSelectionSheet
        id="emoji-letter-selection-sheet"
        onIconSelected={(selectedIcon: string) => {
          onIconSelected?.(selectedIcon)
          emojiLetterSelectionSheet.dismiss()
        }}
      />
      <ImageSelectionSheet
        id="image-selection-sheet"
        onIconSelected={(selectedIcon: string) => {
          onIconSelected?.(selectedIcon)
          imageSelectionSheet.dismiss()
        }}
      />
    </>
  )
}

const styles = StyleSheet.create((_theme) => ({
  container: {
    flex: 1,
  },
  content: {
    gap: 0,
  },
  title: {
    textAlign: "center",
    paddingBlock: 16,
  },
}))
