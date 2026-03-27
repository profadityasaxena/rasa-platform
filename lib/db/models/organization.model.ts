import mongoose, { Schema, type Document } from "mongoose"

export type OrgType =
  | "ngo"
  | "corporation"
  | "government"
  | "university"
  | "marketplace_partner"

export type OrgStatus = "pending_approval" | "active" | "suspended"

export interface IOrganization extends Document {
  name: string
  type: OrgType
  status: OrgStatus
  description?: string
  mission?: string
  logoUrl?: string
  website?: string
  contactEmail?: string
  contactPhone?: string
  headquarters?: {
    street?: string
    city: string
    province?: string
    postalCode?: string
    country?: string
    lat?: number
    lng?: number
  }
  focusAreas?: string[]
  sdgAlignment?: string[]
  verificationStatus?: "unverified" | "verified" | "rejected"
  adminUserIds: mongoose.Types.ObjectId[]
  // AI-extracted fields (from document vault)
  extractedData?: {
    registrationNumber?: string
    legalName?: string
    taxId?: string
    verifiedAt?: Date
  }
  createdAt: Date
  updatedAt: Date
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["ngo", "corporation", "government", "university", "marketplace_partner"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending_approval", "active", "suspended"],
      default: "pending_approval",
    },
    description: { type: String, maxlength: 1000 },
    mission: { type: String, maxlength: 1000 },
    logoUrl: String,
    website: String,
    contactEmail: { type: String, lowercase: true, trim: true },
    contactPhone: String,
    headquarters: {
      street: String,
      city: String,
      province: String,
      postalCode: String,
      country: String,
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    focusAreas: [String],
    sdgAlignment: [String],
    verificationStatus: {
      type: String,
      enum: ["unverified", "verified", "rejected"],
      default: "unverified",
    },
    adminUserIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    extractedData: {
      registrationNumber: String,
      legalName: String,
      taxId: String,
      verifiedAt: Date,
    },
  },
  { timestamps: true }
)

OrganizationSchema.index({ type: 1, status: 1 })

export const OrganizationModel =
  mongoose.models.Organization ??
  mongoose.model<IOrganization>("Organization", OrganizationSchema)
