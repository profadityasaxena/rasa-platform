import mongoose from "mongoose"
import { connectToDatabase } from "@/lib/db/mongoose"
import { ApplicationModel } from "@/lib/db/models/application.model"
import type { ApplicationDTO, ReviewApplicationInput } from "./types"

function toDTO(doc: InstanceType<typeof ApplicationModel>): ApplicationDTO {
  return {
    id: doc._id.toString(),
    opportunityId: doc.opportunityId.toString(),
    volunteerId: doc.volunteerId.toString(),
    userId: doc.userId.toString(),
    status: doc.status,
    matchScore: doc.matchScore,
    scoreBreakdown: doc.scoreBreakdown,
    motivation: doc.motivation,
    reapplicationAllowed: doc.reapplicationAllowed,
    createdAt: doc.createdAt.toISOString(),
  }
}

export async function createApplication(params: {
  opportunityId: string
  volunteerId: string
  userId: string
  matchScore: number
  scoreBreakdown: ApplicationDTO["scoreBreakdown"]
  motivation?: string
}): Promise<ApplicationDTO> {
  await connectToDatabase()
  const doc = await ApplicationModel.create({
    opportunityId: new mongoose.Types.ObjectId(params.opportunityId),
    volunteerId: new mongoose.Types.ObjectId(params.volunteerId),
    userId: new mongoose.Types.ObjectId(params.userId),
    matchScore: params.matchScore,
    scoreBreakdown: params.scoreBreakdown,
    motivation: params.motivation,
  })
  return toDTO(doc)
}

export async function findApplicationByUserAndOpportunity(
  userId: string,
  opportunityId: string
): Promise<ApplicationDTO | null> {
  await connectToDatabase()
  const doc = await ApplicationModel.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    opportunityId: new mongoose.Types.ObjectId(opportunityId),
  })
  return doc ? toDTO(doc) : null
}

export async function findApplicationsByUser(userId: string): Promise<ApplicationDTO[]> {
  await connectToDatabase()
  const docs = await ApplicationModel.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 })
  return docs.map(toDTO)
}

export async function findApplicationsByOpportunity(opportunityId: string): Promise<ApplicationDTO[]> {
  await connectToDatabase()
  const docs = await ApplicationModel.find({
    opportunityId: new mongoose.Types.ObjectId(opportunityId),
  }).sort({ matchScore: -1 })
  return docs.map(toDTO)
}

export async function updateApplicationStatus(
  id: string,
  reviewedBy: string,
  input: ReviewApplicationInput
): Promise<ApplicationDTO | null> {
  await connectToDatabase()
  const doc = await ApplicationModel.findByIdAndUpdate(
    id,
    {
      status: input.status,
      reviewedBy: new mongoose.Types.ObjectId(reviewedBy),
      reviewedAt: new Date(),
      ...(input.reapplicationAllowed !== undefined && {
        reapplicationAllowed: input.reapplicationAllowed,
      }),
    },
    { new: true }
  )
  return doc ? toDTO(doc) : null
}

export async function withdrawApplication(id: string, userId: string): Promise<boolean> {
  await connectToDatabase()
  const result = await ApplicationModel.updateOne(
    { _id: new mongoose.Types.ObjectId(id), userId: new mongoose.Types.ObjectId(userId), status: "pending" },
    { status: "withdrawn" }
  )
  return result.modifiedCount > 0
}
