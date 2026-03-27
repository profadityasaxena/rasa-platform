import mongoose, { Schema, type Document } from "mongoose"

export type OfferStatus = "active" | "paused" | "expired"

export interface IMarketplaceOffer extends Document {
  organizationId: mongoose.Types.ObjectId // reward_partner org
  title: string
  description: string
  creditCost: number
  stock?: number // null = unlimited
  expiresAt?: Date
  status: OfferStatus
  imageUrl?: string
  redemptionCount: number
  createdAt: Date
  updatedAt: Date
}

export interface IRedemption extends Document {
  offerId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  creditsSpent: number
  code: string // unique redemption code shown to volunteer
  redeemedAt?: Date
  createdAt: Date
}

const OfferSchema = new Schema<IMarketplaceOffer>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 1000 },
    creditCost: { type: Number, required: true, min: 1 },
    stock: Number,
    expiresAt: Date,
    status: { type: String, enum: ["active", "paused", "expired"], default: "active" },
    imageUrl: String,
    redemptionCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

OfferSchema.index({ status: 1, creditCost: 1 })

const RedemptionSchema = new Schema<IRedemption>(
  {
    offerId: { type: Schema.Types.ObjectId, ref: "MarketplaceOffer", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    creditsSpent: { type: Number, required: true },
    code: { type: String, required: true, unique: true },
    redeemedAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

RedemptionSchema.index({ userId: 1, createdAt: -1 })

export const MarketplaceOfferModel =
  mongoose.models.MarketplaceOffer ??
  mongoose.model<IMarketplaceOffer>("MarketplaceOffer", OfferSchema)

export const RedemptionModel =
  mongoose.models.Redemption ??
  mongoose.model<IRedemption>("Redemption", RedemptionSchema)
