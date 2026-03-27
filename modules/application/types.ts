export type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "attended"
  | "no_show"

export interface ApplicationDTO {
  id: string
  opportunityId: string
  volunteerId: string
  userId: string
  status: ApplicationStatus
  matchScore: number
  scoreBreakdown: {
    skillCoverage: number
    interestAlignment: number
    locationDecay: number
    availabilityOverlap: number
  }
  motivation?: string
  reapplicationAllowed: boolean
  createdAt: string
}

export interface ApplyInput {
  opportunityId: string
  motivation?: string
}

export interface ReviewApplicationInput {
  status: "accepted" | "rejected"
  reapplicationAllowed?: boolean
}
