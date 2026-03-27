import mongoose, { Schema, type Document } from "mongoose"

export type VaultDocumentType =
  | "org_registration"
  | "org_logo"
  | "opportunity_brief"
  | "volunteer_id"
  | "other"

export type ProcessingStatus = "pending" | "processing" | "done" | "failed"

export interface IVaultDocument extends Document {
  ownerId: mongoose.Types.ObjectId // org or user
  ownerType: "organization" | "user"
  type: VaultDocumentType
  fileName: string
  mimeType: string
  sizeBytes: number
  r2Key: string // Cloudflare R2 object key
  processingStatus: ProcessingStatus
  extractedData?: Record<string, unknown>
  uploadedBy: mongoose.Types.ObjectId // userId
  createdAt: Date
  updatedAt: Date
}

const VaultDocumentSchema = new Schema<IVaultDocument>(
  {
    ownerId: { type: Schema.Types.ObjectId, required: true, index: true },
    ownerType: { type: String, enum: ["organization", "user"], required: true },
    type: {
      type: String,
      enum: ["org_registration", "org_logo", "opportunity_brief", "volunteer_id", "other"],
      required: true,
    },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    r2Key: { type: String, required: true, unique: true },
    processingStatus: {
      type: String,
      enum: ["pending", "processing", "done", "failed"],
      default: "pending",
    },
    extractedData: Schema.Types.Mixed,
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
)

export const VaultDocumentModel =
  mongoose.models.VaultDocument ??
  mongoose.model<IVaultDocument>("VaultDocument", VaultDocumentSchema)
