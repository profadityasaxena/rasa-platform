import mongoose, { Schema, type Document } from "mongoose"

export type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "attended"
  | "no_show"

export interface IApplication extends Document {
  opportunityId: mongoose.Types.ObjectId
  volunteerId: mongoose.Types.ObjectId // volunteer profile id
  userId: mongoose.Types.ObjectId
  status: ApplicationStatus
  matchScore: number
  scoreBreakdown: {
    skillCoverage: number
    interestAlignment: number
    locationDecay: number
    availabilityOverlap: number
  }
  motivation?: string
  reviewedBy?: mongoose.Types.ObjectId
  reviewedAt?: Date
  reapplicationAllowed: boolean
  createdAt: Date
  updatedAt: Date
}

const ApplicationSchema = new Schema<IApplication>(
  {
    opportunityId: { type: Schema.Types.ObjectId, ref: "Opportunity", required: true, index: true },
    volunteerId: { type: Schema.Types.ObjectId, ref: "Volunteer", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn", "attended", "no_show"],
      default: "pending",
    },
    matchScore: { type: Number, required: true, min: 0, max: 1 },
    scoreBreakdown: {
      skillCoverage: { type: Number, default: 0 },
      interestAlignment: { type: Number, default: 0 },
      locationDecay: { type: Number, default: 0 },
      availabilityOverlap: { type: Number, default: 0 },
    },
    motivation: { type: String, maxlength: 500 },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    reapplicationAllowed: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Prevent duplicate applications
ApplicationSchema.index({ opportunityId: 1, userId: 1 }, { unique: true })

export const ApplicationModel =
  mongoose.models.Application ??
  mongoose.model<IApplication>("Application", ApplicationSchema)
