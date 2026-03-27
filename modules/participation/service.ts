import crypto from "crypto"
import mongoose from "mongoose"
import { connectToDatabase } from "@/lib/db/mongoose"
import { ParticipationModel } from "@/lib/db/models/participation.model"
import { QRTokenModel } from "@/lib/db/models/qr_token.model"
import { ApplicationModel } from "@/lib/db/models/application.model"
import { awardMissionCredits } from "@/modules/ledger/service"

const QR_EXPIRY_MINUTES = parseInt(process.env.QR_TOKEN_EXPIRY_MINUTES ?? "10", 10)

export async function generateQRToken(params: {
  opportunityId: string
  type: "check_in" | "check_out"
  participationId?: string
}): Promise<{ token: string; expiresAt: Date }> {
  await connectToDatabase()
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + QR_EXPIRY_MINUTES * 60 * 1000)
  await QRTokenModel.create({
    token,
    type: params.type,
    opportunityId: new mongoose.Types.ObjectId(params.opportunityId),
    participationId: params.participationId
      ? new mongoose.Types.ObjectId(params.participationId)
      : undefined,
    expiresAt,
  })
  return { token, expiresAt }
}

export async function checkIn(params: {
  token: string
  userId: string
}): Promise<{ success: true; participationId: string } | { success: false; error: string }> {
  await connectToDatabase()

  const qr = await QRTokenModel.findOne({ token: params.token, type: "check_in", usedAt: null })
  if (!qr) return { success: false, error: "Invalid or expired QR code." }
  if (qr.expiresAt < new Date()) return { success: false, error: "QR code has expired." }

  const application = await ApplicationModel.findOne({
    opportunityId: qr.opportunityId,
    userId: new mongoose.Types.ObjectId(params.userId),
    status: "accepted",
  })
  if (!application) return { success: false, error: "No accepted application found." }

  // Mark QR as used
  qr.usedAt = new Date()
  await qr.save()

  const participation = await ParticipationModel.findOneAndUpdate(
    { applicationId: application._id },
    {
      opportunityId: qr.opportunityId,
      userId: new mongoose.Types.ObjectId(params.userId),
      status: "checked_in",
      checkInAt: new Date(),
      checkInQrToken: params.token,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  return { success: true, participationId: participation!._id.toString() }
}

export async function checkOut(params: {
  token: string
  userId: string
  userRole: string
}): Promise<{ success: true; creditsAwarded: number } | { success: false; error: string }> {
  await connectToDatabase()

  const qr = await QRTokenModel.findOne({ token: params.token, type: "check_out", usedAt: null })
  if (!qr) return { success: false, error: "Invalid or expired QR code." }
  if (qr.expiresAt < new Date()) return { success: false, error: "QR code has expired." }

  const participation = await ParticipationModel.findOne({
    opportunityId: qr.opportunityId,
    userId: new mongoose.Types.ObjectId(params.userId),
    status: "checked_in",
  })
  if (!participation) return { success: false, error: "No active check-in found." }

  const checkOutAt = new Date()
  const actualMinutes = Math.max(
    0,
    Math.floor((checkOutAt.getTime() - (participation.checkInAt?.getTime() ?? 0)) / 60000)
  )
  // Platform formula: credits = floor(actual_minutes) — 1 credit per minute
  const creditsAwarded = actualMinutes

  const { OpportunityModel } = await import("@/lib/db/models/opportunity.model")
  const opp = await OpportunityModel.findById(qr.opportunityId)
  // actualHours stored for stats display (derived from actual minutes)
  const actualHours = actualMinutes / 60

  // Mark QR used
  qr.usedAt = checkOutAt
  await qr.save()

  // Update participation
  participation.status = "completed"
  participation.checkOutAt = checkOutAt
  participation.actualHours = actualHours
  participation.creditsAwarded = creditsAwarded
  participation.checkOutQrToken = params.token
  await participation.save()

  // Award mission credits — enforces volunteer-only rule
  if (creditsAwarded > 0) {
    awardMissionCredits({
      userId: params.userId,
      userRole: params.userRole,
      amount: creditsAwarded,
      referenceId: participation._id.toString(),
      description: `Credits earned from mission: ${opp?.title ?? "Mission"}`,
    }).catch(console.error)
  }

  // Update application status
  ApplicationModel.findByIdAndUpdate(participation.applicationId, { status: "attended" }).catch(
    console.error
  )

  return { success: true, creditsAwarded }
}

export async function getMyParticipations(userId: string) {
  await connectToDatabase()
  const docs = await ParticipationModel.find({
    userId: new mongoose.Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 })
    .populate("opportunityId", "title schedule location")
    .lean()
  return docs
}
