import { z } from "zod"

export const applySchema = z.object({
  opportunityId: z.string().min(1),
  motivation: z.string().max(500).optional(),
})

export const reviewApplicationSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
  reapplicationAllowed: z.boolean().optional(),
})
