import { createMMKV } from "react-native-mmkv"
import { create } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"

/**
 * MMKV storage instance for numpad preferences.
 */
export const numpadStyleStorage = createMMKV({
  id: "numpad-style-storage",
})

/**
 * Numpad display style
 */
export const NumpadStyleEnum = {
  CLASSIC: "classic",
  MODERN: "modern",
} as const

export type NumpadStyleType =
  (typeof NumpadStyleEnum)[keyof typeof NumpadStyleEnum]

interface NumpadStyleStore {
  numpadStyle: NumpadStyleType
  setNumpadStyle: (value: NumpadStyleType) => void
}

export const useNumpadStyleStore = create<NumpadStyleStore>()(
  devtools(
    persist(
      (set) => ({
        /* ───────── State ───────── */

        numpadStyle: "classic",

        /* ───────── Actions ───────── */

        setNumpadStyle: (value: NumpadStyleType) => {
          set({ numpadStyle: value })
        },
      }),
      {
        name: "numpad-style-store",
        storage: createJSONStorage(() => ({
          getItem: (name) => numpadStyleStorage.getString(name) ?? null,
          setItem: (name, value) => numpadStyleStorage.set(name, value),
          removeItem: (name) => numpadStyleStorage.remove(name),
        })),
      },
    ),
    { name: "numpad-style-store-dev" },
  ),
)
