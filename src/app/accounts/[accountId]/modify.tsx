import { withObservables } from "@nozbe/watermelondb/react"
import { useLocalSearchParams } from "expo-router"

import { AccountModifyContent } from "~/components/accounts/account-modify"
import type AccountModel from "~/database/models/Account"
import { observeAccountById } from "~/database/services/account-service"
import { observeTransactionCountByAccountId } from "~/database/services/transaction-service"
import { modelToAccount } from "~/database/utils/model-to-account"
import { NewEnum } from "~/types/new"

const EnhancedEditScreen = withObservables(["accountId"], ({ accountId }) => ({
  accountModel: observeAccountById(accountId),
  transactionCount: observeTransactionCountByAccountId(accountId),
}))(
  ({
    accountId,
    accountModel,
    transactionCount = 0,
  }: {
    accountId: string
    accountModel: AccountModel
    transactionCount?: number
  }) => {
    const account = accountModel ? modelToAccount(accountModel) : undefined

    return (
      <AccountModifyContent
        key={accountModel?.id || accountId}
        accountId={accountId}
        accountModel={accountModel}
        account={account}
        transactionCount={transactionCount}
      />
    )
  },
)

export default function EditAccountScreen() {
  const params = useLocalSearchParams<{ accountId: string }>()
  const accountId = params.accountId
  const isAddMode = accountId === NewEnum.NEW || !accountId

  if (isAddMode) {
    return <AccountModifyContent accountId={NewEnum.NEW} />
  }

  return <EnhancedEditScreen accountId={accountId} />
}
