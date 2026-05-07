# Migration Plan: WatermelonDB → expo-sqlite + Zustand


> **Decisions resolved before implementation:**

* Existing-device data path: **hard cut + manual export/reimport**
* App version: **2.0.0**

---

## Context

*(unchanged — already solid)*

---

## Recommended Architecture

```
UI (React Native)
   ↓ hooks (useAccounts, useTransactions, ...)
Zustand domain stores (byId / ids / status / refreshAll / refreshOne)
   ↑ subscribe
Events bus (typed: "transactions:dirty", "accounts:dirty", ...)
   ↑ emit (after commit, batched)
Services (business logic — same exported names as today)
   ↓
runInTransaction(name, fn)
   ↓
WriteQueue (global FIFO, retry-aware)
   ↓
expo-sqlite (single connection)
```

---

## Key decisions (updated)

### 🔒 DB Connection (NEW — critical)

| Concern        | Decision                     | Why                                                        |
| -------------- | ---------------------------- | ---------------------------------------------------------- |
| DB instance    | **Singleton (module-level)** | Multiple connections break WAL guarantees + FK enforcement |
| Initialization | Run pragmas on open          | SQLite defaults are unsafe for app logic                   |

**Must guarantee:**

```ts
// db.ts
let db: SQLiteDatabase | null = null

export function getDb() {
  if (!db) {
    db = openDatabaseSync("minty_flow_db_v2")
    db.execAsync(`
      PRAGMA journal_mode=WAL;
      PRAGMA foreign_keys=ON;
      PRAGMA busy_timeout=5000;
    `)
  }
  return db
}
```

---

### 🔁 Transaction wrapper (UPDATED)

| Concern   | Decision                      | Why                                        |
| --------- | ----------------------------- | ------------------------------------------ |
| Nesting   | **Re-entrant (no SAVEPOINT)** | Simpler + matches current service layering |
| Detection | `isInTransactionAsync()`      | Prevent accidental nested tx               |
| Isolation | Queue guarantees ordering     | Avoid Expo async interleaving issues       |

**Invariant:**

* Inner calls **reuse outer transaction**
* Only outermost call emits events

---

### 🧠 Event system (UPDATED — batching added)

| Concern         | Decision                      |
| --------------- | ----------------------------- |
| Emission timing | **AFTER commit only**         |
| Batching        | **Coalesce same-tick events** |
| Payload         | Optional `{ ids?: string[] }` |

**Example:**

```ts
emitDirty({
  transactions: [id1, id2],
  accounts: [acc1, acc2],
})
```

→ internally becomes **one flush per tick**

---

### ⚡ Reactivity granularity (UPDATED)

#### Transactions store (refined)

* Filter cache key must be **stable + deterministic**

```ts
const filterHash = stableStringify({
  ...filters,
  from: filters.from?.toISOString(),
  to: filters.to?.toISOString(),
})
```

**Rules:**

* No raw Date objects
* No undefined keys
* Sorted keys only

---

### 🧮 Derived data (unchanged but clarified)

* Always SQL for cross-entity aggregates
* Never derive from partial store

---

### 🧩 Zustand usage (NEW strict rules)

* Only export hooks (`useAccounts`, not store)
* Always:

```ts
useStore(selector, shallow)
```

* Selectors must return:

  * primitives OR
  * stable references

🚫 Avoid:

```ts
useStore(s => s.items.map(...)) // ❌ causes rerenders
```

---

### 🗃️ Schema & indexes (NEW)

Add **index verification checklist**:

* [ ] All FK columns indexed
* [ ] `transactions(account_id, transaction_date)` indexed
* [ ] `transactions(is_deleted)` indexed
* [ ] `transaction_tags(transaction_id, tag_id)` composite index
* [ ] Sort order index:

  ```sql
  CREATE INDEX idx_tx_date_created
  ON transactions(transaction_date ASC, created_at ASC);
  ```

---

### 🧾 Date handling (NEW — critical invariant)

| Concern     | Decision                |
| ----------- | ----------------------- |
| Storage     | **UTC ISO string only** |
| Comparisons | SQL (`datetime(...)`)   |
| UI          | Localized via date-fns  |

🚫 Never store:

* locale dates
* timestamps mixed with strings

---

### 🧵 Write queue (UPDATED — error handling)

Add classification:

| Error            | Behavior         |
| ---------------- | ---------------- |
| SQLITE_BUSY      | retry (max 3)    |
| SQLITE_LOCKED    | retry            |
| Constraint error | fail immediately |
| Unknown          | fail + log       |

---

### 📦 Import strategy (UPDATED — scalability)

| Case      | Strategy                      |
| --------- | ----------------------------- |
| < 5k rows | single transaction            |
| > 5k rows | chunked (1000 rows per batch) |

Still:

* snapshot BEFORE reset
* delete AFTER success

---

### 🧠 WAL management (NEW)

Add checkpoint policy:

```ts
PRAGMA wal_checkpoint(TRUNCATE)
```

Trigger:

* after import
* after large batch writes

---

### 📊 Instrumentation (NEW)

Add hooks:

```ts
onWriteStart(name)
onWriteEnd(name, duration)
onSlowWrite(name, duration > 50ms)
```

---

## Phase Changes

### Phase 0 — Foundation (UPDATED)

Add:

* [ ] Enforce **singleton DB instance**
* [ ] Add **instrumentation hooks**
* [ ] Add **error classification in queue**
* [ ] Add **event batching system**

---

### Phase 1 — Read-side (UPDATED)

* [ ] Normalize Date fields → ISO string only
* [ ] Validate index usage via `EXPLAIN QUERY PLAN`

---

### Phase 2 — Stores (UPDATED)

* [ ] Implement **stable filter hashing**
* [ ] Add **debounced + batched refresh**
* [ ] Ensure all selectors use `shallow`

---

### Phase 3 — Services (UPDATED)

Add invariant:

* [ ] No service emits events directly
  → must go through post-commit aggregator

---

### Phase 5 — Import (UPDATED)

* [ ] Add chunking fallback for large datasets
* [ ] Run WAL checkpoint after import
* [ ] Run `rebuildBalanceSnapshots()`

---

### Phase 6 — Boot (UPDATED)

Boot order:

```
open DB
→ set pragmas
→ run migrations
→ recover interrupted import
→ hydrate stores
→ mount app
```

---

### Phase 8 — Optimization (UPDATED)

Add:

* [ ] Query plan logging (`EXPLAIN`)
* [ ] WAL size monitoring
* [ ] Cache hit rate for transaction filters

---

## New Section — Performance Guarantees

### Must hold after migration:

* Transaction list scroll = **no dropped frames @ 1000 rows**
* Write latency < **50ms**
* No `SQLITE_BUSY` errors in normal usage
* Store updates:

  * only affected components re-render

---

## New Section — Non-negotiable Invariants

1. **Single DB connection**
2. **All writes go through queue**
3. **No events before commit**
4. **UTC-only date storage**
5. **Stable filter hashing**
6. **Selectors must be shallow-safe**

---

## Verdict

Your original plan was already **very strong**.

These changes mainly:

* eliminate hidden SQLite pitfalls
* harden concurrency model
* prevent subtle Zustand perf issues
* future-proof large datasets

