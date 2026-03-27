export type OpportunityStatus = "draft" | "open" | "in_progress" | "completed" | "cancelled"

export interface OpportunitySchedule {
  date: string // ISO date string
  startTime: string
  endTime: string
  durationHours: number
}

export interface OpportunityLocation {
  street?: string
  city: string
  province?: string
  postalCode?: string
  country?: string
  address?: string   // legacy / formatted address from geocoder
  lat: number
  lng: number
}

export interface OpportunityDTO {
  id: string
  organizationId: string
  title: string
  description: string
  status: OpportunityStatus
  skills: string[]
  interests: string[]
  location: OpportunityLocation
  schedule: OpportunitySchedule
  capacity: number
  estimatedDurationMinutes: number
  totalCreditsPool: number
  applicationDeadline?: string
  applicationCount: number
  confirmedCount: number
  createdAt: string
}

export type LocationFormInput = {
  street?: string
  city: string
  province?: string
  postalCode?: string
  country?: string
  address?: string
  lat?: number
  lng?: number
}

export interface CreateOpportunityInput {
  organizationId: string
  title: string
  description: string
  skills?: string[]
  interests?: string[]
  location: LocationFormInput
  schedule: Omit<OpportunitySchedule, "durationHours">
  capacity: number
  estimatedDurationMinutes: number
  applicationDeadline?: string
}

export interface UpdateOpportunityInput {
  title?: string
  description?: string
  skills?: string[]
  interests?: string[]
  location?: LocationFormInput
  schedule?: Omit<OpportunitySchedule, "durationHours">
  capacity?: number
  estimatedDurationMinutes?: number
  applicationDeadline?: string
  status?: OpportunityStatus
}
