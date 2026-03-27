import mongoose, { Schema, type Document } from "mongoose"

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId
  balance: number
  // Running daily transfer total for the 500-credit cap
  dailyTransferTotal: number
  dailyTransferDate: string // "YYYY-MM-DD"
  createdAt: Date
  updatedAt: Date
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    balance: { type: Number, default: 0, min: 0 },
    dailyTransferTotal: { type: Number, default: 0 },
    dailyTransferDate: { type: String, default: "" },
  },
  { timestamps: true }
)

export const WalletModel =
  mongoose.models.Wallet ?? mongoose.model<IWallet>("Wallet", WalletSchema)
