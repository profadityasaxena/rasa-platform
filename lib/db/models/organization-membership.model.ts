import mongoose, { Schema, type Document } from "mongoose"

export type OrgMemberRole =
  | "admin"
  | "manager"
  | "field_rep"
  | "operator"
  | "member"

export type OrgMemberStatus = "active" | "invited" | "suspended"

export interface IOrganizationMembership extends Document {
  organizationId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  orgRole: OrgMemberRole
  status: OrgMemberStatus
  invitedByUserId?: mongoose.Types.ObjectId
  joinedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const OrganizationMembershipSchema = new Schema<IOrganizationMembership>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orgRole: {
      type: String,
      enum: ["admin", "manager", "field_rep", "operator", "member"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "invited", "suspended"],
      default: "active",
    },
    invitedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    joinedAt: Date,
  },
  { timestamps: true }
)

OrganizationMembershipSchema.index({ organizationId: 1 })
OrganizationMembershipSchema.index({ userId: 1 })
OrganizationMembershipSchema.index({ organizationId: 1, userId: 1 }, { unique: true })

export const OrganizationMembershipModel =
  mongoose.models.OrganizationMembership ??
  mongoose.model<IOrganizationMembership>("OrganizationMembership", OrganizationMembershipSchema)
