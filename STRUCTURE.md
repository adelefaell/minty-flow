# Project Structure

```
./
├── .github/
│   └── CODEOWNERS
├── .gitignore
├── .husky/
│   ├── _/
│   │   ├── .gitignore
│   │   ├── applypatch-msg
│   │   ├── commit-msg
│   │   ├── h
│   │   ├── husky.sh
│   │   ├── post-applypatch
│   │   ├── post-checkout
│   │   ├── post-commit
│   │   ├── post-merge
│   │   ├── post-rewrite
│   │   ├── pre-applypatch
│   │   ├── pre-auto-gc
│   │   ├── pre-commit
│   │   ├── pre-merge-commit
│   │   ├── pre-push
│   │   ├── pre-rebase
│   │   └── prepare-commit-msg
│   └── pre-commit
├── .vscode/
│   ├── extensions.json
│   └── settings.json
├── .zed/
│   └── settings.json
├── README.md
├── STRUCTURE.md
├── app.json
├── babel.config.js
├── biome.json
├── docs/
│   ├── ICON_SELECTION_V2_GUIDE.md
│   ├── ICON_SELECTION_V2_SUMMARY.md
│   ├── REACT_NATIVE_MIGRATION_GUIDE.md
│   └── THEMEING_SYSTEM.md
├── expo-env.d.ts
├── index.ts
├── package.json
├── plugins/
│   ├── README.md
│   ├── index.js
│   └── withWatermelonDBJSI.js
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── scripts/
│   ├── generate-structure.js
│   └── run-android-usb.js
├── src/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── accounts-view.tsx
│   │   │   ├── index.tsx
│   │   │   ├── settings-view.tsx
│   │   │   └── stats-view.tsx
│   │   ├── +html.tsx
│   │   ├── _layout.tsx
│   │   ├── accounts/
│   │   │   ├── [accountId]/
│   │   │   │   ├── index.tsx
│   │   │   │   └── modify.tsx
│   │   │   └── index.tsx
│   │   └── settings/
│   │       ├── all-accounts.tsx
│   │       ├── bill-splitter.tsx
│   │       ├── budgets.tsx
│   │       ├── categories/
│   │       │   ├── [categoryId]/
│   │       │   │   ├── index.tsx
│   │       │   │   └── modify.tsx
│   │       │   ├── archived.tsx
│   │       │   ├── index.tsx
│   │       │   └── presets.tsx
│   │       ├── data-management.tsx
│   │       ├── edit-profile.tsx
│   │       ├── goals.tsx
│   │       ├── loans.tsx
│   │       ├── pending-transactions.tsx
│   │       ├── preferences/
│   │       │   ├── exchange-rates.tsx
│   │       │   ├── index.tsx
│   │       │   ├── money-formatting.tsx
│   │       │   ├── numpad.tsx
│   │       │   ├── pending-transactions.tsx
│   │       │   ├── privacy.tsx
│   │       │   ├── reminder.tsx
│   │       │   ├── theme.tsx
│   │       │   ├── toast-style.tsx
│   │       │   ├── transaction-location.tsx
│   │       │   └── trash-bin.tsx
│   │       ├── tags/
│   │       │   ├── [tagId].tsx
│   │       │   └── index.tsx
│   │       └── trash.tsx
│   ├── assets/
│   │   └── images/
│   │       ├── android-icon-background.png
│   │       ├── android-icon-foreground.png
│   │       ├── android-icon-monochrome.png
│   │       ├── favicon.png
│   │       ├── icon.png
│   │       ├── partial-react-logo.png
│   │       ├── react-logo.png
│   │       ├── react-logo@2x.png
│   │       ├── react-logo@3x.png
│   │       └── splash-icon.png
│   ├── components/
│   │   ├── accounts/
│   │   │   ├── account-card.tsx
│   │   │   ├── account-type-selector-sheet.tsx
│   │   │   └── delete-account-sheet.tsx
│   │   ├── action-item.tsx
│   │   ├── bottom-sheet.tsx
│   │   ├── calculator-sheet.tsx
│   │   ├── categories/
│   │   │   ├── category-list.tsx
│   │   │   ├── category-row.tsx
│   │   │   ├── category-type-selector-sheet.tsx
│   │   │   └── delete-category-sheet.tsx
│   │   ├── change-icon-sheet.tsx
│   │   ├── color-variant-sheet.tsx
│   │   ├── currency-selector-sheet.tsx
│   │   ├── dynamic-icon.tsx
│   │   ├── emoji-letter-selection-sheet.tsx
│   │   ├── external-link.tsx
│   │   ├── haptic-tab.tsx
│   │   ├── icon-selection-sheet.tsx
│   │   ├── image-selection-sheet.tsx
│   │   ├── keyboard-sticky-view-minty.tsx
│   │   ├── parallax-scroll-view.tsx
│   │   ├── profile/
│   │   │   └── profile-section.tsx
│   │   ├── reorderable-list-v1.tsx
│   │   ├── reorderable-list-v2.tsx
│   │   ├── screen-shared-header.tsx
│   │   ├── search-input.tsx
│   │   ├── summary-card.tsx
│   │   ├── tags/
│   │   │   ├── contact-selector-sheet.tsx
│   │   │   ├── delete-tag-sheet.tsx
│   │   │   └── tag-card.tsx
│   │   ├── toggle-item.tsx
│   │   ├── transaction-item.tsx
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── icon-symbol.ios.tsx
│   │   │   ├── icon-symbol.tsx
│   │   │   ├── input.tsx
│   │   │   ├── money.tsx
│   │   │   ├── pressable.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── text.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── view.tsx
│   │   └── unsaved-changes-sheet.tsx
│   ├── constants/
│   │   ├── minty-icons-selection.ts
│   │   ├── pre-sets-categories.ts
│   │   └── site-data.ts
│   ├── database/
│   │   ├── index.ts
│   │   ├── migrations.ts
│   │   ├── models/
│   │   │   ├── Account.ts
│   │   │   ├── Budget.ts
│   │   │   ├── Category.ts
│   │   │   ├── Goal.ts
│   │   │   ├── Loan.ts
│   │   │   ├── Tag.ts
│   │   │   ├── Transaction.ts
│   │   │   └── TransactionTag.ts
│   │   ├── schema.ts
│   │   ├── services/
│   │   │   ├── README.md
│   │   │   ├── account-service.ts
│   │   │   ├── budget-service.ts
│   │   │   ├── category-service.ts
│   │   │   ├── goal-service.ts
│   │   │   ├── index.ts
│   │   │   ├── loan-service.ts
│   │   │   ├── tag-service.ts
│   │   │   └── transaction-service.ts
│   │   └── utils/
│   │       ├── model-to-account.ts
│   │       ├── model-to-category.ts
│   │       └── model-to-tag.ts
│   ├── hooks/
│   │   ├── use-boolean.ts
│   │   ├── use-color-scheme.ts
│   │   ├── use-color-scheme.web.ts
│   │   └── use-time-utils.ts
│   ├── schemas/
│   │   ├── accounts.schema.ts
│   │   ├── categories.schema.ts
│   │   └── tags.schema.ts
│   ├── services/
│   │   ├── currency-registry.ts
│   │   ├── exchange-rates.ts
│   │   └── index.ts
│   ├── stores/
│   │   ├── android-sound.store.ts
│   │   ├── calculator.store.ts
│   │   ├── letter-emoji.store.ts
│   │   ├── money-formatting.store.ts
│   │   ├── notification.store.ts
│   │   ├── numpad-style.store.ts
│   │   ├── profile.store.ts
│   │   ├── theme.store.ts
│   │   ├── toast-style.store.ts
│   │   ├── toast.store.ts
│   │   ├── transaction-item-appearance.store.ts
│   │   └── transaction-sheet-controls.store.ts
│   ├── styles/
│   │   ├── breakpoints.ts
│   │   ├── fonts.ts
│   │   ├── theme/
│   │   │   ├── base.ts
│   │   │   ├── colors.ts
│   │   │   ├── factory.ts
│   │   │   ├── index.ts
│   │   │   ├── registry.ts
│   │   │   ├── schemes/
│   │   │   │   ├── catppuccin.ts
│   │   │   │   ├── minty.ts
│   │   │   │   └── standalone.ts
│   │   │   ├── types.ts
│   │   │   ├── unistyles-themes.ts
│   │   │   └── utils.ts
│   │   └── unistyles.ts
│   ├── types/
│   │   ├── accounts.ts
│   │   ├── budgets.ts
│   │   ├── calculator.ts
│   │   ├── categories.ts
│   │   ├── currency.ts
│   │   ├── goals.ts
│   │   ├── loans.ts
│   │   ├── new.ts
│   │   ├── tags.ts
│   │   └── transactions.ts
│   └── utils/
│       ├── account-types-list.ts
│       ├── calculate-operations.ts
│       ├── icon-helpers.ts
│       ├── is-image-url.ts
│       ├── is-single-emoji-or-letter.ts
│       ├── is-valid-icon-name.ts
│       ├── logger.ts
│       ├── number-format.ts
│       ├── numpad-utils.ts
│       ├── string-utils.ts
│       └── toast.ts
├── tsconfig.json

```
