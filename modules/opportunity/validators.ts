import { z } from "zod"

const locationSchema = z.object({
  street: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
})

const scheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:MM"),
})

export const createOpportunitySchema = z.object({
  organizationId: z.string().min(1),
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(3000),
  skills: z.array(z.string()).max(20).optional(),
  interests: z.array(z.string()).max(20).optional(),
  location: locationSchema,
  schedule: scheduleSchema,
  capacity: z.number().int().min(1).max(1000),
  estimatedDurationMinutes: z.number().int().min(1).max(1440),
  applicationDeadline: z.string().optional(),
})

export const updateOpportunitySchema = createOpportunitySchema
  .omit({ organizationId: true })
  .partial()
  .extend({
    status: z.enum(["draft", "open", "in_progress", "completed", "cancelled"]).optional(),
  })
