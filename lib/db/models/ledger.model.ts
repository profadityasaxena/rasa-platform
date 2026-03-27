import mongoose, { Schema, type Document } from "mongoose"

export type LedgerEntryType =
  // Volunteer-only: credits issued for verified mission attendance
  | "mission_credit"
  // Credit transfers between users
  | "transfer_sent"
  | "transfer_received"
  // Marketplace: volunteer purchases, seller receives
  | "marketplace_purchase"
  | "marketplace_sale"
  // Platform admin manual adjustments
  | "adjustment"
  // Legacy aliases (kept for backward compatibility with existing records)
  | "credit_earned"
  | "transfer_out"
  | "transfer_in"
  | "redemption"

export interface ILedgerEntry extends Document {
  userId: mongoose.Types.ObjectId
  type: LedgerEntryType
  amount: number // positive = credit, negative = debit
  balanceAfter: number
  referenceId?: mongoose.Types.ObjectId // participationId, transferId, redemptionId…
  referenceType?: string
  description: string
  createdAt: Date
}

const LedgerSchema = new Schema<ILedgerEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: [
        "mission_credit", "transfer_sent", "transfer_received",
        "marketplace_purchase", "marketplace_sale", "adjustment",
        // legacy
        "credit_earned", "transfer_out", "transfer_in", "redemption",
      ],
      required: true,
    },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    referenceId: Schema.Types.ObjectId,
    referenceType: String,
    description: { type: String, required: true, maxlength: 200 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export const LedgerModel =
  mongoose.models.LedgerEntry ?? mongoose.model<ILedgerEntry>("LedgerEntry", LedgerSchema)
