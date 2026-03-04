# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Minty Flow is a local-first personal finance React Native app built with Expo SDK 55 (New Architecture enabled). Targets Android & iOS (portrait only). Uses pnpm as package manager.

## Commands

```bash
pnpm android          # Run on Android emulator/device (dev build)
pnpm ios              # Run on iOS simulator/device (dev build, macOS only)
pnpm prebuild         # Generate ios/ and android/ native projects (required first time or after native dep changes)
pnpm lint             # Biome check
pnpm lint:fix         # Biome check + auto-fix
pnpm types            # tsc --noEmit (type check only)
pnpm structure        # Regenerate STRUCTURE.md
pnpm unused-styles    # Find unused unistyles StyleSheets
pnpm check-i18n-keys  # Find missing i18n translation keys
```

**Important:** Native modules (WatermelonDB, MMKV) require a dev build — `pnpm start` with Expo Go will not work.

**Pre-commit hook** (`husky`): automatically runs `pnpm structure`, `pnpm lint:fix` (and git-stages fixes), then `pnpm types`. All three must pass.

## Architecture

### Navigation (Expo Router v3)

File-based routing under `src/app/`. The `~/` path alias maps to `src/`.

- **4 tabs**: Home, Stats, Accounts, Settings — driven by a custom `PagerView`-based tab layout (`src/app/(tabs)/_layout.tsx`), **not** `@react-navigation/bottom-tabs`
- **FAB** in the tab bar expands to income / expense / transfer options
- Transaction form lives at `src/app/transaction/[id].tsx` as a `fullScreenModal`; `id="new"` means create, otherwise edit
- `NewEnum.NEW = "new"` sentinel (`src/types/new.ts`) is used throughout for create-vs-edit route params

Root providers (in order): `KeyboardProvider` → `GestureHandlerRootView` (keyed by RTL state) → `TooltipProvider` → `Stack`. `AppLockGate` and `ToastManager` render outside the Stack.

### Database (WatermelonDB)

DB name: `minty_flow_db` | Schema version: 1 | JSI adapter enabled via `plugins/withWatermelonDBJSI.js`

- Schema defined in `src/database/schema.ts`
- Models in `src/database/models/` (one file per table)
- Services in `src/database/services/` — functional, one service per model, all re-exported from the `index.ts` barrel
- Model→plain-object mappers in `src/database/utils/`
- Transfer records create **two** transaction rows (both have `is_transfer: true`) linked by a shared `transfer_id` UUID, plus one row in the `transfers` table
- Recurring transactions are RRULE-based templates in `recurring_transactions`; `use-recurring-transaction-sync` hook spawns instances on app foreground

### Theming (react-native-unistyles v3)

All styles use the `StyleSheet.create((t) => ...)` callback form — never plain `StyleSheet.create({})`.

- Theme definition: `src/styles/theme/` — `factory.ts` builds theme objects, `registry.ts` exports `ALL_THEMES`, color schemes in `schemes/` (`minty.ts`, `catppuccin.ts`, `standalone.ts`)
- Active theme key type: `ThemeKey = keyof typeof ALL_THEMES`
- Default theme: `coastalTrim`
- Unistyles configured in `src/styles/unistyles.ts`, reads initial theme from MMKV on startup
- Key color tokens: `theme.colors.primary`, `.secondary`, `.surface`, `.onSurface`, `.customColors.income`, `.customColors.expense`
- Co-located style files named `*.styles.ts`

### State Management (Zustand v5 + MMKV)

All stores in `src/stores/`. Stores persist to MMKV where needed. Key stores:

| Store | Purpose |
|---|---|
| `theme.store.ts` | Active theme, persisted |
| `language.store.ts` | Language code + RTL state; syncs i18n & `I18nManager` |
| `money-formatting.store.ts` | Number format prefs, mask-on-shake |
| `toast.store.ts` | Toast queue |
| `app-lock.store.ts` | Biometric/PIN gate |
| `transaction-sheet-controls.store.ts` | Transaction form UI state |

### i18n (i18next + react-i18next)

Languages: English (`en.json`), Arabic (`ar.json`) in `src/i18n/translation/`.
Translation keys are typed — `TranslationKey` is derived from the shape of `en.json`.
Usage: `const { t } = useTranslation()` → `t("some.nested.key")`.
RTL layout is driven by `useLanguageStore` — `PagerView` and `GestureHandlerRootView` are re-keyed when RTL changes.

### Forms

`react-hook-form` + `zod` v4 + `@hookform/resolvers`. Form schemas live in `src/schemas/`.

### Component Conventions

- UI primitives in `src/components/ui/`: `Button`, `Text`, `View`, `Pressable`, `Input`, `Switch`, `Chips`, `Toast`, `Tooltip`, `IconSymbol`
- Feature components grouped by domain: `accounts/`, `categories/`, `tags/`, `transaction/`, `theme/`
- Complex components use a directory with `index.ts` barrel, `*.styles.ts`, `types.ts`, and split sub-files
- `ActionItem` (`src/components/action-item.tsx`) is the standard settings-row component
- `IconSymbol` wraps MaterialCommunityIcons (see `src/components/ui/icon-symbol.tsx`)

### Linting

Biome (`biome.json`). Import order: packages → blank line → aliases (`~/`) → blank line → relative paths. Semicolons: as-needed. `console` calls are an error (use `src/utils/logger.ts`).
