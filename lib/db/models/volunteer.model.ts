import mongoose, { Schema, type Document } from "mongoose"

export interface IVolunteer extends Document {
  userId: mongoose.Types.ObjectId
  // Completeness fields (7 required)
  bio?: string
  skills: string[]
  interests: string[]
  location?: {
    street?: string
    city: string
    province?: string
    postalCode?: string
    country?: string
    lat: number
    lng: number
  }
  availability: { day: string; start: string; end: string }[]
  languages: string[]
  profilePhotoUrl?: string
  // Computed
  completenessScore: number
  // Stats (denormalized for perf)
  totalHours: number
  totalCredits: number
  createdAt: Date
  updatedAt: Date
}

const AvailabilitySchema = new Schema(
  {
    day: { type: String, enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] },
    start: String, // "09:00"
    end: String,   // "17:00"
  },
  { _id: false }
)

const VolunteerSchema = new Schema<IVolunteer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    bio: { type: String, maxlength: 500 },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    location: {
      street: String,
      city: { type: String },
      province: String,
      postalCode: String,
      country: String,
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    availability: { type: [AvailabilitySchema], default: [] },
    languages: { type: [String], default: [] },
    profilePhotoUrl: String,
    completenessScore: { type: Number, default: 0, min: 0, max: 100 },
    totalHours: { type: Number, default: 0 },
    totalCredits: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// 2dsphere index for geo queries
VolunteerSchema.index({ "location.lat": 1, "location.lng": 1 })

export const VolunteerModel =
  mongoose.models.Volunteer ?? mongoose.model<IVolunteer>("Volunteer", VolunteerSchema)
