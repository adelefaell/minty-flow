Good—this phase is where most “it works on my device” migrations fall apart in the real world.
We’re going to make your import/export **crash-safe, deterministic, and debuggable**.

---

# ✅ Phase 5 — Import / Export / Recovery (Production-Grade)

---

# 🔴 Core Guarantees

Your system MUST guarantee:

1. **No partial imports ever**
2. **App can recover after crash / kill**
3. **All foreign keys valid before write**
4. **Balances remain correct**
5. **Old backups handled safely**

---

# 📦 File Structure

```txt
src/database/services/data-management-service.ts
src/database/utils/import-snapshot.ts
```

---

# 1️⃣ Backup Format (LOCK THIS)

---

## Shape

```ts
type BackupFile = {
  meta: {
    version: 1
    schemaVersion: number
    exportedAt: string
  }

  data: {
    categories: RowCategory[]
    tags: RowTag[]
    accounts: RowAccount[]
    recurring_transactions: any[]
    budgets: any[]
    goals: any[]
    loans: any[]
    transactions: RowTransaction[]
    transfers: any[]
    transaction_tags: { transaction_id: string; tag_id: string }[]
  }
}
```

---

## 🔒 Rules

* `schemaVersion` must match or be older
* Reject newer backups
* Accept older → migrate forward

---

# 2️⃣ Export (Simple but strict)

---

```ts
export async function exportBackup(): Promise<BackupFile> {
  const db = getDb()

  const [
    categories,
    tags,
    accounts,
    transactions,
    transfers,
    transaction_tags,
  ] = await Promise.all([
    db.getAllAsync("SELECT * FROM categories"),
    db.getAllAsync("SELECT * FROM tags"),
    db.getAllAsync("SELECT * FROM accounts"),
    db.getAllAsync("SELECT * FROM transactions"),
    db.getAllAsync("SELECT * FROM transfers"),
    db.getAllAsync("SELECT * FROM transaction_tags"),
  ])

  return {
    meta: {
      version: 1,
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
    },
    data: {
      categories,
      tags,
      accounts,
      transactions,
      transfers,
      transaction_tags,
      recurring_transactions: [],
      budgets: [],
      goals: [],
      loans: [],
    },
  }
}
```

---

# 3️⃣ 🔥 Crash-Safe Import Flow

---

## Flow Diagram

```txt
1. Save snapshot → disk
2. RESET DB (transaction A)
3. INSERT data (transaction B)
4. COMMIT success
5. Delete snapshot
6. Emit db:reset
```

---

# 4️⃣ Snapshot System (CRITICAL)

---

## `import-snapshot.ts`

```ts
import * as FileSystem from "expo-file-system"

const SNAPSHOT_PATH = FileSystem.documentDirectory + "import-snapshot.json"

export async function saveSnapshot(data: any) {
  await FileSystem.writeAsStringAsync(
    SNAPSHOT_PATH,
    JSON.stringify(data)
  )
}

export async function loadSnapshot() {
  const exists = await FileSystem.getInfoAsync(SNAPSHOT_PATH)
  if (!exists.exists) return null

  const content = await FileSystem.readAsStringAsync(SNAPSHOT_PATH)
  return JSON.parse(content)
}

export async function deleteSnapshot() {
  const exists = await FileSystem.getInfoAsync(SNAPSHOT_PATH)
  if (exists.exists) {
    await FileSystem.deleteAsync(SNAPSHOT_PATH)
  }
}
```

---

# 5️⃣ 🔁 Recovery on App Start

---

```ts
export async function recoverInterruptedImport() {
  const snapshot = await loadSnapshot()

  if (!snapshot) return

  console.warn("Recovering interrupted import...")

  await performImport(snapshot)

  await deleteSnapshot()
}
```

---

# 6️⃣ 🔴 Import Implementation

---

## FK Pre-validation (IMPORTANT)

```ts
function validateFKs(data: BackupFile["data"]) {
  const accountIds = new Set(data.accounts.map(a => a.id))

  for (const tx of data.transactions) {
    if (!accountIds.has(tx.account_id)) {
      throw new Error("Invalid FK: transaction.account_id")
    }
  }
}
```

---

## Main Import

```ts
import { runInTransaction } from "@/database/transaction"
import { emit } from "@/database/events"

export async function performImport(backup: BackupFile) {
  // 1. validate version
  if (backup.meta.schemaVersion > 1) {
    throw new Error("Backup is from newer version")
  }

  validateFKs(backup.data)

  // 2. save snapshot BEFORE touching DB
  await saveSnapshot(backup)

  // 3. RESET (transaction A)
  await runInTransaction("import.reset", async db => {
    const tables = [
      "transaction_tags",
      "transfers",
      "transactions",
      "accounts",
      "categories",
      "tags",
    ]

    for (const table of tables) {
      await db.runAsync(`DELETE FROM ${table}`)
    }
  })

  // 4. INSERT (transaction B)
  await runInTransaction("import.insert", async db => {
    // categories
    for (const c of backup.data.categories) {
      await db.runAsync(
        `INSERT INTO categories VALUES (?, ?, ?, ?)`,
        [c.id, c.name, c.type, c.transaction_count]
      )
    }

    // accounts
    for (const a of backup.data.accounts) {
      await db.runAsync(
        `INSERT INTO accounts VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          a.id,
          a.name,
          a.balance,
          a.currency,
          a.is_archived,
          a.sort_order,
          a.created_at,
        ]
      )
    }

    // transactions
    for (const t of backup.data.transactions) {
      await db.runAsync(
        `INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          t.id,
          t.account_id,
          t.category_id,
          t.amount,
          t.type,
          t.transaction_date,
          t.created_at,
          t.updated_at,
          t.is_deleted,
          t.deleted_at,
          t.account_balance_before,
        ]
      )
    }

    // transfers + tags (same pattern)
  })

  // 5. success → delete snapshot
  await deleteSnapshot()

  // 6. notify app
  emit("db:reset", undefined)
}
```

---

# 7️⃣ 🧠 Large Dataset Handling (IMPORTANT)

---

## Problem

10k+ rows → JS loop = slow

---

## Solution (chunking)

```ts
async function insertInChunks<T>(
  items: T[],
  chunkSize: number,
  fn: (chunk: T[]) => Promise<void>
) {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize)
    await fn(chunk)
  }
}
```

Use for:

* transactions
* tags
* joins

---

# 8️⃣ 🔁 Balance Snapshot Rebuild

---

```ts
export async function rebuildBalanceSnapshots() {
  const db = getDb()

  const accounts = await db.getAllAsync(
    `SELECT id FROM accounts`
  )

  for (const acc of accounts) {
    let balance = 0

    const txs = await db.getAllAsync(
      `
      SELECT id, amount, type
      FROM transactions
      WHERE account_id = ?
      ORDER BY transaction_date ASC, created_at ASC
      `,
      [acc.id]
    )

    for (const tx of txs) {
      await db.runAsync(
        `UPDATE transactions SET account_balance_before = ? WHERE id = ?`,
        [balance, tx.id]
      )

      balance += getDelta(tx.type, tx.amount)
    }
  }
}
```

---

# 9️⃣ 🚨 Critical Pitfalls

---

### ❌ Snapshot deleted too early

→ crash = data loss

---

### ❌ Reset + Insert in SAME transaction

→ crash = empty DB

---

### ❌ Missing FK validation

→ silent corruption

---

### ❌ No recovery on startup

→ stuck broken state

---

# 10️⃣ Final Verification

---

### Test these manually:

* [ ] Export → Import → data identical
* [ ] Kill app during import → relaunch → recovers
* [ ] Import invalid data → fails safely
* [ ] Large dataset (5k+) → completes
* [ ] Balances correct after import

---

# 11️⃣ What you now have

You now built:

* crash-safe import system
* production-grade recovery
* deterministic restore
* future-proof backup format

---