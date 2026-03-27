import mongoose, { Schema, type Document } from "mongoose"

export type QRTokenType = "check_in" | "check_out"

export interface IQRToken extends Document {
  token: string
  type: QRTokenType
  opportunityId: mongoose.Types.ObjectId
  participationId?: mongoose.Types.ObjectId
  expiresAt: Date
  usedAt?: Date
  createdAt: Date
}

const QRTokenSchema = new Schema<IQRToken>(
  {
    token: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ["check_in", "check_out"], required: true },
    opportunityId: { type: Schema.Types.ObjectId, ref: "Opportunity", required: true },
    participationId: { type: Schema.Types.ObjectId, ref: "Participation" },
    expiresAt: { type: Date, required: true },
    usedAt: Date,
  },
  { timestamps: true }
)

// TTL index: MongoDB auto-deletes expired tokens
QRTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const QRTokenModel =
  mongoose.models.QRToken ?? mongoose.model<IQRToken>("QRToken", QRTokenSchema)
