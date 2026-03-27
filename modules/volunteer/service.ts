import { findVolunteerByUserId, upsertVolunteerProfile } from "./repository"
import type { VolunteerProfile, UpdateVolunteerProfileInput } from "./types"

export async function getMyProfile(userId: string): Promise<VolunteerProfile | null> {
  return findVolunteerByUserId(userId)
}

export async function updateMyProfile(
  userId: string,
  input: UpdateVolunteerProfileInput
): Promise<VolunteerProfile> {
  return upsertVolunteerProfile(userId, input)
}
