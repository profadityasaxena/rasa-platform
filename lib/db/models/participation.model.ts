import mongoose, { Schema, type Document } from "mongoose"

export type ParticipationStatus = "checked_in" | "completed" | "incomplete"

export interface IParticipation extends Document {
  opportunityId: mongoose.Types.ObjectId
  applicationId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  status: ParticipationStatus
  checkInAt?: Date
  checkOutAt?: Date
  actualHours: number // floor(minutes/60)
  creditsAwarded: number
  checkInQrToken?: string
  checkOutQrToken?: string
  verifiedBy?: mongoose.Types.ObjectId // field_rep userId
  createdAt: Date
  updatedAt: Date
}

const ParticipationSchema = new Schema<IParticipation>(
  {
    opportunityId: { type: Schema.Types.ObjectId, ref: "Opportunity", required: true, index: true },
    applicationId: { type: Schema.Types.ObjectId, ref: "Application", required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["checked_in", "completed", "incomplete"],
      default: "checked_in",
    },
    checkInAt: Date,
    checkOutAt: Date,
    actualHours: { type: Number, default: 0 },
    creditsAwarded: { type: Number, default: 0 },
    checkInQrToken: String,
    checkOutQrToken: String,
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
)

export const ParticipationModel =
  mongoose.models.Participation ??
  mongoose.model<IParticipation>("Participation", ParticipationSchema)
