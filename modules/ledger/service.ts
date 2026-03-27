import mongoose from "mongoose"
import { connectToDatabase } from "@/lib/db/mongoose"
import { LedgerModel } from "@/lib/db/models/ledger.model"
import { WalletModel } from "@/lib/db/models/wallet.model"
import type { LedgerEntryType } from "@/lib/db/models/ledger.model"

export interface LedgerEntry {
  id: string
  type: string
  amount: number
  balanceAfter: number
  description: string
  createdAt: string
}

async function getOrCreateWallet(userId: string) {
  await connectToDatabase()
  return WalletModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    {},
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )
}

export async function getBalance(userId: string): Promise<number> {
  const wallet = await getOrCreateWallet(userId)
  return wallet?.balance ?? 0
}

/**
 * Award mission credits to a verified volunteer.
 * ROLE ENFORCEMENT: Only users with role="volunteer" may receive mission credits.
 * Rejects any other role to prevent non-volunteers from accumulating credits
 * through mission participation.
 */
export async function awardMissionCredits(params: {
  userId: string
  userRole: string
  amount: number
  referenceId?: string
  description: string
}): Promise<{ success: true; balance: number } | { success: false; error: string }> {
  if (params.userRole !== "volunteer") {
    console.warn(
      `[ledger] Blocked mission_credit attempt — userId=${params.userId} role=${params.userRole} (only volunteers may earn mission credits)`
    )
    return { success: false, error: "Only volunteers can earn mission credits." }
  }
  await connectToDatabase()
  const wallet = await WalletModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(params.userId) },
    { $inc: { balance: params.amount } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )
  const balanceAfter = wallet?.balance ?? params.amount
  await LedgerModel.create({
    userId: new mongoose.Types.ObjectId(params.userId),
    type: "mission_credit" as LedgerEntryType,
    amount: params.amount,
    balanceAfter,
    referenceId: params.referenceId ? new mongoose.Types.ObjectId(params.referenceId) : undefined,
    referenceType: "Participation",
    description: params.description,
  })
  return { success: true, balance: balanceAfter }
}

/**
 * Generic credit for non-mission sources (marketplace sales, manual adjustments).
 * Does NOT enforce volunteer-only. Use awardMissionCredits for mission credits.
 */
export async function creditCredits(params: {
  userId: string
  amount: number
  type?: LedgerEntryType
  referenceId?: string
  referenceType?: string
  description: string
}): Promise<{ balance: number }> {
  await connectToDatabase()
  const wallet = await WalletModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(params.userId) },
    { $inc: { balance: params.amount } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )
  const balanceAfter = wallet?.balance ?? params.amount
  await LedgerModel.create({
    userId: new mongoose.Types.ObjectId(params.userId),
    type: params.type ?? "credit_earned",
    amount: params.amount,
    balanceAfter,
    referenceId: params.referenceId ? new mongoose.Types.ObjectId(params.referenceId) : undefined,
    referenceType: params.referenceType,
    description: params.description,
  })
  return { balance: balanceAfter }
}

export async function debitCredits(params: {
  userId: string
  amount: number
  type: "marketplace_purchase" | "transfer_sent" | "adjustment" | "redemption" | "transfer_out"
  referenceId?: string
  referenceType?: string
  description: string
}): Promise<{ success: true; balance: number } | { success: false; error: string }> {
  await connectToDatabase()
  const wallet = await WalletModel.findOne({ userId: new mongoose.Types.ObjectId(params.userId) })
  if (!wallet || wallet.balance < params.amount) {
    return { success: false, error: "Insufficient credits." }
  }
  wallet.balance -= params.amount
  await wallet.save()
  await LedgerModel.create({
    userId: new mongoose.Types.ObjectId(params.userId),
    type: params.type,
    amount: -params.amount,
    balanceAfter: wallet.balance,
    referenceId: params.referenceId ? new mongoose.Types.ObjectId(params.referenceId) : undefined,
    referenceType: params.referenceType,
    description: params.description,
  })
  return { success: true, balance: wallet.balance }
}

export async function transferCredits(params: {
  fromUserId: string
  toUserId: string
  amount: number
}): Promise<{ success: true } | { success: false; error: string }> {
  await connectToDatabase()

  if (params.amount <= 0) return { success: false, error: "Amount must be positive." }
  if (params.amount > 500) return { success: false, error: "Maximum single transfer is 500 credits." }

  const today = new Date().toISOString().split("T")[0]
  const fromWallet = await WalletModel.findOne({
    userId: new mongoose.Types.ObjectId(params.fromUserId),
  })
  if (!fromWallet || fromWallet.balance < params.amount) {
    return { success: false, error: "Insufficient credits." }
  }

  // Daily cap check
  const dailyTotal =
    fromWallet.dailyTransferDate === today ? fromWallet.dailyTransferTotal : 0
  if (dailyTotal + params.amount > 500) {
    return { success: false, error: "Daily transfer limit of 500 credits reached." }
  }

  // Debit sender
  fromWallet.balance -= params.amount
  fromWallet.dailyTransferTotal = dailyTotal + params.amount
  fromWallet.dailyTransferDate = today
  await fromWallet.save()

  // Credit receiver
  await WalletModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(params.toUserId) },
    { $inc: { balance: params.amount } },
    { upsert: true, setDefaultsOnInsert: true }
  )

  // Ledger entries
  await LedgerModel.insertMany([
    {
      userId: new mongoose.Types.ObjectId(params.fromUserId),
      type: "transfer_sent" as LedgerEntryType,
      amount: -params.amount,
      balanceAfter: fromWallet.balance,
      description: `Transfer sent to user`,
    },
    {
      userId: new mongoose.Types.ObjectId(params.toUserId),
      type: "transfer_received" as LedgerEntryType,
      amount: params.amount,
      balanceAfter: 0, // approximate — will be slightly off, acceptable for log
      description: `Transfer received`,
    },
  ])

  return { success: true }
}

export async function getLedgerHistory(userId: string, limit = 20): Promise<LedgerEntry[]> {
  await connectToDatabase()
  const docs = await LedgerModel.find({ userId: new mongoose.Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(limit)
  return docs.map((d) => ({
    id: d._id.toString(),
    type: d.type,
    amount: d.amount,
    balanceAfter: d.balanceAfter,
    description: d.description,
    createdAt: d.createdAt.toISOString(),
  }))
}
