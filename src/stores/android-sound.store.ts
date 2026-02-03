import { createMMKV } from "react-native-mmkv"
import { create } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"

/**
 * MMKV storage instance for android sound data.
 * MMKV is ~30x faster than AsyncStorage and provides synchronous operations.
 *
 * @see https://github.com/mrousavy/react-native-mmkv
 */
export const androidSoundStorage = createMMKV({
  id: "android-sound-storage",
})

/**
 * Android sound store interface defining the shape of the sound state and actions.
 */
interface AndroidSoundStore {
  disableSound: boolean
  toggleSound: () => void
  setSoundEnabled: (enabled: boolean) => void
}

export const useAndroidSoundStore = create<AndroidSoundStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state - sound is enabled by default
        disableSound: false,

        // Toggle sound on/off
        toggleSound: () =>
          set((state) => ({
            disableSound: !state.disableSound,
          })),

        // Set sound to a specific state
        setSoundEnabled: (enabled: boolean) =>
          set({
            disableSound: !enabled,
          }),
      }),
      {
        name: "android-sound-store", // Name for the store (MMKV key)
        // Use the custom MMKV instance for storage
        storage: createJSONStorage(() => ({
          getItem: (name) => androidSoundStorage.getString(name) ?? null,
          setItem: (name, value) => androidSoundStorage.set(name, value),
          removeItem: (name) => androidSoundStorage.remove(name),
        })),
      },
    ),
    { name: "android-sound-store-dev" },
  ),
)
