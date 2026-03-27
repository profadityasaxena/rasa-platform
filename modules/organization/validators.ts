import { z } from "zod"

const ORG_TYPES = ["ngo", "corporation", "government", "university", "marketplace_partner"] as const

const headquartersSchema = z.object({
  street: z.string().optional(),
  city: z.string().min(1),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
})

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().max(1000).optional(),
  mission: z.string().max(1000).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  headquarters: headquartersSchema.optional(),
  focusAreas: z.array(z.string()).optional(),
  sdgAlignment: z.array(z.string()).optional(),
})

// Used internally (platform admin creates org on approval)
export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(200),
  type: z.enum(ORG_TYPES),
  description: z.string().max(1000).optional(),
  mission: z.string().max(1000).optional(),
  website: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  headquarters: headquartersSchema.optional(),
  focusAreas: z.array(z.string()).optional(),
  sdgAlignment: z.array(z.string()).optional(),
})

// Used for public organization onboarding request form
export const submitOrgRequestSchema = z.object({
  organizationType: z.enum(ORG_TYPES),
  name: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  mission: z.string().max(1000).optional(),
  website: z.string().url().optional().or(z.literal("")),
  contactName: z.string().min(2).max(200),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  headquartersCity: z.string().optional(),
  headquartersCountry: z.string().optional(),
  purposeStatement: z.string().max(2000).optional(),
})

export const reviewOrgRequestSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  reviewNotes: z.string().max(2000).optional(),
})
