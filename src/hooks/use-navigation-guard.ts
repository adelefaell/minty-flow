import type { EventArg } from "@react-navigation/native"
import { useEffect, useRef } from "react"

type BeforeRemoveEvent = EventArg<"beforeRemove", true, { action: unknown }>

/** Navigation object that supports the beforeRemove listener (e.g. from useNavigation()). */
export type NavigationWithBeforeRemove = {
  addListener(
    event: "beforeRemove",
    callback: (e: BeforeRemoveEvent) => void,
  ): () => void
}

export type UseNavigationGuardOptions = {
  navigation: NavigationWithBeforeRemove
  when: boolean
  onConfirm: () => void
  onBlock: () => void
}

export type UseNavigationGuardReturn = {
  /** Call when the user confirms they want to leave (e.g. "Discard" in modal). */
  confirmNavigation: () => void
  /** Call before programmatic navigation (e.g. after submit/delete) so the guard allows the next transition. */
  allowNavigation: () => void
}

export const useNavigationGuard = ({
  navigation,
  when,
  onConfirm,
  onBlock,
}: UseNavigationGuardOptions): UseNavigationGuardReturn => {
  const isNavigatingRef = useRef(false)
  const pendingActionRef = useRef<null | (() => void)>(null)

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      "beforeRemove",
      (e: BeforeRemoveEvent) => {
        if (isNavigatingRef.current || !when) return

        e.preventDefault()

        pendingActionRef.current = () => {
          isNavigatingRef.current = true
          onConfirm()
        }

        onBlock()
      },
    )

    return unsubscribe
  }, [navigation, when, onConfirm, onBlock])

  return {
    confirmNavigation: () => {
      pendingActionRef.current?.()
      pendingActionRef.current = null
    },
    allowNavigation: () => {
      isNavigatingRef.current = true
    },
  }
}
