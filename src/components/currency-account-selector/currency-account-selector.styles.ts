import { StyleSheet } from "react-native-unistyles"

export const currencyAccountStyles = StyleSheet.create((t) => ({
  container: {
    width: "100%",
  },
  section: {
    width: "100%",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: t.colors.onSurface,
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    opacity: 0.6,
  },
  // Currency trigger row
  currencyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  currencyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  currencyRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: "500",
    color: t.colors.onSurface,
  },
  currencyPlaceholder: {
    fontSize: 16,
    color: t.colors.onSecondary,
    opacity: 0.6,
  },
  chevron: {
    color: t.colors.onSecondary,
    opacity: 0.4,
  },
  // Account rows
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  accountLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  accountIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  accountName: {
    fontSize: 16,
    fontWeight: "500",
    color: t.colors.onSurface,
    flex: 1,
  },
  accountCurrency: {
    fontSize: 13,
    color: t.colors.onSecondary,
    opacity: 0.7,
    marginTop: 2,
  },
  checkIcon: {
    color: t.colors.primary,
  },
  // Select all row (inside panel)
  selectAllRow: {
    borderBottomWidth: 1,
    borderBottomColor: `${t.colors.onSurface}10`,
  },
  selectAllText: {
    fontSize: 15,
    fontWeight: "500",
    color: t.colors.primary,
  },
  // Empty state
  emptyText: {
    fontSize: 14,
    color: t.colors.onSecondary,
    opacity: 0.6,
    textAlign: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  // Divider
  // divider: {
  //   height: 1,
  //   backgroundColor: t.colors.customColors.semi,
  //   marginHorizontal: 20,
  // },
  // Account trigger value — selected names, truncated
  accountTriggerValue: {
    fontSize: 15,
    fontWeight: "500",
    color: t.colors.onSurface,
  },
  // Inline currency panel (replaces modal)
  inlinePanel: {
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: t.colors.secondary,
    borderRadius: t.radius,
    overflow: "hidden",
    maxHeight: 260,
  },
  inlinePanelList: {
    flexGrow: 0,
  },
  emptyPanel: {
    paddingVertical: 24,
    alignItems: "center",
    gap: 12,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: `${t.colors.primary}15`,
    borderRadius: t.radius,
  },
  createButtonIcon: {
    color: t.colors.primary,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: t.colors.primary,
  },
  // Row inside the inline currency panel
  panelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: `${t.colors.onSurface}10`,
  },
  panelRowSelected: {
    backgroundColor: `${t.colors.primary}15`,
  },
  panelRowLeft: {
    flex: 1,
    gap: 2,
  },
}))
