/**
 * Auto-seeder — runs at server startup when DEBUG_MODE=true.
 * Called from instrumentation.ts.
 *
 * Only seeds if seed accounts do not yet exist in the database.
 * Safe to call multiple times (idempotent).
 */

import { isDebugMode } from "./guard"
import { SEED_ACCOUNTS, SEED_PASSWORD } from "./seed-accounts"

export async function autoSeedDebugAccounts(): Promise<void> {
  if (!isDebugMode) return

  // Dynamic imports — only loaded in debug mode
  const mongoose = (await import("mongoose")).default
  const bcrypt = (await import("bcryptjs")).default

  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.warn("[auto-seed] MONGODB_URI not set — skipping seed.")
    return
  }

  // Connect if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, { bufferCommands: false })
  }

  // Inline model definitions (avoids circular imports from app models)
  const UserModel =
    mongoose.models.User ??
    mongoose.model(
      "User",
      new mongoose.Schema(
        {
          email: { type: String, required: true, unique: true, lowercase: true },
          emailVerified: { type: Date, default: null },
          name: String,
          role: { type: String, default: "volunteer" },
          status: { type: String, default: "active" },
          deletedAt: Date,
        },
        { timestamps: true, collection: "users" }
      )
    )

  const PasswordModel =
    mongoose.models.Password ??
    mongoose.model(
      "Password",
      new mongoose.Schema(
        {
          userId: { type: mongoose.Schema.Types.ObjectId, required: true },
          hash: { type: String, required: true },
        },
        { timestamps: true, collection: "passwords" }
      )
    )

  const WalletModel =
    mongoose.models.Wallet ??
    mongoose.model(
      "Wallet",
      new mongoose.Schema(
        {
          userId: { type: mongoose.Schema.Types.ObjectId, unique: true },
          balance: { type: Number, default: 0 },
          dailyTransferTotal: { type: Number, default: 0 },
          dailyTransferDate: { type: String, default: "" },
        },
        { timestamps: true }
      )
    )

  let seeded = 0
  const hash = await bcrypt.hash(SEED_PASSWORD, 10) // 10 rounds for dev speed

  for (const account of SEED_ACCOUNTS) {
    const exists = await UserModel.findOne({ email: account.email })
    if (exists) continue

    const user = await UserModel.create({
      email: account.email,
      name: account.name,
      role: account.role,
      status: "active",
      emailVerified: new Date(),
    })

    await PasswordModel.create({ userId: user._id, hash })
    await WalletModel.findOneAndUpdate(
      { userId: user._id },
      { balance: account.walletBalance },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    )

    seeded++
  }

  if (seeded > 0) {
    console.log(`[auto-seed] ✅ Created ${seeded} debug account(s). Password: ${SEED_PASSWORD}`)
  } else {
    console.log("[auto-seed] ✓ Debug accounts already present.")
  }

  // Also seed volunteer profile for volunteer@rasa.dev if missing
  const VolModel =
    mongoose.models.Volunteer ??
    mongoose.model(
      "Volunteer",
      new mongoose.Schema(
        {
          userId: { type: mongoose.Schema.Types.ObjectId, unique: true },
          bio: String,
          skills: [String],
          interests: [String],
          location: { city: String, lat: Number, lng: Number },
          availability: [{ day: String, start: String, end: String }],
          languages: [String],
          completenessScore: { type: Number, default: 100 },
          totalHours: { type: Number, default: 0 },
          totalCredits: { type: Number, default: 0 },
        },
        { timestamps: true }
      )
    )

  const volunteerUser = await UserModel.findOne({ email: "volunteer@rasa.dev" })
  if (volunteerUser) {
    await VolModel.findOneAndUpdate(
      { userId: volunteerUser._id },
      {
        bio: "Passionate about community development and environmental causes.",
        skills: ["Teaching", "First Aid", "Photography"],
        interests: ["Education", "Environment", "Community"],
        location: { city: "Lisbon", lat: 38.7169, lng: -9.1399 },
        availability: [
          { day: "sat", start: "09:00", end: "18:00" },
          { day: "sun", start: "10:00", end: "17:00" },
        ],
        languages: ["Portuguese", "English"],
        completenessScore: 100,
        totalHours: 12,
        totalCredits: 150,
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    )
  }
}
