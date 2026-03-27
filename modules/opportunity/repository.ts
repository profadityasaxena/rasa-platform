import mongoose from "mongoose"
import { connectToDatabase } from "@/lib/db/mongoose"
import { OpportunityModel } from "@/lib/db/models/opportunity.model"
import type { CreateOpportunityInput, OpportunityDTO, UpdateOpportunityInput } from "./types"

function calcDuration(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number)
  const [eh, em] = endTime.split(":").map(Number)
  return Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60)
}

function toDTO(doc: InstanceType<typeof OpportunityModel>): OpportunityDTO {
  return {
    id: doc._id.toString(),
    organizationId: doc.organizationId.toString(),
    title: doc.title,
    description: doc.description,
    status: doc.status,
    skills: doc.skills,
    interests: doc.interests,
    location: doc.location,
    schedule: {
      date: doc.schedule.date.toISOString().split("T")[0],
      startTime: doc.schedule.startTime,
      endTime: doc.schedule.endTime,
      durationHours: doc.schedule.durationHours,
    },
    capacity: doc.capacity,
    estimatedDurationMinutes: doc.estimatedDurationMinutes,
    totalCreditsPool: doc.totalCreditsPool,
    applicationDeadline: doc.applicationDeadline?.toISOString(),
    applicationCount: doc.applicationCount,
    confirmedCount: doc.confirmedCount,
    createdAt: doc.createdAt.toISOString(),
  }
}

export async function createOpportunity(input: CreateOpportunityInput): Promise<OpportunityDTO> {
  await connectToDatabase()
  const durationHours = calcDuration(input.schedule.startTime, input.schedule.endTime)
  // totalCreditsPool = estimated minutes × volunteers (each volunteer earns 1 credit/minute)
  const totalCreditsPool = input.estimatedDurationMinutes * input.capacity
  const doc = await OpportunityModel.create({
    ...input,
    organizationId: new mongoose.Types.ObjectId(input.organizationId),
    schedule: {
      ...input.schedule,
      date: new Date(input.schedule.date),
      durationHours,
    },
    totalCreditsPool,
    applicationDeadline: input.applicationDeadline ? new Date(input.applicationDeadline) : undefined,
  })
  return toDTO(doc)
}

export async function findOpportunityById(id: string): Promise<OpportunityDTO | null> {
  await connectToDatabase()
  const doc = await OpportunityModel.findById(id)
  return doc ? toDTO(doc) : null
}

export async function findOpportunitiesByOrg(orgId: string): Promise<OpportunityDTO[]> {
  await connectToDatabase()
  const docs = await OpportunityModel.find({ organizationId: new mongoose.Types.ObjectId(orgId) }).sort({ createdAt: -1 })
  return docs.map(toDTO)
}

export async function listOpenOpportunities(filters?: {
  city?: string
  skills?: string[]
  page?: number
  limit?: number
}): Promise<OpportunityDTO[]> {
  await connectToDatabase()
  const query: Record<string, unknown> = { status: "open" }
  if (filters?.city) query["location.city"] = new RegExp(filters.city, "i")
  if (filters?.skills?.length) query.skills = { $in: filters.skills }
  const page = filters?.page ?? 1
  const limit = filters?.limit ?? 20
  const docs = await OpportunityModel.find(query)
    .sort({ "schedule.date": 1 })
    .skip((page - 1) * limit)
    .limit(limit)
  return docs.map(toDTO)
}

export async function updateOpportunity(
  id: string,
  input: UpdateOpportunityInput
): Promise<OpportunityDTO | null> {
  await connectToDatabase()
  const update: Record<string, unknown> = { ...input }
  if (input.schedule) {
    const durationHours = calcDuration(input.schedule.startTime, input.schedule.endTime)
    update["schedule.durationHours"] = durationHours
    update["schedule.date"] = new Date(input.schedule.date)
  }
  const doc = await OpportunityModel.findByIdAndUpdate(id, update, { new: true })
  return doc ? toDTO(doc) : null
}

export async function incrementApplicationCount(id: string): Promise<void> {
  await connectToDatabase()
  await OpportunityModel.findByIdAndUpdate(id, { $inc: { applicationCount: 1 } })
}
