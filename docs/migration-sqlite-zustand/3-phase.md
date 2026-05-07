
# ✅ Phase 3 — Service Layer Rewrite (Critical Logic)

---

# 🔴 Core Rules (NON-NEGOTIABLE)

1. **All writes go through `runInTransaction`**
2. **Balances updated via DELTA (never recompute globally)**
3. **Transfers = single atomic transaction**
4. **Soft delete only (unless permanent destroy explicitly)**
5. **Emit events AFTER commit only**
6. **No repo calls inside loops (batch always)**

---

# 1️⃣ Transaction Service (Core)

---

## 🔧 Helper — Balance Delta

```ts
function getDelta(type: string, amount: number) {
  switch (type) {
    case "expense":
      return -amount
    case "income":
      return amount
    default:
      return 0
  }
}
```

---

## 🟢 Create Transaction

```ts
import { runInTransaction } from "@/database/transaction"
import { emit } from "@/database/events"
import { getDb } from "@/database/db"

export async function createTransaction(input: {
  id: string
  accountId: string
  amount: number
  type: string
  date: Date
  categoryId?: string | null
}) {
  return runInTransaction("transaction.create", async db => {
    const delta = getDelta(input.type, input.amount)

    // 1. get current balance
    const [account] = await db.getAllAsync(
      `SELECT balance FROM accounts WHERE id = ?`,
      [input.accountId]
    )

    const balanceBefore = account.balance

    // 2. insert tx
    await db.runAsync(
      `
      INSERT INTO transactions (
        id, account_id, category_id,
        amount, type,
        transaction_date,
        created_at, updated_at,
        account_balance_before,
        is_deleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `,
      [
        input.id,
        input.accountId,
        input.categoryId ?? null,
        input.amount,
        input.type,
        input.date.toISOString(),
        new Date().toISOString(),
        new Date().toISOString(),
        balanceBefore,
      ]
    )

    // 3. update account balance (DELTA)
    await db.runAsync(
      `UPDATE accounts SET balance = balance + ? WHERE id = ?`,
      [delta, input.accountId]
    )

    return {
      accountId: input.accountId,
      txId: input.id,
    }
  }).then(result => {
    emit("transactions:dirty", { ids: [result.txId] })
    emit("accounts:dirty", { ids: [result.accountId] })
  })
}
```

---

## 🟡 Edit Transaction (DELTA SAFE)

```ts
export async function editTransaction(input: {
  id: string
  amount: number
  type: string
}) {
  return runInTransaction("transaction.edit", async db => {
    const [existing] = await db.getAllAsync(
      `SELECT amount, type, account_id FROM transactions WHERE id = ?`,
      [input.id]
    )

    const oldDelta = getDelta(existing.type, existing.amount)
    const newDelta = getDelta(input.type, input.amount)

    const diff = newDelta - oldDelta

    await db.runAsync(
      `UPDATE transactions SET amount = ?, type = ?, updated_at = ? WHERE id = ?`,
      [input.amount, input.type, new Date().toISOString(), input.id]
    )

    if (diff !== 0) {
      await db.runAsync(
        `UPDATE accounts SET balance = balance + ? WHERE id = ?`,
        [diff, existing.account_id]
      )
    }

    return {
      accountId: existing.account_id,
      txId: input.id,
    }
  }).then(r => {
    emit("transactions:dirty", { ids: [r.txId] })
    emit("accounts:dirty", { ids: [r.accountId] })
  })
}
```

---

## 🔴 Soft Delete Transaction

```ts
export async function deleteTransaction(id: string) {
  return runInTransaction("transaction.delete", async db => {
    const [tx] = await db.getAllAsync(
      `SELECT amount, type, account_id FROM transactions WHERE id = ?`,
      [id]
    )

    const delta = getDelta(tx.type, tx.amount)

    // reverse balance
    await db.runAsync(
      `UPDATE accounts SET balance = balance - ? WHERE id = ?`,
      [delta, tx.account_id]
    )

    await db.runAsync(
      `UPDATE transactions SET is_deleted = 1, deleted_at = ? WHERE id = ?`,
      [new Date().toISOString(), id]
    )

    return { accountId: tx.account_id }
  }).then(r => {
    emit("transactions:dirty", { ids: [id] })
    emit("accounts:dirty", { ids: [r.accountId] })
  })
}
```

---

# 2️⃣ 🔥 Transfer Service (MOST CRITICAL)

---

## ⚠️ Invariant

A transfer must ALWAYS:

* create 2 transactions
* update 2 accounts
* create 1 transfer row
* ALL in ONE transaction

---

## 🟢 Create Transfer

```ts
export async function createTransfer(input: {
  id: string
  fromAccountId: string
  toAccountId: string
  amount: number
}) {
  return runInTransaction("transfer.create", async db => {
    const now = new Date().toISOString()

    const outId = `${input.id}_out`
    const inId = `${input.id}_in`

    // OUT (expense)
    await db.runAsync(
      `
      INSERT INTO transactions (...)
      VALUES (?, ?, ?, ?, 'expense', ?, ?, ?, ?, 0)
      `,
      [outId, input.fromAccountId, null, input.amount, now, now, now, 0]
    )

    // IN (income)
    await db.runAsync(
      `
      INSERT INTO transactions (...)
      VALUES (?, ?, ?, ?, 'income', ?, ?, ?, ?, 0)
      `,
      [inId, input.toAccountId, null, input.amount, now, now, now, 0]
    )

    // update balances
    await db.runAsync(
      `UPDATE accounts SET balance = balance - ? WHERE id = ?`,
      [input.amount, input.fromAccountId]
    )

    await db.runAsync(
      `UPDATE accounts SET balance = balance + ? WHERE id = ?`,
      [input.amount, input.toAccountId]
    )

    // transfer row
    await db.runAsync(
      `INSERT INTO transfers (id, from_tx_id, to_tx_id) VALUES (?, ?, ?)`,
      [input.id, outId, inId]
    )

    return {
      accounts: [input.fromAccountId, input.toAccountId],
      txIds: [outId, inId],
    }
  }).then(r => {
    emit("transactions:dirty", { ids: r.txIds })
    emit("accounts:dirty", { ids: r.accounts })
  })
}
```

---

# 3️⃣ 🔁 Recurring Service (LOCK REQUIRED)

---

## ⚠️ Critical

```ts
let _syncRunning = false
```

---

## Pattern

```ts
export async function syncRecurring() {
  if (_syncRunning) return

  _syncRunning = true

  try {
    // generate missing transactions (max depth 30)
    // call createTransaction internally
  } finally {
    _syncRunning = false
  }
}
```

---

# 4️⃣ 📦 Import Service (CRASH SAFE)

---

## Flow

1. Save snapshot JSON
2. DELETE all tables
3. Insert in FK order
4. Commit
5. Delete snapshot
6. Emit `db:reset`

---

## ⚠️ Never:

* delete snapshot in finally
* mix reset + insert in same tx

---

# 5️⃣ 🚨 Hidden Pitfalls (you WILL hit these)

---

### ❌ Double balance updates

Cause:

* calling update twice
* or mixing edit + transfer logic

Fix:
→ always compute `diff`

---

### ❌ Transfer partial failure

Cause:

* splitting into multiple transactions

Fix:
→ one `runInTransaction`

---

### ❌ Recurring duplicates

Cause:

* missing `_syncRunning`

---

### ❌ Balance drift over time

Cause:

* not storing `account_balance_before`

---

# 6️⃣ Verification Checklist

After implementing:

### 🔍 Must hold:

* Create tx → balance updates correctly
* Edit tx → diff applied only
* Delete tx → balance reversed
* Transfer → both accounts correct
* Rapid actions → no drift
* Recurring → no duplicates

---

# 7️⃣ What you just achieved

You now replaced:

❌ Watermelon implicit writers
with
✅ Fully deterministic financial engine

---

