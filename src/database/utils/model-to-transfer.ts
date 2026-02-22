import type { Transfer } from "~/types/transfers"

import type TransferModel from "../models/transfer"

/**
 * Convert TransferModel to Transfer domain type
 */
export const modelToTransfer = (model: TransferModel): Transfer => {
  return {
    id: model.id,
    fromTransactionId: model.fromTransactionId,
    toTransactionId: model.toTransactionId,
    fromAccountId: model.fromAccountId,
    toAccountId: model.toAccountId,
    conversionRate: model.conversionRate,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  }
}
