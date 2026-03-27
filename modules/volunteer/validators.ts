import { z } from "zod"

export const availabilitySlotSchema = z.object({
  day: z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
  start: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:MM"),
  end: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:MM"),
})

export const locationSchema = z.object({
  street: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
})

export const updateVolunteerProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  skills: z.array(z.string().min(1).max(50)).max(20).optional(),
  interests: z.array(z.string().min(1).max(50)).max(20).optional(),
  location: locationSchema.optional(),
  availability: z.array(availabilitySlotSchema).max(14).optional(),
  languages: z.array(z.string().min(1)).max(10).optional(),
  profilePhotoUrl: z.string().url().optional(),
})
