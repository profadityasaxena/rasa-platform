/**
 * RASA MVP Full Seed Script
 * Creates all test accounts (8 roles), sample organisations, missions, and marketplace offers.
 *
 * Run with:  npm run seed
 *
 * Requires MONGODB_URI (or MONGODB_URI_DEBUG) to be set in .env
 * Seeds into MONGODB_URI_DEBUG if set, otherwise MONGODB_URI.
 */

import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import path from "path"
import { SEED_ACCOUNTS, SEED_PASSWORD } from "../../lib/debug/seed-accounts"

dotenv.config({ path: path.resolve(process.cwd(), ".env") })

const MONGODB_URI = process.env.MONGODB_URI_DEBUG ?? process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI not set in .env — cannot seed.")
  process.exit(1)
}

// ── Inline schemas (avoids app-level imports) ─────────────────────────────────

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    emailVerified: { type: Date, default: null },
    name: String,
    role: {
      type: String,
      enum: [
        "volunteer", "ngo_admin", "field_rep", "reward_partner",
        "platform_admin", "platform_moderator", "platform_support", "platform_analyst",
      ],
      default: "volunteer",
    },
    status: { type: String, enum: ["active", "suspended", "pending_verification"], default: "active" },
    deletedAt: Date,
  },
  { timestamps: true, collection: "users" }
)

const PasswordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    hash: { type: String, required: true },
  },
  { timestamps: true, collection: "passwords" }
)

const OrganizationSchema = new mongoose.Schema(
  {
    name: String,
    type: String,
    status: { type: String, default: "active" },
    description: String,
    adminUserIds: [mongoose.Schema.Types.ObjectId],
    location: { city: String, lat: Number, lng: Number },
  },
  { timestamps: true }
)

const OpportunitySchema = new mongoose.Schema(
  {
    organizationId: mongoose.Schema.Types.ObjectId,
    title: String,
    description: String,
    status: { type: String, default: "open" },
    skills: [String],
    interests: [String],
    location: { city: String, address: String, lat: Number, lng: Number },
    schedule: { date: Date, startTime: String, endTime: String, durationHours: Number },
    capacity: Number,
    estimatedDurationMinutes: Number,
    totalCreditsPool: Number,
    applicationCount: { type: Number, default: 0 },
    confirmedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const VolunteerSchema = new mongoose.Schema(
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

const WalletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, unique: true },
    balance: { type: Number, default: 0 },
    dailyTransferTotal: { type: Number, default: 0 },
    dailyTransferDate: { type: String, default: "" },
  },
  { timestamps: true }
)

const OfferSchema = new mongoose.Schema(
  {
    organizationId: mongoose.Schema.Types.ObjectId,
    title: String,
    description: String,
    creditCost: Number,
    stock: Number,
    status: { type: String, default: "active" },
    redemptionCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// ── Seed ──────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGODB_URI!)
  console.log(`\n🔗 Connected to: ${MONGODB_URI!.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")}`)

  const UserModel       = mongoose.models.User        ?? mongoose.model("User", UserSchema)
  const PasswordModel   = mongoose.models.Password    ?? mongoose.model("Password", PasswordSchema)
  const OrgModel        = mongoose.models.Organization ?? mongoose.model("Organization", OrganizationSchema)
  const OppModel        = mongoose.models.Opportunity  ?? mongoose.model("Opportunity", OpportunitySchema)
  const VolModel        = mongoose.models.Volunteer    ?? mongoose.model("Volunteer", VolunteerSchema)
  const WalletModel     = mongoose.models.Wallet       ?? mongoose.model("Wallet", WalletSchema)
  const OfferModel      = mongoose.models.MarketplaceOffer ?? mongoose.model("MarketplaceOffer", OfferSchema)

  // ── 1. Delete all existing seed accounts ────────────────────────────────────
  console.log("\n🧹 Clearing existing seed data…")
  const seedEmails = SEED_ACCOUNTS.map((a) => a.email)

  for (const email of seedEmails) {
    const u = await UserModel.findOneAndDelete({ email })
    if (u) {
      await PasswordModel.deleteMany({ userId: u._id })
      await VolModel.deleteMany({ userId: u._id })
      await WalletModel.deleteMany({ userId: u._id })
    }
  }

  // ── 2. Create all 8 role accounts ───────────────────────────────────────────
  console.log("\n👤 Creating seed accounts…")
  const hash = await bcrypt.hash(SEED_PASSWORD, 10)
  const createdUsers: Record<string, mongoose.Document & { _id: mongoose.Types.ObjectId }> = {}

  for (const account of SEED_ACCOUNTS) {
    const user = await UserModel.create({
      email: account.email,
      name: account.name,
      role: account.role,
      status: "active",
      emailVerified: new Date(),
    })
    await PasswordModel.create({ userId: user._id, hash })
    await WalletModel.create({ userId: user._id, balance: account.walletBalance })
    createdUsers[account.role] = user as mongoose.Document & { _id: mongoose.Types.ObjectId }
    console.log(`  ✓  ${account.email.padEnd(28)} → ${account.role}`)
  }

  // ── 3. Volunteer profile for volunteer@rasa.dev ──────────────────────────────
  const volunteerUser = createdUsers["volunteer"]
  if (volunteerUser) {
    await VolModel.create({
      userId: volunteerUser._id,
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
    })
  }

  // ── 4. Organisations ─────────────────────────────────────────────────────────
  console.log("\n🏛  Creating organisations…")

  const ngoUser = createdUsers["ngo_admin"]
  const partnerUser = createdUsers["reward_partner"]
  const fieldRepUser = createdUsers["field_rep"]

  const org = await OrgModel.create({
    name: "Lisbon Community Foundation",
    type: "ngo",
    status: "active",
    description: "Supporting community initiatives across Lisbon.",
    adminUserIds: ngoUser ? [ngoUser._id, fieldRepUser?._id].filter(Boolean) : [],
    location: { city: "Lisbon", lat: 38.7169, lng: -9.1399 },
  })
  console.log(`  ✓  ${org.name} (NGO)`)

  const partnerOrg = await OrgModel.create({
    name: "Café Verde",
    type: "reward_partner",
    status: "active",
    description: "Sustainable café in Lisbon with a commitment to community.",
    adminUserIds: partnerUser ? [partnerUser._id] : [],
  })
  console.log(`  ✓  ${partnerOrg.name} (Reward Partner)`)

  // ── 5. Opportunities ─────────────────────────────────────────────────────────
  console.log("\n📋  Creating missions…")

  const d3 = new Date(); d3.setDate(d3.getDate() + 3)
  const d7 = new Date(); d7.setDate(d7.getDate() + 7)
  const d14 = new Date(); d14.setDate(d14.getDate() + 14)

  const opportunities = await OppModel.insertMany([
    {
      organizationId: org._id,
      title: "Beach Clean-Up in Cascais",
      description: "Join us for a morning beach clean-up. Gloves and bags provided. Help keep our coast beautiful.",
      status: "open",
      skills: ["First Aid"],
      interests: ["Environment", "Community"],
      location: { city: "Cascais", address: "Praia de Cascais", lat: 38.6973, lng: -9.4222 },
      schedule: { date: d3, startTime: "09:00", endTime: "13:00", durationHours: 4 },
      capacity: 30,
      estimatedDurationMinutes: 240,  // 4 hours = 240 credits per volunteer
      totalCreditsPool: 30 * 240,
    },
    {
      organizationId: org._id,
      title: "After-School Tutoring Programme",
      description: "Help primary school students with reading and maths. Suitable for teachers and university students.",
      status: "open",
      skills: ["Teaching", "Mentoring"],
      interests: ["Education", "Youth Support"],
      location: { city: "Lisbon", address: "Av. Almirante Reis", lat: 38.7223, lng: -9.1354 },
      schedule: { date: d7, startTime: "15:00", endTime: "18:00", durationHours: 3 },
      capacity: 10,
      estimatedDurationMinutes: 180,  // 3 hours = 180 credits per volunteer
      totalCreditsPool: 10 * 180,
    },
    {
      organizationId: org._id,
      title: "Community Garden Day",
      description: "Help plant seasonal vegetables and maintain the community garden. No experience needed.",
      status: "open",
      skills: ["Carpentry"],
      interests: ["Environment", "Community"],
      location: { city: "Lisbon", address: "Parque das Nações", lat: 38.7641, lng: -9.0952 },
      schedule: { date: d14, startTime: "10:00", endTime: "14:00", durationHours: 4 },
      capacity: 20,
      estimatedDurationMinutes: 240,  // 4 hours = 240 credits per volunteer
      totalCreditsPool: 20 * 240,
    },
  ])
  opportunities.forEach((o: { title: string }) => console.log(`  ✓  ${o.title}`))

  // ── 6. Marketplace offers ─────────────────────────────────────────────────────
  console.log("\n🛍  Creating marketplace offers…")

  const offers = await OfferModel.insertMany([
    {
      organizationId: partnerOrg._id,
      title: "Free Coffee at Café Verde",
      description: "Redeem for a free specialty coffee of your choice at any Café Verde location.",
      creditCost: 30,
      stock: 100,
      status: "active",
    },
    {
      organizationId: partnerOrg._id,
      title: "10% off your next purchase",
      description: "10% discount on your entire order at Café Verde. Valid for 30 days.",
      creditCost: 20,
      status: "active",
    },
    {
      organizationId: partnerOrg._id,
      title: "Reusable Tote Bag",
      description: "Claim a Café Verde branded organic cotton tote bag.",
      creditCost: 50,
      stock: 25,
      status: "active",
    },
  ])
  offers.forEach((o: { title: string }) => console.log(`  ✓  ${o.title}`))

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(58))
  console.log("✅  Seed complete!\n")
  console.log("Test accounts (all password: Rasa1234!)")
  console.log("─".repeat(58))

  for (const account of SEED_ACCOUNTS) {
    console.log(
      `  ${account.email.padEnd(30)} ${account.role.padEnd(22)} ${
        account.walletBalance > 0 ? `(${account.walletBalance} credits)` : ""
      }`
    )
  }
  console.log("─".repeat(58))
  console.log()

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error("\n❌  Seed failed:", err.message)
  process.exit(1)
})
