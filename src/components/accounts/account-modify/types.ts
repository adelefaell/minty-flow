import type AccountModel from "~/database/models/Account"
import type { Account } from "~/types/accounts"

export interface AccountModifyContentProps {
  accountId: string
  accountModel?: AccountModel
  account?: Account
  transactionCount?: number
}
