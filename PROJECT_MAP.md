# Minty Flow Native - Project Map

## Overview
**Project Name:** minty-flow-native  
**Type:** React Native / Expo Application  
**Version:** 0.0.1  
**Framework:** Expo Router (file-based routing)  
**State Management:** Zustand  
**Styling:** React Native Unistyles  
**Language:** TypeScript

---

## 📁 Directory Structure

```
minty-flow-native/
├── .husky/                     # Git hooks
│   └── pre-commit
│
├── .vscode/                     # VS Code settings
│   ├── extensions.json
│   └── settings.json
│
├── docs/                       # Project documentation
│   ├── REACT_NATIVE_MIGRATION_GUIDE.md
│   └── THEMEING_SYSTEM.md
│
├── src/                        # Source code
│   ├── app/                    # Expo Router app directory (file-based routing)
│   │   ├── _layout.tsx         # Root layout
│   │   ├── +html.tsx           # HTML wrapper for web
│   │   ├── toast-demo.tsx      # Toast demo screen
│   │   │
│   │   ├── (tabs)/             # Tab navigation group
│   │   │   ├── _layout.tsx     # Tab layout
│   │   │   ├── index.tsx       # Home tab
│   │   │   ├── accounts.tsx     # Accounts tab
│   │   │   ├── settings.tsx    # Settings tab
│   │   │   └── stats.tsx       # Stats tab
│   │   │
│   │   └── settings/          # Settings navigation group
│   │       ├── (categories)/   # Category settings
│   │       │   ├── categories.tsx
│   │       │   ├── presets.tsx
│   │       │   └── [categoryId].tsx  # Dynamic category detail
│   │       │
│   │       ├── preferences/ # User preferences
│   │       │   ├── preferences.tsx
│   │       │   ├── theme.tsx
│   │       │   ├── exchange-rates.tsx
│   │       │   ├── money-formatting.tsx
│   │       │   ├── numpad.tsx
│   │       │   ├── pending-transactions.tsx
│   │       │   ├── privacy.tsx
│   │       │   ├── reminder.tsx
│   │       │   ├── toast-style.tsx
│   │       │   ├── transaction-location.tsx
│   │       │   └── trash-bin.tsx
│   │       │
│   │       ├── bill-splitter.tsx
│   │       ├── budgets.tsx
│   │       ├── data-management.tsx
│   │       ├── edit-profile.tsx
│   │       ├── goals.tsx
│   │       ├── loans.tsx
│   │       ├── notifications.tsx
│   │       ├── pending-transactions.tsx
│   │       ├── tags.tsx
│   │       └── trash.tsx
│   │
│   ├── assets/                 # Static assets
│   │   └── images/
│   │       ├── icon.png
│   │       ├── favicon.png
│   │       ├── splash-icon.png
│   │       ├── android-icon-*.png (foreground, background, monochrome)
│   │       └── react-logo*.png
│   │
│   ├── components/             # Reusable components
│   │   ├── ui/                 # UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── icon-symbol.tsx
│   │   │   ├── icon-symbol.ios.tsx
│   │   │   ├── input.tsx
│   │   │   ├── pressable.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── text.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── view.tsx
│   │   │
│   │   ├── account-card.tsx
│   │   ├── action-item.tsx
│   │   ├── archive-category-sheet.tsx
│   │   ├── bottom-sheet.tsx
│   │   ├── button-example.tsx
│   │   ├── calculator-sheet.tsx
│   │   ├── category-list.tsx
│   │   ├── category-row.tsx
│   │   ├── delete-category-sheet.tsx
│   │   ├── example-bottom-sheet-1.tsx
│   │   ├── external-link.tsx
│   │   ├── haptic-tab.tsx
│   │   ├── icon.tsx
│   │   ├── parallax-scroll-view.tsx
│   │   ├── profile-section.tsx
│   │   ├── reorderable-list-v1.tsx
│   │   ├── reorderable-list-v2.tsx
│   │   └── screen-shared-header.tsx
│   │
│   ├── constants/              # App constants
│   │   ├── pre-sets-categories.ts
│   │   └── site-data.ts
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-boolean.ts
│   │   ├── use-color-scheme.ts
│   │   ├── use-color-scheme.web.ts
│   │   └── use-time-utils.ts
│   │
│   ├── services/               # Business logic services
│   │   ├── currency-registry.ts
│   │   ├── exchange-rates.ts
│   │   └── index.ts
│   │
│   ├── stores/                 # Zustand state stores
│   │   ├── amount-formatting.store.ts
│   │   ├── calculator.store.ts
│   │   ├── category-search.store.ts
│   │   ├── currency.store.ts
│   │   ├── letter-emoji.store.ts
│   │   ├── numpad-style.store.ts
│   │   ├── profile.store.ts
│   │   ├── reorder-mode.store.ts
│   │   ├── theme.store.ts
│   │   ├── toast-style.store.ts
│   │   ├── toast.store.ts
│   │   ├── transaction-item-appearance.store.ts
│   │   └── transaction-sheet-controls.store.ts
│   │
│   ├── styles/                 # Styling system
│   │   ├── breakpoints.ts
│   │   ├── fonts.ts
│   │   ├── unistyles.ts
│   │   └── theme/
│   │       ├── base.ts
│   │       ├── colors.ts
│   │       ├── factory.ts
│   │       ├── index.ts
│   │       ├── registry.ts
│   │       ├── types.ts
│   │       ├── unistyles-themes.ts
│   │       ├── utils.ts
│   │       └── schemes/
│   │           ├── catppuccin.ts
│   │           ├── minty.ts
│   │           └── standalone.ts
│   │
│   ├── types/                  # TypeScript type definitions
│   │   ├── calculator.ts
│   │   ├── categories.ts
│   │   └── currency.ts
│   │
│   └── utils/                  # Utility functions
│       ├── calculate-operations.ts
│       ├── logger.ts
│       ├── number-format.ts
│       ├── string-utils.ts
│       └── toast.ts
│
├── .gitignore                  # Git ignore rules
├── app.json                    # Expo configuration
├── babel.config.js             # Babel configuration
├── biome.json                  # Biome linter/formatter config
├── index.ts                    # Entry point
├── package.json                # Dependencies and scripts
├── pnpm-lock.yaml              # pnpm lock file
├── pnpm-workspace.yaml         # pnpm workspace config
├── README.md                    # Project readme
└── tsconfig.json               # TypeScript configuration
```

---

## 🗂️ Key Directories Explained

### `/src/app`
Expo Router file-based routing directory. Routes are defined by the file structure:
- `(tabs)` - Tab navigation group
- `settings` - Settings navigation group with nested routes
- `_layout.tsx` - Layout wrapper components
- `[categoryId].tsx` - Dynamic route parameters

### `/src/components`
Reusable UI components:
- `ui/` - Base UI primitives (button, text, input, etc.)
- Feature-specific components (category-list, account-card, etc.)
- Sheet components (bottom-sheet, calculator-sheet, etc.)

### `/src/stores`
Zustand state management stores for:
- UI state (theme, toast, calculator)
- Business logic (currency, profile, categories)
- User preferences (numpad-style, amount-formatting)

### `/src/styles/theme`
Comprehensive theming system:
- Multiple color schemes (minty, catppuccin, standalone)
- Theme factory and registry
- Unistyles integration

### `/src/services`
Business logic services:
- Currency handling
- Exchange rate management

---

## 🛠️ Technology Stack

### Core
- **React Native** 0.81.5
- **Expo** ~54.0.30
- **Expo Router** ~6.0.21 (file-based routing)
- **TypeScript** ~5.9.2

### State Management
- **Zustand** ^5.0.9
- **Immer** ^11.1.0

### UI & Styling
- **React Native Unistyles** ^3.0.20
- **@gorhom/bottom-sheet** ^5.2.8
- **React Native Reanimated** ~4.1.6
- **React Native Gesture Handler** ~2.28.0

### Navigation
- **@react-navigation/native** ^7.1.8
- **@react-navigation/bottom-tabs** ^7.4.0

### Forms & Validation
- **React Hook Form** ^7.68.0
- **@hookform/resolvers** ^5.2.2
- **Zod** ^4.2.1

### Storage
- **React Native MMKV** ^4.1.0

### Utilities
- **date-fns** ^4.1.0
- **lucide-react-native** ^0.562.0
- **@expo/vector-icons** ^15.0.3

### Development Tools
- **@biomejs/biome** ^2.3.10 (linter/formatter)
- **Husky** ^9.1.7 (git hooks)

---

## 📱 App Features (Based on Routes)

### Main Tabs
- **Home** (`index.tsx`) - Main dashboard
- **Accounts** - Account management
- **Stats** - Statistics and analytics
- **Settings** - App settings

### Settings Categories
- **Categories** - Transaction categories management
- **Preferences** - User preferences (theme, formatting, etc.)
- **Budgets** - Budget management
- **Goals** - Financial goals
- **Loans** - Loan tracking
- **Tags** - Transaction tags
- **Notifications** - Notification settings
- **Data Management** - Data import/export
- **Profile** - User profile editing

---

## 🎨 Theming System

The app uses a sophisticated theming system located in `/src/styles/theme/`:
- Multiple color scheme support
- Theme factory pattern
- Unistyles integration
- Platform-specific adaptations

See `docs/THEMEING_SYSTEM.md` for detailed documentation.

---

## 📝 Scripts

```bash
pnpm start          # Start Expo dev server
pnpm android        # Run on Android
pnpm ios            # Run on iOS
pnpm web            # Run on web
pnpm types          # Type check
pnpm lint           # Lint code
pnpm lint:fix       # Fix linting issues
```

---

## 🔧 Configuration Files

- `app.json` - Expo app configuration
- `tsconfig.json` - TypeScript configuration
- `babel.config.js` - Babel transpilation config
- `biome.json` - Linting and formatting rules
- `.husky/pre-commit` - Pre-commit git hook

---

## 📚 Documentation

- `README.md` - Project overview
- `docs/REACT_NATIVE_MIGRATION_GUIDE.md` - Migration guide
- `docs/THEMEING_SYSTEM.md` - Theming documentation
- `.agents/skills/` - Agent skills and patterns

---

## 🏗️ Architecture Patterns

- **File-based routing** (Expo Router)
- **State management** (Zustand stores)
- **Component composition** (UI primitives + feature components)
- **Theme system** (Factory pattern with multiple schemes)
- **Service layer** (Business logic separation)

---

*Last updated: Generated from project structure*
