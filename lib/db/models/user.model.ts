import mongoose, { Schema, Document, Model } from "mongoose"

export type UserRole =
  | "volunteer"
  | "ngo_admin"
  | "field_rep"
  | "reward_partner"
  | "platform_admin"
  | "platform_moderator"
  | "platform_support"
  | "platform_analyst"
export type UserStatus = "active" | "suspended" | "pending_verification"

export interface IUser extends Document {
  email: string
  emailVerified: Date | null
  name?: string
  image?: string
  role: UserRole
  status: UserStatus
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    name: {
      type: String,
      trim: true,
    },
    image: String,
    role: {
      type: String,
      enum: [
        "volunteer",
        "ngo_admin",
        "field_rep",
        "reward_partner",
        "platform_admin",
        "platform_moderator",
        "platform_support",
        "platform_analyst",
      ],
      default: "volunteer",
    },
    status: {
      type: String,
      enum: ["active", "suspended", "pending_verification"],
      default: "pending_verification",
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
    collection: "users",
  }
)

UserSchema.index({ email: 1 }, { unique: true })
UserSchema.index({ role: 1 })
UserSchema.index({ status: 1 })

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
