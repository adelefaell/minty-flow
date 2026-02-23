/**
 * Markdown editor modal — no WebView.
 * Toolbar inserts markdown tokens; optional live preview via react-native-markdown-display.
 */

import { useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native"
import Markdown from "react-native-markdown-display"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { IconSymbol } from "~/components/ui/icon-symbol"
import { Text } from "~/components/ui/text"

type MarkdownEditorFormValues = { notes: string }

export interface MarkdownEditorModalProps {
  visible: boolean
  /** Initial markdown (or plain text) */
  value: string
  onSave: (markdown: string) => void
  onRequestClose: () => void
}

export function MarkdownEditorModal({
  visible,
  value,
  onSave,
  onRequestClose,
}: MarkdownEditorModalProps) {
  const { theme } = useUnistyles()
  const insets = useSafeAreaInsets()
  const [preview, setPreview] = useState(false)
  const inputRef = useRef<TextInput>(null)

  const { control, getValues, setValue, watch, reset } =
    useForm<MarkdownEditorFormValues>({
      defaultValues: { notes: value },
    })

  const notesValue = watch("notes")

  const handleModalShow = () => {
    reset({ notes: value })
    setPreview(false)
  }

  const insert = (before: string, after = "") => {
    inputRef.current?.focus()
    inputRef.current?.setNativeProps({ selection: undefined })
    const prev = getValues("notes")
    setValue("notes", `${prev}${before}${after}`, { shouldDirty: true })
  }

  /** Get the list prefix for the next line (e.g. "- " or "2. ") or null if not a list line */
  const getNextListPrefix = (line: string): string | null => {
    const trimmed = line.trimStart()
    if (/^- /.test(trimmed)) return "- "
    const numMatch = trimmed.match(/^(\d+)\. /)
    if (numMatch) return `${Number(numMatch[1]) + 1}. `
    return null
  }

  const handleChangeText = (newVal: string, onChange: (v: string) => void) => {
    const prev = getValues("notes")

    // Detect single newline inserted (Enter key) and continue list markers
    if (newVal.length === prev.length + 1) {
      let insertIdx = -1
      for (let i = 0; i <= prev.length; i++) {
        const before = prev.slice(0, i)
        const after = prev.slice(i)
        if (`${before}\n${after}` === newVal) {
          insertIdx = i
          break
        }
      }
      if (insertIdx !== -1) {
        const lineStart = prev.slice(0, insertIdx).lastIndexOf("\n") + 1
        const currentLine = prev.slice(lineStart, insertIdx)
        const prefix = getNextListPrefix(currentLine)
        if (prefix) {
          const replacement = `\n${prefix}`
          const nextText =
            prev.slice(0, insertIdx) + replacement + prev.slice(insertIdx)
          setValue("notes", nextText, { shouldDirty: true })
          const newCursor = insertIdx + replacement.length
          requestAnimationFrame(() => {
            inputRef.current?.setNativeProps({
              selection: { start: newCursor, end: newCursor },
            })
          })
          return
        }
      }
    }

    onChange(newVal)
  }

  const handleSave = () => {
    onSave(getValues("notes"))
    onRequestClose()
  }

  const bg = theme.colors.surface
  const fg = theme.colors.onSurface
  const muted = theme.colors.customColors.semi
  const toolbarBg = theme.colors.secondary

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
      onShow={handleModalShow}
      onRequestClose={onRequestClose}
    >
      <View style={[styles.container, { backgroundColor: bg }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: Math.max(insets.top, 12),
              paddingBottom: 12,
              paddingHorizontal: 16,
              borderBottomColor: muted,
            },
          ]}
        >
          <Pressable
            onPress={onRequestClose}
            hitSlop={12}
            style={styles.headerBtn}
            accessibilityLabel="Close"
          >
            <IconSymbol name="close" size={24} color={fg} />
          </Pressable>
          <Pressable
            onPress={handleSave}
            hitSlop={12}
            style={styles.headerBtn}
            accessibilityLabel="Save"
          >
            <IconSymbol name="check" size={24} color={theme.colors.primary} />
          </Pressable>
        </View>

        {/* Toolbar */}
        <View
          style={[
            styles.toolbar,
            { borderBottomColor: muted, backgroundColor: toolbarBg },
          ]}
        >
          <ToolbarButton
            label="B"
            onPress={() => insert("**", "**")}
            style={[styles.toolbarBtnBase, { backgroundColor: toolbarBg }]}
            textStyle={{ color: fg, fontWeight: "700" }}
          />
          <ToolbarButton
            label="I"
            onPress={() => insert("_", "_")}
            style={[styles.toolbarBtnBase, { backgroundColor: toolbarBg }]}
            textStyle={{ color: fg, fontStyle: "italic", fontWeight: "600" }}
          />
          <ToolbarButton
            label="•"
            onPress={() => insert("\n- ")}
            style={[styles.toolbarBtnBase, { backgroundColor: toolbarBg }]}
            textStyle={{ color: fg, fontWeight: "600" }}
          />
          <ToolbarButton
            label="1."
            onPress={() => insert("\n1. ")}
            style={[styles.toolbarBtnBase, { backgroundColor: toolbarBg }]}
            textStyle={{ color: fg, fontWeight: "600" }}
          />
          <View style={styles.toolbarSpacer} />
          <ToolbarButton
            label={preview ? "Edit" : "Preview"}
            onPress={() => setPreview((p) => !p)}
            style={[styles.toolbarBtnBase, { backgroundColor: toolbarBg }]}
            textStyle={{ color: fg, fontWeight: "600" }}
          />
        </View>

        {/* Editor / Preview */}
        {preview ? (
          <ScrollView
            style={[styles.previewScroll, { padding: 16 }]}
            contentContainerStyle={styles.previewContent}
          >
            <Markdown style={markdownStyles(theme)}>
              {notesValue || " "}
            </Markdown>
          </ScrollView>
        ) : (
          <Controller
            control={control}
            name="notes"
            render={({ field }) => (
              <TextInput
                ref={(el) => {
                  inputRef.current = el
                  field.ref(el)
                }}
                value={field.value}
                onChangeText={(newVal) =>
                  handleChangeText(newVal, field.onChange)
                }
                multiline
                placeholder="Write your notes…"
                placeholderTextColor={muted}
                style={[
                  styles.input,
                  {
                    color: fg,
                    backgroundColor: bg,
                  },
                ]}
              />
            )}
          />
        )}
      </View>
    </Modal>
  )
}

function ToolbarButton({
  label,
  onPress,
  style,
  textStyle,
}: {
  label: string
  onPress: () => void
  style?: object
  textStyle?: object
}) {
  return (
    <Pressable onPress={onPress} style={[styles.toolbarBtnBase, style]}>
      <Text style={[styles.toolbarLabel, textStyle]}>{label}</Text>
    </Pressable>
  )
}

function markdownStyles(theme: { colors: { onSurface: string } }) {
  const fg = theme.colors.onSurface
  return {
    body: { color: fg, fontSize: 16 },
    paragraph: { marginVertical: 6 },
    bullet_list: { marginVertical: 4 },
    ordered_list: { marginVertical: 4 },
    list_item: { marginVertical: 2 },
    strong: { fontWeight: "700" as const },
    em: { fontStyle: "italic" as const },
    code_inline: {
      backgroundColor: "rgba(255,255,255,0.1)",
      paddingHorizontal: 4,
      borderRadius: 4,
    },
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  headerBtn: {
    padding: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    gap: 4,
  },
  toolbarBtnBase: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  toolbarLabel: {
    fontSize: 16,
  },
  toolbarSpacer: {
    flex: 1,
  },
  previewScroll: {
    flex: 1,
  },
  previewContent: {
    paddingBottom: 24,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    textAlignVertical: "top",
  },
})
