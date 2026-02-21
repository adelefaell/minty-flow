# Project Structure

Generated on: 2026-02-21T15:11:00.804Z

```
./
├── 📁 .cursor/
│   └── 📁 rules/
│       └── 📄 expo-react-native.mdc
├── 📁 .github/
│   └── 📄 CODEOWNERS
├── 📁 .husky/
│   ├── 📁 _/
│   │   ├── 📄 .gitignore
│   │   ├── 📄 applypatch-msg
│   │   ├── 📄 commit-msg
│   │   ├── 📄 h
│   │   ├── 📄 husky.sh
│   │   ├── 📄 post-applypatch
│   │   ├── 📄 post-checkout
│   │   ├── 📄 post-commit
│   │   ├── 📄 post-merge
│   │   ├── 📄 post-rewrite
│   │   ├── 📄 pre-applypatch
│   │   ├── 📄 pre-auto-gc
│   │   ├── 📄 pre-commit
│   │   ├── 📄 pre-merge-commit
│   │   ├── 📄 pre-push
│   │   ├── 📄 pre-rebase
│   │   └── 📄 prepare-commit-msg
│   └── 📄 pre-commit
├── 📁 .vscode/
│   ├── 📄 extensions.json
│   └── 📄 settings.json
├── 📁 .zed/
│   └── 📄 settings.json
├── 📁 docs/
│   └── 📄 front-end-claude-skill.md
├── 📁 plugins/
│   ├── 📄 index.js
│   ├── 📄 README.md
│   └── 📄 withWatermelonDBJSI.js
├── 📁 scripts/
│   ├── 📄 find-unused-styles.mjs
│   ├── 📄 generate-structure.mjs
│   └── 📄 run-android-usb.mjs
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 (tabs)/
│   │   │   ├── 📄 _layout.tsx
│   │   │   ├── 📄 index.tsx
│   │   │   └── 📄 stats-view.tsx
│   │   ├── 📁 accounts/
│   │   │   ├── 📁 [accountId]/
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   └── 📄 modify.tsx
│   │   │   └── 📄 index.tsx
│   │   ├── 📁 settings/
│   │   │   ├── 📁 categories/
│   │   │   │   ├── 📁 [categoryId]/
│   │   │   │   │   ├── 📄 index.tsx
│   │   │   │   │   └── 📄 modify.tsx
│   │   │   │   ├── 📄 archived.tsx
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   └── 📄 presets.tsx
│   │   │   ├── 📁 preferences/
│   │   │   │   ├── 📄 exchange-rates.tsx
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   ├── 📄 money-formatting.tsx
│   │   │   │   ├── 📄 pending-transactions.tsx
│   │   │   │   ├── 📄 privacy.tsx
│   │   │   │   ├── 📄 reminder.tsx
│   │   │   │   ├── 📄 theme.tsx
│   │   │   │   ├── 📄 toast-style.tsx
│   │   │   │   ├── 📄 transaction-location.tsx
│   │   │   │   ├── 📄 transfers.tsx
│   │   │   │   └── 📄 trash-bin.tsx
│   │   │   ├── 📁 tags/
│   │   │   │   ├── 📄 [tagId].tsx
│   │   │   │   └── 📄 index.tsx
│   │   │   ├── 📄 all-accounts.tsx
│   │   │   ├── 📄 bill-splitter.tsx
│   │   │   ├── 📄 budgets.tsx
│   │   │   ├── 📄 data-management.tsx
│   │   │   ├── 📄 edit-profile.tsx
│   │   │   ├── 📄 goals.tsx
│   │   │   ├── 📄 index.tsx
│   │   │   ├── 📄 loans.tsx
│   │   │   ├── 📄 pending-transactions.tsx
│   │   │   └── 📄 trash.tsx
│   │   ├── 📁 transaction/
│   │   │   └── 📄 [id].tsx
│   │   ├── 📄 _layout.tsx
│   │   └── 📄 +html.tsx
│   ├── 📁 assets/
│   │   └── 📁 images/
│   │       ├── 📄 android-icon-background.png
│   │       ├── 📄 android-icon-foreground.png
│   │       ├── 📄 android-icon-monochrome.png
│   │       ├── 📄 favicon.png
│   │       ├── 📄 icon.png
│   │       └── 📄 splash-icon.png
│   ├── 📁 components/
│   │   ├── 📁 accounts/
│   │   │   ├── 📄 account-card.tsx
│   │   │   └── 📄 account-type-inline.tsx
│   │   ├── 📁 categories/
│   │   │   ├── 📄 category-list.tsx
│   │   │   ├── 📄 category-row.tsx
│   │   │   ├── 📄 category-screen-content.tsx
│   │   │   └── 📄 category-type-inline.tsx
│   │   ├── 📁 profile/
│   │   │   └── 📄 profile-section.tsx
│   │   ├── 📁 tags/
│   │   │   ├── 📄 contact-selector-inline.tsx
│   │   │   └── 📄 tag-card.tsx
│   │   ├── 📁 transaction/
│   │   │   ├── 📄 attachment-preview-modal.tsx
│   │   │   ├── 📄 delete-recurring-modal.tsx
│   │   │   ├── 📄 edit-recurring-modal.tsx
│   │   │   ├── 📄 markdown-editor-modal.tsx
│   │   │   ├── 📄 notes-modal.tsx
│   │   │   ├── 📄 transaction-filter-header.tsx
│   │   │   ├── 📄 transaction-form-v3.tsx
│   │   │   ├── 📄 transaction-item.tsx
│   │   │   ├── 📄 transaction-section-list.tsx
│   │   │   ├── 📄 transaction-type-selector.tsx
│   │   │   └── 📄 upcoming-transactions-section.tsx
│   │   ├── 📁 ui/
│   │   │   ├── 📄 button.tsx
│   │   │   ├── 📄 choice-chips.tsx
│   │   │   ├── 📄 collapsible.tsx
│   │   │   ├── 📄 icon-symbol.ios.tsx.md
│   │   │   ├── 📄 icon-symbol.tsx
│   │   │   ├── 📄 input.tsx
│   │   │   ├── 📄 pressable.tsx
│   │   │   ├── 📄 separator.tsx
│   │   │   ├── 📄 switch.tsx
│   │   │   ├── 📄 text.tsx
│   │   │   ├── 📄 toast.tsx
│   │   │   ├── 📄 tooltip.tsx
│   │   │   └── 📄 view.tsx
│   │   ├── 📄 action-item.tsx
│   │   ├── 📄 bottom-sheet.tsx
│   │   ├── 📄 change-icon-inline.tsx
│   │   ├── 📄 color-variant-inline.tsx
│   │   ├── 📄 confirm-modal.tsx
│   │   ├── 📄 currency-selector-inline.tsx
│   │   ├── 📄 date-range-preset-modal.tsx
│   │   ├── 📄 dynamic-icon.tsx
│   │   ├── 📄 emoji-letter-selection-sheet.tsx
│   │   ├── 📄 external-link.tsx
│   │   ├── 📄 haptic-tab.tsx
│   │   ├── 📄 icon-selection-sheet.tsx
│   │   ├── 📄 info-modal.tsx
│   │   ├── 📄 keyboard-sticky-view-minty.tsx
│   │   ├── 📄 money.tsx
│   │   ├── 📄 month-year-picker.tsx
│   │   ├── 📄 parallax-scroll-view.tsx
│   │   ├── 📄 reorderable-list-v1.tsx
│   │   ├── 📄 reorderable-list-v2.tsx
│   │   ├── 📄 screen-shared-header.tsx
│   │   ├── 📄 search-input.tsx
│   │   ├── 📄 smart-amount-input.tsx
│   │   ├── 📄 summary-card.tsx
│   │   ├── 📄 tabs-minty.tsx
│   │   └── 📄 toggle-item.tsx
│   ├── 📁 constants/
│   │   ├── 📄 minty-icons-selection.ts
│   │   ├── 📄 pre-sets-categories.ts
│   │   └── 📄 site-data.ts
│   ├── 📁 database/
│   │   ├── 📁 models/
│   │   │   ├── 📄 Account.ts
│   │   │   ├── 📄 Budget.ts
│   │   │   ├── 📄 Category.ts
│   │   │   ├── 📄 Goal.ts
│   │   │   ├── 📄 Loan.ts
│   │   │   ├── 📄 RecurringTransaction.ts
│   │   │   ├── 📄 Tag.ts
│   │   │   ├── 📄 Transaction.ts
│   │   │   ├── 📄 TransactionTag.ts
│   │   │   └── 📄 Transfer.ts
│   │   ├── 📁 services/
│   │   │   ├── 📄 account-service.ts
│   │   │   ├── 📄 balance-service.ts
│   │   │   ├── 📄 budget-service.ts
│   │   │   ├── 📄 category-service.ts
│   │   │   ├── 📄 goal-service.ts
│   │   │   ├── 📄 index.ts
│   │   │   ├── 📄 loan-service.ts
│   │   │   ├── 📄 README.md
│   │   │   ├── 📄 recurring-transaction-service.ts
│   │   │   ├── 📄 tag-service.ts
│   │   │   ├── 📄 transaction-service.ts
│   │   │   └── 📄 transfer-service.ts
│   │   ├── 📁 utils/
│   │   │   ├── 📄 model-to-account.ts
│   │   │   ├── 📄 model-to-category.ts
│   │   │   ├── 📄 model-to-tag.ts
│   │   │   └── 📄 model-to-transfer.ts
│   │   ├── 📄 index.ts
│   │   ├── 📄 migrations.ts
│   │   └── 📄 schema.ts
│   ├── 📁 hooks/
│   │   ├── 📄 use-balance-before.ts
│   │   ├── 📄 use-boolean.ts
│   │   ├── 📄 use-color-scheme.ts
│   │   ├── 📄 use-navigation-guard.ts
│   │   ├── 📄 use-notification-permission-status.ts
│   │   ├── 📄 use-recurring-rule.ts
│   │   ├── 📄 use-recurring-transaction-sync.ts
│   │   ├── 📄 use-retention-cleanup.ts
│   │   └── 📄 use-time-reactivity.ts
│   ├── 📁 schemas/
│   │   ├── 📄 accounts.schema.ts
│   │   ├── 📄 categories.schema.ts
│   │   ├── 📄 tags.schema.ts
│   │   └── 📄 transactions.schema.ts
│   ├── 📁 services/
│   │   ├── 📄 auto-confirmation-service.ts
│   │   ├── 📄 currency-registry.ts
│   │   ├── 📄 exchange-rates.ts
│   │   ├── 📄 index.ts
│   │   └── 📄 pending-transaction-notifications.ts
│   ├── 📁 stores/
│   │   ├── 📄 android-sound.store.ts
│   │   ├── 📄 exchange-rates-preferences.store.ts
│   │   ├── 📄 letter-emoji.store.ts
│   │   ├── 📄 money-formatting.store.ts
│   │   ├── 📄 notification.store.ts
│   │   ├── 📄 pending-transactions.store.ts
│   │   ├── 📄 profile.store.ts
│   │   ├── 📄 theme.store.ts
│   │   ├── 📄 toast-style.store.ts
│   │   ├── 📄 toast.store.ts
│   │   ├── 📄 transaction-item-appearance.store.ts
│   │   ├── 📄 transaction-sheet-controls.store.ts
│   │   ├── 📄 transfers-preferences.store.ts
│   │   ├── 📄 trash-bin.store.ts
│   │   └── 📄 upcoming-section.store.ts
│   ├── 📁 styles/
│   │   ├── 📁 theme/
│   │   │   ├── 📁 schemes/
│   │   │   │   ├── 📄 catppuccin.ts
│   │   │   │   ├── 📄 minty.ts
│   │   │   │   └── 📄 standalone.ts
│   │   │   ├── 📄 base.ts
│   │   │   ├── 📄 colors.ts
│   │   │   ├── 📄 factory.ts
│   │   │   ├── 📄 index.ts
│   │   │   ├── 📄 registry.ts
│   │   │   ├── 📄 types.ts
│   │   │   ├── 📄 unistyles-themes.ts
│   │   │   └── 📄 utils.ts
│   │   ├── 📄 breakpoints.ts
│   │   ├── 📄 fonts.ts
│   │   └── 📄 unistyles.ts
│   ├── 📁 sync/
│   ├── 📁 types/
│   │   ├── 📄 accounts.ts
│   │   ├── 📄 budgets.ts
│   │   ├── 📄 categories.ts
│   │   ├── 📄 currency.ts
│   │   ├── 📄 goals.ts
│   │   ├── 📄 loans.ts
│   │   ├── 📄 new.ts
│   │   ├── 📄 tags.ts
│   │   ├── 📄 transaction-filters.ts
│   │   ├── 📄 transactions.ts
│   │   └── 📄 transfers.ts
│   └── 📁 utils/
│       ├── 📄 account-types-list.ts
│       ├── 📄 file-icon.ts
│       ├── 📄 format-file-size.ts
│       ├── 📄 icon-helpers.ts
│       ├── 📄 is-image-url.ts
│       ├── 📄 is-single-emoji-or-letter.ts
│       ├── 📄 is-valid-icon-name.ts
│       ├── 📄 logger.ts
│       ├── 📄 number-format.ts
│       ├── 📄 open-file.ts
│       ├── 📄 parse-math-expression.ts
│       ├── 📄 pending-transactions.ts
│       ├── 📄 recurrence.ts
│       ├── 📄 string-utils.ts
│       ├── 📄 time-utils.ts
│       ├── 📄 toast.ts
│       └── 📄 transaction-list-utils.ts
├── 📄 .gitignore
├── 📄 app.json
├── 📄 babel.config.js
├── 📄 biome.json
├── 📄 eas.json
├── 📄 expo-env.d.ts
├── 📄 index.ts
├── 📄 package.json
├── 📄 pnpm-lock.yaml
├── 📄 pnpm-workspace.yaml
├── 📄 README.md
├── 📄 STRUCTURE.md
└── 📄 tsconfig.json

```
