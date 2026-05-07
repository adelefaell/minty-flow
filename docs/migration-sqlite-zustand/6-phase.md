Nice—this is the phase where everything either **feels seamless** or subtly breaks (duplicate recurrings, missed syncs, stale UI after resume, etc.).

We’re wiring **boot, lifecycle, and background behaviors** so your app behaves like a real production finance app.

---

# ✅ Phase 6 — Boot / Sync / Lifecycle Integration

---

# 🔴 Goals

1. **Deterministic boot sequence**
2. **Crash recovery before UI**
3. **Recurring sync = exactly-once behavior**
4. **Foreground resume = catch-up logic**
5. **All services run without race conditions**

---

# 🧭 Final Boot Flow

```txt
App start
 → open DB (singleton)
 → run migrations
 → recoverInterruptedImport()
 → hydrate stores
 → start lifecycle services
 → render UI
```

---

# 1️⃣ App Boot Integration

## `src/app/_layout.tsx`

```tsx
import { useEffect, useState } from "react"

import { getDb } from "@/database/db"
import { runMigrations } from "@/database/migrations"
import { recoverInterruptedImport } from "@/database/services/data-management-service"

import { useAccountStore } from "@/stores/db/account.store"
import { useCategoryStore } from "@/stores/db/category.store"
import { useTagStore } from "@/stores/db/tag.store"

export default function RootLayout() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function boot() {
      // 1. open DB
      getDb()

      // 2. migrations
      await runMigrations()

      // 3. recovery
      await recoverInterruptedImport()

      // 4. hydrate stores
      await Promise.all([
        useAccountStore.getState().refreshAll(),
        useCategoryStore.getState().refreshAll(),
        useTagStore.getState().refreshAll(),
      ])

      // 5. start background services
      startAppServices()

      setReady(true)
    }

    boot()
  }, [])

  if (!ready) return null // or splash

  return <AppStack />
}
```

---

# 2️⃣ App Services Orchestrator

---

## `src/services/app-services.ts`

```ts
import { startRecurringSync } from "./recurring-runner"
import { startAutoConfirmation } from "./auto-confirmation-runner"

export function startAppServices() {
  startRecurringSync()
  startAutoConfirmation()
}
```

---

# 3️⃣ 🔁 Recurring Sync (Lifecycle-safe)

---

## 🔴 Invariant

* must NOT run twice
* must catch up when app resumes
* must not spam writes

---

## `recurring-runner.ts`

```ts
import { AppState } from "react-native"
import { syncRecurring } from "@/database/services/recurring-transaction-service"

let started = false

export function startRecurringSync() {
  if (started) return
  started = true

  // run once on boot
  trigger()

  // run on foreground
  AppState.addEventListener("change", state => {
    if (state === "active") {
      trigger()
    }
  })
}

let running = false

async function trigger() {
  if (running) return

  running = true
  try {
    await syncRecurring()
  } finally {
    running = false
  }
}
```

---

# 4️⃣ ⏱ Auto Confirmation Service

---

## Purpose

* confirm pending transactions after delay
* run on resume + interval

---

## `auto-confirmation-runner.ts`

```ts
import { AppState } from "react-native"
import { confirmPendingTransactions } from "@/database/services/transaction-service"

let interval: any = null

export function startAutoConfirmation() {
  run()

  AppState.addEventListener("change", state => {
    if (state === "active") {
      run()
      startInterval()
    } else {
      stopInterval()
    }
  })

  startInterval()
}

function startInterval() {
  if (interval) return

  interval = setInterval(run, 60_000)
}

function stopInterval() {
  if (!interval) return
  clearInterval(interval)
  interval = null
}

async function run() {
  await confirmPendingTransactions()
}
```

---

# 5️⃣ 🧠 DB Reset Handling (IMPORTANT)

---

When import happens:

```ts
emit("db:reset")
```

---

## Stores MUST listen

Example:

```ts
on("db:reset", () => {
  useAccountStore.getState().refreshAll()
})
```

---

## Also reset transaction cache

```ts
on("db:reset", () => {
  useTransactionStore.setState({ cache: {} })
})
```

---

# 6️⃣ 🧼 Retention Cleanup (Optional but recommended)

---

## `retention-cleanup.ts`

```ts
import { AppState } from "react-native"
import { purgeDeletedTransactions } from "@/database/services/transaction-service"

export function startRetentionCleanup() {
  AppState.addEventListener("change", state => {
    if (state === "active") {
      purgeDeletedTransactions()
    }
  })
}
```

---

# 7️⃣ ⚠️ Race Condition Prevention

---

### Problem

Multiple triggers:

* boot
* resume
* interval

---

### Solution

Every service must have:

```ts
let running = false
```

---

### NEVER rely on:

* Zustand
* React state

Use **module-level lock**

---

# 8️⃣ 🧠 Background Behavior Rules

---

| Event        | Behavior       |
| ------------ | -------------- |
| App launch   | full sync      |
| Resume       | catch-up       |
| Background   | stop intervals |
| Rapid resume | deduplicated   |

---

# 9️⃣ 🔥 Hidden Pitfalls

---

### ❌ Recurring runs twice

Cause:

* no lock

---

### ❌ Infinite loop

Cause:

* event triggers service → service triggers event → loop

Fix:
→ services only emit AFTER writes

---

### ❌ Missed sync

Cause:

* only running on interval

Fix:
→ always run on foreground

---

### ❌ UI shows stale data after resume

Cause:

* no event emission

Fix:
→ all writes emit events

---

# 10️⃣ Final Verification

---

Test manually:

* [ ] Launch app → data loads correctly
* [ ] Kill during import → relaunch → recovery works
* [ ] Add recurring → background → resume → created ONCE
* [ ] Rapid foreground switches → no duplicates
* [ ] Pending transactions → auto-confirm after delay
* [ ] Import → UI refreshes instantly

---

# 11️⃣ What you now have

You now built:

* deterministic boot system
* lifecycle-safe sync engine
* production-grade background behavior
* no race conditions

---
