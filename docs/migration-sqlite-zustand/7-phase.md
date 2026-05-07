This is the point where most migrations either become **clean production upgrades** or end up with “ghost dependencies” and hidden WatermelonDB crashes weeks later.

We’re going to do this properly: **hard teardown, no leftovers, no hybrid state.**

---

# ✅ Phase 7 — Cleanup & Tear-Down (WatermelonDB Removal)

---

# 🔴 Core Goal

You end with:

* ❌ zero WatermelonDB runtime usage
* ❌ zero schema/model references
* ❌ zero RxJS observables
* ✅ single SQLite + Zustand system
* ✅ clean build with no hidden plugins

---

# 🧭 Phase Order (IMPORTANT)

1. Remove runtime usage (code)
2. Remove models + schema
3. Remove plugins / native glue
4. Remove dependencies
5. Clean build system
6. Final verification

---

# 1️⃣ 🧨 Remove Runtime Watermelon Usage

---

## DELETE ALL OF THIS FIRST

```txt id="n8p4xq"
src/database/models/
src/database/utils/model-to-*.ts
src/database/index.ts   (Watermelon export layer)
```

---

## Also remove:

Search and delete:

* `withObservables`
* `.observe()`
* `Q.where`
* `database.collections`
* `@nozbe/watermelondb`

---

# 2️⃣ 🧠 Replace Schema Ownership

---

## DELETE:

```txt id="2q8vsl"
src/database/schema.ts
```

---

## Why

You already moved schema into:

```txt id="p1w7kd"
src/database/migrations.ts
```

So schema.ts becomes **dead duplication risk**

---

# 3️⃣ 🧩 Remove JSI Plugin

---

## DELETE:

```txt id="k9v2mn"
plugins/withWatermelonDBJSI.js
```

---

## REMOVE from `app.json`

```json id="v3x8ab"
"plugins": [
  "withWatermelonDBJSI"
]
```

---

# 4️⃣ 📦 Remove Dependencies (CRITICAL)

---

## Run:

```bash id="x7c9qp"
pnpm remove @nozbe/watermelondb @nozbe/simdjson rxjs
```

---

## Also check:

```bash id="q4m8zr"
pnpm why @nozbe/watermelondb
```

Make sure output is EMPTY.

---

# 5️⃣ 🧪 Clean Babel Config

---

## REMOVE:

```json id="a9k2lm"
["@babel/plugin-proposal-decorators", { "legacy": true }]
```

---

## Your babel.config.js should NOT mention:

* decorators
* Watermelon plugins
* RxJS transforms

---

# 6️⃣ 🧼 Remove Legacy Imports

---

Run global search:

```txt id="f2k9vd"
from "@nozbe"
import WatermelonDB
```

---

## Fix any leftovers:

Replace with:

```ts id="z1m8qd"
import { getDb } from "@/database/db"
```

or store/hooks layer

---

# 7️⃣ 🧱 Native Build Cleanup

---

## Required

After removal:

```bash id="p8q3xz"
npx expo prebuild --clean
```

---

Then:

```bash id="l3v9kd"
pnpm install
```

---

## WHY

Removes:

* old JSI binaries
* stale native references
* cached schema builds

---

# 8️⃣ 🔍 Full Dead Code Sweep

---

Run:

```bash id="m8x1qz"
pnpm biome check .
```

Then manually check:

### MUST NOT EXIST:

* `Model.extend`
* `Collection`
* `observeWithColumns`
* `database.write`
* `Q.where`

---

# 9️⃣ 🧪 Runtime Verification Checklist

---

## App must:

* [ ] Boot without errors
* [ ] No Watermelon logs in console
* [ ] No `_changes` tables referenced anywhere
* [ ] No RxJS subscriptions active
* [ ] Transactions still update UI
* [ ] Home tab still smooth
* [ ] Import/export still works

---

# 10️⃣ 🚨 Critical Edge Cases to Validate

---

### 1. Cold start

* DB opens
* migrations run
* stores hydrate
* UI renders

---

### 2. Import after cleanup

* snapshot restore works
* no schema mismatch

---

### 3. Recurring sync

* no duplicate generation

---

### 4. Transfers

* no double balance updates

---

# 11️⃣ 🧠 Final Architecture (After Cleanup)

---

```txt id="d8k2vn"
React UI
   ↓
Zustand stores
   ↓
Event bus
   ↓
Services (business logic)
   ↓
SQLite (expo-sqlite)
```

---

# 12️⃣ 🏁 Success Criteria

You are DONE when:

### Build

* no Watermelon in bundle
* no RxJS in deps
* no schema.ts file

### Runtime

* no crashes
* no duplicate writes
* no missing updates

### UX

* home tab smooth
* transactions reactive
* import/export stable

---

# 🔥 What you just achieved

You replaced:

❌ WatermelonDB (JSI + RxJS + ORM magic + hidden reactivity)

with:

✅ Deterministic SQLite engine
✅ Explicit reactive layer (Zustand)
✅ Controlled event system
✅ Predictable financial logic

---

