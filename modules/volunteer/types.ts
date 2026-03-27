export interface AvailabilitySlot {
  day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"
  start: string
  end: string
}

export interface VolunteerLocation {
  street?: string
  city: string
  province?: string
  postalCode?: string
  country?: string
  lat?: number
  lng?: number
}

export interface VolunteerProfile {
  id: string
  userId: string
  bio?: string
  skills: string[]
  interests: string[]
  location?: VolunteerLocation
  availability: AvailabilitySlot[]
  languages: string[]
  profilePhotoUrl?: string
  completenessScore: number
  totalHours: number
  totalCredits: number
}

export interface UpdateVolunteerProfileInput {
  bio?: string
  skills?: string[]
  interests?: string[]
  location?: VolunteerLocation
  availability?: AvailabilitySlot[]
  languages?: string[]
  profilePhotoUrl?: string
}
