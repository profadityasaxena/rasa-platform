import mongoose, { Schema, Document, Model } from "mongoose"

// Separate collection to store hashed passwords
// Never stored on the user document directly
export interface IPassword extends Document {
  userId: mongoose.Types.ObjectId
  hash: string
  createdAt: Date
  updatedAt: Date
}

const PasswordSchema = new Schema<IPassword>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    hash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "passwords",
  }
)

PasswordSchema.index({ userId: 1 }, { unique: true })

const Password: Model<IPassword> =
  mongoose.models.Password || mongoose.model<IPassword>("Password", PasswordSchema)

export default Password
