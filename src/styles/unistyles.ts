import { StyleSheet } from "react-native-unistyles"

import { breakpoints } from "./breakpoints"
import { appThemes } from "./themes"

type AppBreakpoints = typeof breakpoints
type AppThemes = typeof appThemes

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  settings: {
    // initialTheme: "light",
    adaptiveThemes: true,
    //   initialTheme: () => {
    //     // get preferred theme from user's preferences/MMKV/SQL/StanJS etc.

    //     return storage.getString('preferredTheme') ?? 'light'
    // }
  },
  breakpoints,
  themes: appThemes,
})
