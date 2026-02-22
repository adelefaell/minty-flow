# Minty Flow (Native)

A React Native app built with [Expo](https://expo.dev), using file-based routing and a local-first stack (WatermelonDB, MMKV).

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** (or npm/yarn)
- For **Android**: [Android Studio](https://developer.android.com/studio) with an AVD, or a physical device via USB (Expo Go is not supported — native modules require a dev build)
- For **iOS**: macOS with Xcode and iOS Simulator, or a physical device

## Install & setup

### 1. Clone the repo

```bash
git clone <repository-url>
cd minty-flow
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Generate native projects (first time only)

```bash
pnpm prebuild
```

This creates the `ios/` and `android/` folders and applies native config (including WatermelonDB JSI). Required before your first `pnpm android` or `pnpm ios`.

### 4. Run the app

This app uses **native modules** (e.g. WatermelonDB, MMKV), so you cannot use `pnpm start` with Expo Go. You must run on an **Android emulator**, **iOS simulator**, or a **physical device** connected via USB:

```bash
pnpm android
# or (macOS only)
pnpm ios
```

Make sure you've run prebuild first (step 3) so the native project includes WatermelonDB. The first run can take a few minutes.

## Scripts

| Command | Description |
|--------|-------------|
| `pnpm android` | Run on Android (dev build) |
| `pnpm ios` | Run on iOS (dev build) |
| `pnpm web` | Run in the browser |
| `pnpm prebuild` | Generate `ios/` and `android/` (required for first-time dev build, incl. WatermelonDB) |
| `pnpm types` | Type-check with TypeScript |
| `pnpm lint` | Run Biome linter |
| `pnpm lint:fix` | Lint and auto-fix |

## Project structure

- **`src/app/`** — Screens and routes (Expo Router file-based routing)
- **`src/components/`** — Reusable UI and logic
- **`app.json`** — Expo app config (name, slug, plugins, etc.)

## Environment

Local overrides go in `.env.local` (or `.env.*.local`). These files are gitignored. Copy from any `.env.example` in the repo if one exists.

## Learn more

- [Expo docs](https://docs.expo.dev/) — fundamentals and guides
- [Expo Router](https://docs.expo.dev/router/introduction/) — file-based routing
- [EAS Build](https://docs.expo.dev/build/introduction/) — cloud builds (this project has `eas.json` configured)
