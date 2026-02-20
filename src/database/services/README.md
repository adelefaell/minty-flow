# Database Services

This directory contains modular database services for WatermelonDB operations. Each service focuses on a specific model and provides CRUD operations following WatermelonDB best practices.

## Services

### Account Service (`account-service.ts`)
Manages financial accounts (checking, savings, credit, etc.)

```typescript
import { getAccounts, createAccount, updateAccount } from '~/database/services'

// Get all active accounts
const accounts = await getAccounts()

// Create new account
const account = await createAccount({
  name: 'My Checking',
  type: 'checking',
  balance: 1000,
  currencyCode: 'USD',
})

// Observe accounts reactively
const accounts$ = observeAccounts()
```

### Budget Service (`budget-service.ts`)
Manages budget limits and spending tracking

```typescript
import { getBudgets, createBudget, addSpending } from '~/database/services'

// Create monthly budget
const budget = await createBudget({
  name: 'Groceries',
  amount: 500,
  currencyCode: 'USD',
  period: 'monthly',
  startDate: new Date(),
  alertThreshold: 80, // Alert at 80%
})

// Add spending
await addSpending(budget, 50)
```

### Category Service (`category-service.ts`)
Manages transaction categories (expense, income, transfer)

```typescript
import { getCategories, createCategory } from '~/database/services'

const category = await createCategory({
  name: 'Food',
  type: 'expense',
  icon: '🍔',
  color: { name: 'red', bgClass: 'bg-red-100' },
})
```

### Goal Service (`goal-service.ts`)
Manages financial goals with progress tracking

```typescript
import { getGoals, createGoal, addToGoal } from '~/database/services'

// Create savings goal
const goal = await createGoal({
  name: 'Vacation Fund',
  targetAmount: 5000,
  currentAmount: 0,
  currencyCode: 'USD',
  targetDate: new Date('2024-12-31'),
})

// Add progress
await addToGoal(goal, 100)
```

### Loan Service (`loan-service.ts`)
Manages borrowed and lent money

```typescript
import { getLoans, createLoan, recordLoanPayment } from '~/database/services'

// Create loan
const loan = await createLoan({
  name: 'Car Loan',
  principalAmount: 20000,
  currencyCode: 'USD',
  loanType: 'borrowed',
  interestRate: 5.5,
  dueDate: new Date('2025-12-31'),
})

// Record payment
await recordLoanPayment(loan, 500)
```

### Tag Service (`tag-service.ts`)
Manages tags for categorizing transactions



### Transaction Service (`transaction-service.ts`)
Manages financial transactions

```typescript
import { getTransactions, createTransaction } from '~/database/services'

// Get transactions with filters
const expenses = await getTransactions({
  type: 'expense',
  accountId: account.id,
  isPending: false,
})

// Create transaction
const transaction = await createTransaction({
  amount: 50,
  currencyCode: 'USD',
  type: 'expense',
  date: new Date(),
  categoryId: category.id,
  accountId: account.id,
  description: 'Lunch',
  tags: ['business', 'food'],
})
```

## Common Patterns

### CRUD Operations

Each service provides these standard operations:

- **Get all**: `getModels(filters?)` - Fetch multiple records
- **Find by ID**: `findModel(id)` - Fetch single record
- **Observe all**: `observeModels(filters?)` - Reactive query
- **Observe by ID**: `observeModelById(id)` - Reactive single record
- **Create**: `createModel(data)` - Create new record
- **Update**: `updateModel(model, updates)` - Update existing record
- **Update by ID**: `updateModelById(id, updates)` - Update by ID
- **Delete**: `deleteModel(model)` - Mark as deleted (syncable)
- **Destroy**: `destroyModel(model)` - Permanently delete

### Using with React Components

```typescript
import { withObservables } from '@nozbe/watermelondb/react'
import { observeAccounts } from '~/database/services'

const AccountList = ({ accounts }) => (
  <div>
    {accounts.map(account => (
      <div key={account.id}>{account.name}</div>
    ))}
  </div>
)

export default withObservables([], () => ({
  accounts: observeAccounts(),
}))(AccountList)
```

### Batching Operations

For better performance, use WatermelonDB's batch operations:

```typescript
import { database } from '~/database'

await database.write(async () => {
  await database.batch(
    account.prepareUpdate(a => { a.balance = 1500 }),
    transaction.prepareCreate(t => { /* ... */ }),
  )
})
```

## Architecture

- **Functional approach**: Each service exports functions, not classes
- **Single responsibility**: Each service manages one model
- **Type safety**: Full TypeScript support with proper types
- **Reactive**: Observe functions for real-time updates
- **Consistent API**: All services follow the same pattern

## Import Path

All services are re-exported from `~/database/services` or `~/services`:

```typescript
// Import specific functions
import { getAccounts, createAccount } from '~/database/services'

// Or from main services
import { getAccounts, createAccount } from '~/services'
```
