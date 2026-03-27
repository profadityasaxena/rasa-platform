import mongoose, { Schema, type Document } from "mongoose"

export type FeedbackSubmitterRole = "volunteer" | "ngo_admin"

export interface IFeedback extends Document {
  opportunityId: mongoose.Types.ObjectId
  participationId: mongoose.Types.ObjectId
  submittedByUserId: mongoose.Types.ObjectId
  submittedByRole: FeedbackSubmitterRole
  // Volunteer → NGO
  orgRating?: number // 1–5
  orgComment?: string
  // NGO → Volunteer
  volunteerRating?: number // 1–5
  volunteerComment?: string
  createdAt: Date
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    opportunityId: { type: Schema.Types.ObjectId, ref: "Opportunity", required: true },
    participationId: { type: Schema.Types.ObjectId, ref: "Participation", required: true },
    submittedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    submittedByRole: { type: String, enum: ["volunteer", "ngo_admin"], required: true },
    orgRating: { type: Number, min: 1, max: 5 },
    orgComment: { type: String, maxlength: 500 },
    volunteerRating: { type: Number, min: 1, max: 5 },
    volunteerComment: { type: String, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

FeedbackSchema.index({ participationId: 1, submittedByRole: 1 }, { unique: true })

export const FeedbackModel =
  mongoose.models.Feedback ?? mongoose.model<IFeedback>("Feedback", FeedbackSchema)
