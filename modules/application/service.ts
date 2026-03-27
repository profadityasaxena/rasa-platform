import { findVolunteerByUserId } from "@/modules/volunteer/repository"
import { findOpportunityById, incrementApplicationCount } from "@/modules/opportunity/repository"
import { computeMatchScore } from "@/modules/discovery/matching"
import {
  createApplication,
  findApplicationByUserAndOpportunity,
  findApplicationsByUser,
  findApplicationsByOpportunity,
  updateApplicationStatus,
  withdrawApplication,
} from "./repository"
import type { ApplicationDTO, ApplyInput, ReviewApplicationInput } from "./types"

export async function applyToOpportunity(
  userId: string,
  input: ApplyInput
): Promise<{ success: true; application: ApplicationDTO } | { success: false; error: string }> {
  const [volunteer, opportunity] = await Promise.all([
    findVolunteerByUserId(userId),
    findOpportunityById(input.opportunityId),
  ])

  if (!volunteer) return { success: false, error: "Complete your volunteer profile before applying." }
  if (!opportunity) return { success: false, error: "Opportunity not found." }
  if (opportunity.status !== "open") return { success: false, error: "This opportunity is not accepting applications." }

  // Completeness check
  if (volunteer.completenessScore < 100) {
    return { success: false, error: "Your profile must be 100% complete before applying." }
  }

  // Duplicate check
  const existing = await findApplicationByUserAndOpportunity(userId, input.opportunityId)
  if (existing) {
    if (existing.status === "rejected" && !existing.reapplicationAllowed) {
      return { success: false, error: "You cannot re-apply to this mission." }
    }
    if (existing.status !== "rejected" && existing.status !== "withdrawn") {
      return { success: false, error: "You have already applied to this mission." }
    }
  }

  const volunteerLoc = volunteer.location
    ? { lat: volunteer.location.lat ?? 0, lng: volunteer.location.lng ?? 0 }
    : undefined
  const { score, breakdown } = computeMatchScore(
    {
      skills: volunteer.skills,
      interests: volunteer.interests,
      location: volunteerLoc,
      availability: volunteer.availability,
    },
    {
      skills: opportunity.skills,
      interests: opportunity.interests,
      location: { lat: opportunity.location.lat, lng: opportunity.location.lng },
      schedule: opportunity.schedule,
    }
  )

  const application = await createApplication({
    opportunityId: input.opportunityId,
    volunteerId: volunteer.id,
    userId,
    matchScore: score,
    scoreBreakdown: breakdown,
    motivation: input.motivation,
  })

  // Fire-and-forget counter increment
  incrementApplicationCount(input.opportunityId).catch(console.error)

  return { success: true, application }
}

export async function getMyApplications(userId: string): Promise<ApplicationDTO[]> {
  return findApplicationsByUser(userId)
}

export async function getApplicationsForOpportunity(
  opportunityId: string,
  requestingUserId: string,
  requestingUserOrgIds: string[]
): Promise<{ success: true; applications: ApplicationDTO[] } | { success: false; error: string }> {
  const opportunity = await findOpportunityById(opportunityId)
  if (!opportunity) return { success: false, error: "Opportunity not found." }
  if (!requestingUserOrgIds.includes(opportunity.organizationId)) {
    return { success: false, error: "Forbidden." }
  }
  const applications = await findApplicationsByOpportunity(opportunityId)
  return { success: true, applications }
}

export async function reviewApplication(
  applicationId: string,
  reviewedBy: string,
  input: ReviewApplicationInput
): Promise<{ success: true; application: ApplicationDTO } | { success: false; error: string }> {
  const updated = await updateApplicationStatus(applicationId, reviewedBy, input)
  if (!updated) return { success: false, error: "Application not found." }
  return { success: true, application: updated }
}

export async function withdrawMyApplication(
  applicationId: string,
  userId: string
): Promise<{ success: true } | { success: false; error: string }> {
  const ok = await withdrawApplication(applicationId, userId)
  return ok ? { success: true } : { success: false, error: "Cannot withdraw this application." }
}
