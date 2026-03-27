import mongoose, { Schema, type Document } from "mongoose"
import type { OrgType } from "./organization.model"

export type OrgRequestStatus = "pending" | "approved" | "rejected"

export interface IOrganizationRequest extends Document {
  organizationType: OrgType
  name: string
  description?: string
  mission?: string
  website?: string
  contactName: string
  contactEmail: string
  contactPhone?: string
  headquartersCity?: string
  headquartersCountry?: string
  purposeStatement?: string
  status: OrgRequestStatus
  reviewedByUserId?: mongoose.Types.ObjectId
  reviewedAt?: Date
  reviewNotes?: string
  // Set after approval — points to the created organization
  createdOrganizationId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const OrganizationRequestSchema = new Schema<IOrganizationRequest>(
  {
    organizationType: {
      type: String,
      enum: ["ngo", "corporation", "government", "university", "marketplace_partner"],
      required: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    mission: { type: String, maxlength: 1000 },
    website: String,
    contactName: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    contactPhone: String,
    headquartersCity: String,
    headquartersCountry: String,
    purposeStatement: { type: String, maxlength: 2000 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    reviewNotes: String,
    createdOrganizationId: { type: Schema.Types.ObjectId, ref: "Organization" },
  },
  { timestamps: true }
)

OrganizationRequestSchema.index({ status: 1 })
OrganizationRequestSchema.index({ contactEmail: 1 })

export const OrganizationRequestModel =
  mongoose.models.OrganizationRequest ??
  mongoose.model<IOrganizationRequest>("OrganizationRequest", OrganizationRequestSchema)
