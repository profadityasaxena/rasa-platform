import { listOpenOpportunities } from "@/modules/opportunity/repository"
import { findVolunteerByUserId } from "@/modules/volunteer/repository"
import { computeMatchScore } from "./matching"
import type { OpportunityDTO } from "@/modules/opportunity/types"

export interface OpportunityWithScore extends OpportunityDTO {
  matchScore: number
  scoreBreakdown: {
    skillCoverage: number
    interestAlignment: number
    locationDecay: number
    availabilityOverlap: number
  }
}

export async function getRecommendations(
  userId: string,
  filters?: { city?: string; skills?: string[]; page?: number }
): Promise<OpportunityWithScore[]> {
  const [volunteer, opportunities] = await Promise.all([
    findVolunteerByUserId(userId),
    listOpenOpportunities({ city: filters?.city, skills: filters?.skills, limit: 50 }),
  ])

  const volunteerLoc = volunteer?.location
    ? { lat: volunteer.location.lat ?? 0, lng: volunteer.location.lng ?? 0 }
    : undefined
  const volunteerFeatures = {
    skills: volunteer?.skills ?? [],
    interests: volunteer?.interests ?? [],
    location: volunteerLoc,
    availability: volunteer?.availability ?? [],
  }

  const scored = opportunities.map((opp) => {
    const { score, breakdown } = computeMatchScore(volunteerFeatures, {
      skills: opp.skills,
      interests: opp.interests,
      location: opp.location,
      schedule: opp.schedule,
    })
    return { ...opp, matchScore: score, scoreBreakdown: breakdown }
  })

  return scored.sort((a, b) => b.matchScore - a.matchScore)
}

export async function searchOpportunities(filters: {
  city?: string
  skills?: string[]
  page?: number
}): Promise<OpportunityDTO[]> {
  return listOpenOpportunities(filters)
}
