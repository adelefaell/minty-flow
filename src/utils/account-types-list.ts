import { type AccountType, AccountTypeEnum } from "~/types/accounts"

export const accountTypesList: { type: AccountType; label: string }[] = [
  { type: AccountTypeEnum.CHECKING, label: "Checking" },
  { type: AccountTypeEnum.SAVINGS, label: "Savings" },
  { type: AccountTypeEnum.CREDIT, label: "Credit" },
  { type: AccountTypeEnum.INVESTMENT, label: "Investment" },
  { type: AccountTypeEnum.OTHER, label: "Other" },
]
