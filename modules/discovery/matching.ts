/**
 * RASA Matching Score Algorithm
 *
 * MatchScore = 0.35×skill_coverage + 0.25×interest_alignment + 0.25×location_decay + 0.15×availability_overlap
 *
 * - skill_coverage      : Jaccard similarity between volunteer skills and opportunity required skills
 * - interest_alignment  : Jaccard similarity between volunteer interests and opportunity interest tags
 * - location_decay      : e^(-distance_km / 15)  — drops to 0.5 at ~10km, near-zero at 50km
 * - availability_overlap: fraction of opportunity time window that overlaps volunteer's available hours
 */

interface VolunteerFeatures {
  skills: string[]
  interests: string[]
  location?: { lat: number; lng: number }
  availability: { day: string; start: string; end: string }[]
}

interface OpportunityFeatures {
  skills: string[]
  interests: string[]
  location: { lat: number; lng: number }
  schedule: { date: string; startTime: string; endTime: string; durationHours: number }
}

export interface ScoreBreakdown {
  skillCoverage: number
  interestAlignment: number
  locationDecay: number
  availabilityOverlap: number
}

export interface MatchResult {
  score: number
  breakdown: ScoreBreakdown
}

// Jaccard index: |A ∩ B| / |A ∪ B|
function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1
  if (a.length === 0 || b.length === 0) return 0
  const setA = new Set(a.map((s) => s.toLowerCase()))
  const setB = new Set(b.map((s) => s.toLowerCase()))
  let intersection = 0
  for (const item of setA) if (setB.has(item)) intersection++
  const union = setA.size + setB.size - intersection
  return union === 0 ? 0 : intersection / union
}

// Haversine distance in km
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}

// Exponential decay: 1.0 at 0km, ~0.5 at 10km, ~0 at 50km
function locationDecay(distKm: number): number {
  return Math.exp(-distKm / 15)
}

// Convert "HH:MM" to minutes from midnight
function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

// Day of week from ISO date string (0=Sun, 1=Mon, …)
const DAY_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

function availabilityOverlap(
  volunteer: VolunteerFeatures["availability"],
  schedule: OpportunityFeatures["schedule"]
): number {
  if (volunteer.length === 0) return 0
  const date = new Date(schedule.date)
  const dayName = DAY_NAMES[date.getDay()]
  const oppStart = toMinutes(schedule.startTime)
  const oppEnd = toMinutes(schedule.endTime)
  const oppDuration = Math.max(1, oppEnd - oppStart)

  const slots = volunteer.filter((s) => s.day === dayName)
  if (slots.length === 0) return 0

  let overlapMinutes = 0
  for (const slot of slots) {
    const slotStart = toMinutes(slot.start)
    const slotEnd = toMinutes(slot.end)
    const overlapStart = Math.max(oppStart, slotStart)
    const overlapEnd = Math.min(oppEnd, slotEnd)
    if (overlapEnd > overlapStart) overlapMinutes += overlapEnd - overlapStart
  }
  return Math.min(1, overlapMinutes / oppDuration)
}

export function computeMatchScore(
  volunteer: VolunteerFeatures,
  opportunity: OpportunityFeatures
): MatchResult {
  const skillCoverage = jaccard(volunteer.skills, opportunity.skills)
  const interestAlignment = jaccard(volunteer.interests, opportunity.interests)

  let locDecay = 0.5 // default when location not provided
  if (volunteer.location) {
    const km = haversineKm(
      volunteer.location.lat,
      volunteer.location.lng,
      opportunity.location.lat,
      opportunity.location.lng
    )
    locDecay = locationDecay(km)
  }

  const avail = availabilityOverlap(volunteer.availability, opportunity.schedule)

  const score =
    0.35 * skillCoverage +
    0.25 * interestAlignment +
    0.25 * locDecay +
    0.15 * avail

  return {
    score: Math.round(score * 1000) / 1000,
    breakdown: {
      skillCoverage: Math.round(skillCoverage * 1000) / 1000,
      interestAlignment: Math.round(interestAlignment * 1000) / 1000,
      locationDecay: Math.round(locDecay * 1000) / 1000,
      availabilityOverlap: Math.round(avail * 1000) / 1000,
    },
  }
}
