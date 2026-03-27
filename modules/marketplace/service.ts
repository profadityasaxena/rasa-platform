import crypto from "crypto"
import mongoose from "mongoose"
import { connectToDatabase } from "@/lib/db/mongoose"
import { MarketplaceOfferModel, RedemptionModel } from "@/lib/db/models/marketplace.model"
import { debitCredits, creditCredits } from "@/modules/ledger/service"
import { OrganizationModel } from "@/lib/db/models/organization.model"
import type { LedgerEntryType } from "@/lib/db/models/ledger.model"

export async function listActiveOffers() {
  await connectToDatabase()
  return MarketplaceOfferModel.find({ status: "active" })
    .sort({ creditCost: 1 })
    .lean()
}

export async function getOfferById(id: string) {
  await connectToDatabase()
  return MarketplaceOfferModel.findById(id).lean()
}

export async function redeemOffer(
  userId: string,
  offerId: string
): Promise<{ success: true; code: string } | { success: false; error: string }> {
  await connectToDatabase()

  const offer = await MarketplaceOfferModel.findById(offerId)
  if (!offer) return { success: false, error: "Offer not found." }
  if (offer.status !== "active") return { success: false, error: "Offer is no longer available." }
  if (offer.expiresAt && offer.expiresAt < new Date()) {
    return { success: false, error: "This offer has expired." }
  }
  if (offer.stock !== undefined && offer.stock !== null && offer.stock <= 0) {
    return { success: false, error: "This offer is out of stock." }
  }

  // Debit the volunteer's wallet (marketplace_purchase)
  const debit = await debitCredits({
    userId,
    amount: offer.creditCost,
    type: "marketplace_purchase",
    referenceId: offerId,
    referenceType: "MarketplaceOffer",
    description: `Purchased: ${offer.title}`,
  })
  if (!debit.success) return { success: false, error: debit.error }

  const code = crypto.randomBytes(8).toString("hex").toUpperCase()
  await RedemptionModel.create({
    offerId: new mongoose.Types.ObjectId(offerId),
    userId: new mongoose.Types.ObjectId(userId),
    creditsSpent: offer.creditCost,
    code,
  })

  // Decrement stock if finite
  if (offer.stock !== undefined && offer.stock !== null) {
    await MarketplaceOfferModel.findByIdAndUpdate(offerId, {
      $inc: { stock: -1, redemptionCount: 1 },
    })
  } else {
    await MarketplaceOfferModel.findByIdAndUpdate(offerId, { $inc: { redemptionCount: 1 } })
  }

  // Credit the seller org's primary admin wallet (marketplace_sale) — fire-and-forget
  const org = await OrganizationModel.findById(offer.organizationId).select("adminUserIds name").lean()
  const sellerUserId = org?.adminUserIds?.[0]?.toString()
  if (sellerUserId) {
    creditCredits({
      userId: sellerUserId,
      amount: offer.creditCost,
      type: "marketplace_sale" as LedgerEntryType,
      referenceId: offerId,
      referenceType: "MarketplaceOffer",
      description: `Sale: ${offer.title}`,
    }).catch(console.error)
  }

  return { success: true, code }
}

export async function getMyRedemptions(userId: string) {
  await connectToDatabase()
  return RedemptionModel.find({ userId: new mongoose.Types.ObjectId(userId) })
    .populate("offerId", "title creditCost")
    .sort({ createdAt: -1 })
    .lean()
}
