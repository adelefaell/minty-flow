import { StyleSheet } from "react-native-unistyles"

import { View } from "./view"

// interface IProps {
//   futrueProps?: boolean
// }

export const Separator = () => {
  return <View native style={styles.divider} />
}

const styles = StyleSheet.create((theme) => ({
  divider: {
    height: 1,
    backgroundColor: theme.colors.onSurface,
    marginVertical: 4,
    // opacity: 0.1,
  },
}))
