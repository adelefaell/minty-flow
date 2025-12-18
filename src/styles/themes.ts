const lightTheme = {
  colors: {
    background: "#ffffff",
    text: "#000000",
  },
  gap: (v: number) => v * 8,
}

const darkTheme = {
  colors: {
    background: "#000000",
    text: "#ffffff",
  },
  gap: (v: number) => v * 8,
}

const appThemes = {
  light: lightTheme,
  dark: darkTheme,
}

export { appThemes }
