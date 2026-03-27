import mongoose, { Schema, type Document } from "mongoose"

export type OpportunityStatus =
  | "draft"
  | "open"
  | "in_progress"
  | "completed"
  | "cancelled"

export interface IOpportunity extends Document {
  organizationId: mongoose.Types.ObjectId
  title: string
  description: string
  status: OpportunityStatus
  skills: string[]
  interests: string[]
  location: {
    street?: string
    city: string
    province?: string
    postalCode?: string
    country?: string
    address?: string
    lat: number
    lng: number
  }
  schedule: {
    date: Date
    startTime: string // "09:00"
    endTime: string   // "13:00"
    durationHours: number
  }
  capacity: number
  estimatedDurationMinutes: number // NGO-specified expected duration; credits = floor(actual_minutes)
  totalCreditsPool: number         // pre-calculated: estimatedDurationMinutes × capacity
  applicationDeadline?: Date
  // Counts (denormalized)
  applicationCount: number
  confirmedCount: number
  createdAt: Date
  updatedAt: Date
}

const OpportunitySchema = new Schema<IOpportunity>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 3000 },
    status: {
      type: String,
      enum: ["draft", "open", "in_progress", "completed", "cancelled"],
      default: "draft",
    },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    location: {
      street: String,
      city: { type: String, required: true },
      province: String,
      postalCode: String,
      country: String,
      address: String,
      lat: { type: Number, required: true, default: 0 },
      lng: { type: Number, required: true, default: 0 },
    },
    schedule: {
      date: { type: Date, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      durationHours: { type: Number, required: true },
    },
    capacity: { type: Number, required: true, min: 1 },
    estimatedDurationMinutes: { type: Number, required: true, min: 1 },
    totalCreditsPool: { type: Number, required: true },
    applicationDeadline: Date,
    applicationCount: { type: Number, default: 0 },
    confirmedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

OpportunitySchema.index({ status: 1, "schedule.date": 1 })
OpportunitySchema.index({ "location.lat": 1, "location.lng": 1 })
OpportunitySchema.index({ skills: 1 })
OpportunitySchema.index({ interests: 1 })

export const OpportunityModel =
  mongoose.models.Opportunity ??
  mongoose.model<IOpportunity>("Opportunity", OpportunitySchema)
