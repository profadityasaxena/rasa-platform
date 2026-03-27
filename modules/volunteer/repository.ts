import { connectToDatabase } from "@/lib/db/mongoose"
import { VolunteerModel } from "@/lib/db/models/volunteer.model"
import type { UpdateVolunteerProfileInput, VolunteerProfile } from "./types"

function toDTO(doc: InstanceType<typeof VolunteerModel>): VolunteerProfile {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    bio: doc.bio,
    skills: doc.skills,
    interests: doc.interests,
    location: doc.location,
    availability: doc.availability,
    languages: doc.languages,
    profilePhotoUrl: doc.profilePhotoUrl,
    completenessScore: doc.completenessScore,
    totalHours: doc.totalHours,
    totalCredits: doc.totalCredits,
  }
}

function calcCompleteness(doc: Partial<InstanceType<typeof VolunteerModel>>): number {
  // 7 required fields, each worth ~14 points (total ~100)
  const checks = [
    !!doc.bio,
    (doc.skills?.length ?? 0) > 0,
    (doc.interests?.length ?? 0) > 0,
    !!doc.location,
    (doc.availability?.length ?? 0) > 0,
    (doc.languages?.length ?? 0) > 0,
    !!doc.profilePhotoUrl,
  ]
  return Math.round((checks.filter(Boolean).length / 7) * 100)
}

export async function findVolunteerByUserId(userId: string): Promise<VolunteerProfile | null> {
  await connectToDatabase()
  const doc = await VolunteerModel.findOne({ userId })
  return doc ? toDTO(doc) : null
}

export async function findVolunteerById(id: string): Promise<VolunteerProfile | null> {
  await connectToDatabase()
  const doc = await VolunteerModel.findById(id)
  return doc ? toDTO(doc) : null
}

export async function upsertVolunteerProfile(
  userId: string,
  input: UpdateVolunteerProfileInput
): Promise<VolunteerProfile> {
  await connectToDatabase()
  const existing = await VolunteerModel.findOne({ userId })
  const merged = { ...(existing?.toObject() ?? {}), ...input }
  const completenessScore = calcCompleteness(merged)

  const doc = await VolunteerModel.findOneAndUpdate(
    { userId },
    { ...input, completenessScore },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )
  return toDTO(doc!)
}
