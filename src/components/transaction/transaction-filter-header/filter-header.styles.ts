import { StyleSheet } from "react-native-unistyles"

export const filterHeaderStyles = StyleSheet.create((theme) => ({
  container: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  pillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.colors.radius ?? 12,
    borderWidth: 1,
    gap: 6,
  },
  pillLabel: {
    fontSize: 13,
    // maxWidth: 100,
  },
  clearAllPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.colors.radius ?? 12,
    borderWidth: 1,
    gap: 6,
  },
  clearAllLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  panel: {
    marginTop: 10,
    borderRadius: theme.colors.radius,
    padding: 10,
    borderWidth: 1,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  panelHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: "auto",
  },
  clearText: {
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.primary,
  },
  clearHit: {
    padding: 4,
  },
  doneText: {
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.primary,
  },
  doneHit: {
    padding: 4,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipScrollRow: {
    flexDirection: "row",
    gap: 8,
  },
  categoryRow: {
    marginBottom: 8,
  },
  categorySection: {
    marginTop: 14,
  },
  categoryEmptyHint: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: "400",
    color: `${theme.colors.onSurface}50`,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.colors.radius ?? 12,
    gap: 6,
  },
  chipLabel: {
    fontSize: 14,
  },
  searchMatchScroll: {
    marginBottom: 10,
  },
  searchMatchRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: `${theme.colors.onSurface}10`,
    borderRadius: theme.colors.radius ?? 10,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  includeNotesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  includeNotesLabel: {
    fontSize: 15,
  },
}))
