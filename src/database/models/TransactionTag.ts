import { Model } from "@nozbe/watermelondb"
import { field, relation } from "@nozbe/watermelondb/decorators"

import type TagModel from "./Tag"
import type TransactionModel from "./Transaction"

export default class TransactionTagModel extends Model {
  static table = "transaction_tags"

  @field("transaction_id") transactionId!: string
  @field("tag_id") tagId!: string

  @relation("transactions", "transaction_id") transaction!: TransactionModel
  @relation("tags", "tag_id") tag!: TagModel
}
